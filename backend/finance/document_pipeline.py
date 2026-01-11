# backend/finance/documents_pipeline.py
"""
Instant document pipeline:
- Reads PDFs from backend/data/income.pdf and backend/data/balance.pdf
- Computes the SAME extracted metrics + component scores you had before
- Returns just the pieces you want:
    1) cash_flow_volatility_proxy_score (0-100)
    2) combined_strength_profitability_score (0-100)  <-- avg of:
          profitability_trend_score and balance_sheet_strength_score

Notes:
- This runs "instantly" in-process (no CSV dependency).
- If you still want CSV exports for debugging, set EXPORT_CSVS=True.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

import pdfplumber

# ---------------------- Robust paths ----------------------
THIS_FILE = Path(__file__).resolve()
BACKEND_DIR = THIS_FILE.parents[1]  # .../backend
DATA_DIR = BACKEND_DIR / "data"
EXPORT_DIR = BACKEND_DIR / "exports"
EXPORT_DIR.mkdir(exist_ok=True)

INCOME_PDF = DATA_DIR / "income.pdf"
BALANCE_PDF = DATA_DIR / "balance.pdf"

DEMO_CSV = EXPORT_DIR / "demo.csv"
FEATURES_CSV = EXPORT_DIR / "demo_scoring_features.csv"

EXPORT_CSVS = False  # flip to True if you want debug CSVs written

MONEY_RE = re.compile(r"(\(?-?\$?[\d,]+(?:\.\d+)?\)?)")


# ---------------------- helpers ----------------------
def _extract_text(pdf_path: Path) -> str:
    parts: List[str] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n".join(parts)


def _parse_money(tok: str) -> Optional[float]:
    tok = tok.strip()
    neg = False
    if tok.startswith("(") and tok.endswith(")"):
        neg = True
        tok = tok[1:-1]
    tok = tok.replace("$", "").replace(",", "")
    if tok.startswith("-"):
        neg = True
        tok = tok[1:]
    try:
        v = float(tok)
        return -v if neg else v
    except Exception:
        return None


def _find_values_on_line(text: str, label: str) -> List[float]:
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if label.lower() in line.lower():
            nums = MONEY_RE.findall(line)
            vals = [_parse_money(n) for n in nums]
            return [v for v in vals if v is not None]
    return []


def _safe_div(a, b) -> Optional[float]:
    if a is None or b in (None, 0):
        return None
    return a / b


def _clamp(x: Optional[float], lo=0.0, hi=100.0) -> Optional[float]:
    if x is None:
        return None
    return max(lo, min(hi, x))


# ---------------------- metric extraction ----------------------
def _extract_income_metrics(income_text: str) -> Dict[str, Any]:
    # Your demo income.pdf is two columns (2003, 2004)
    prev_year, latest_year = "2003", "2004"

    def two_year(label: str):
        vals = _find_values_on_line(income_text, label)
        if len(vals) >= 2:
            return vals[0], vals[1]
        return None, None

    total_sales_prev, total_sales_latest = two_year("Total Sales")
    total_exp_prev, total_exp_latest = two_year("Total Expenses")
    op_inc_prev, op_inc_latest = two_year("Operating Income")
    nonop_prev, nonop_latest = two_year("Total Non-Operating Gains")
    net_prev, net_latest = two_year("Net Income")

    income = {
        "prev_year": prev_year,
        "latest_year": latest_year,
        "total_sales_prev": total_sales_prev,
        "total_sales_latest": total_sales_latest,
        "total_sales_delta": None if (total_sales_prev is None or total_sales_latest is None) else (total_sales_latest - total_sales_prev),
        "total_expenses_prev": total_exp_prev,
        "total_expenses_latest": total_exp_latest,
        "total_expenses_delta": None if (total_exp_prev is None or total_exp_latest is None) else (total_exp_latest - total_exp_prev),
        "operating_income_prev": op_inc_prev,
        "operating_income_latest": op_inc_latest,
        "operating_income_delta": None if (op_inc_prev is None or op_inc_latest is None) else (op_inc_latest - op_inc_prev),
        "total_non_operating_gains_prev": nonop_prev,
        "total_non_operating_gains_latest": nonop_latest,
        "total_non_operating_gains_delta": None if (nonop_prev is None or nonop_latest is None) else (nonop_latest - nonop_prev),
        "net_income_prev": net_prev,
        "net_income_latest": net_latest,
        "net_income_delta": None if (net_prev is None or net_latest is None) else (net_latest - net_prev),
    }

    def vol(a, b):
        if a is None or b is None:
            return None
        avg = (abs(a) + abs(b)) / 2.0
        if avg == 0:
            return None
        return abs(b - a) / avg

    income["sales_volatility_proxy"] = vol(total_sales_prev, total_sales_latest)
    income["operating_income_volatility_proxy"] = vol(op_inc_prev, op_inc_latest)
    income["net_income_volatility_proxy"] = vol(net_prev, net_latest)

    income["operating_margin_latest"] = _safe_div(op_inc_latest, total_sales_latest)
    income["net_margin_latest"] = _safe_div(net_latest, total_sales_latest)

    return income


def _extract_balance_metrics(balance_text: str) -> Dict[str, Any]:
    def single(label: str):
        vals = _find_values_on_line(balance_text, label)
        return vals[-1] if vals else None

    bal = {
        "total_current_assets": single("Total Current Assets"),
        "total_non_current_assets": single("Total Non-Current Assets"),
        "total_assets": single("Total Assets"),
        "total_current_liabilities": single("Total Current Liabilities"),
        "total_non_current_liabilities": single("Total Non-Current Liabilities"),
        "total_liabilities": single("Total Liabilities"),
        "total_equity": single("Total Equity"),
        "total_liabilities_and_equity": single("Total Liabilities and Equity"),
    }

    bal["current_ratio"] = _safe_div(bal["total_current_assets"], bal["total_current_liabilities"])
    bal["debt_to_assets"] = _safe_div(bal["total_liabilities"], bal["total_assets"])
    bal["equity_to_assets"] = _safe_div(bal["total_equity"], bal["total_assets"])

    if bal["total_assets"] is not None and bal["total_liabilities_and_equity"] is not None:
        bal["balance_identity_error"] = bal["total_assets"] - bal["total_liabilities_and_equity"]
    else:
        bal["balance_identity_error"] = None

    return bal


# ---------------------- scoring ----------------------
def _score_documents_components(income: Dict[str, Any], balance: Dict[str, Any]) -> Dict[str, float]:
    # (1) volatility proxy score
    v = income.get("net_income_volatility_proxy")
    if v is None:
        v = income.get("operating_income_volatility_proxy")
    if v is None:
        v = income.get("sales_volatility_proxy")

    vol_score = 50.0 if v is None else float(_clamp(100 - (float(v) * 100)))

    # (2) profitability/trend score
    net_margin = income.get("net_margin_latest")
    net_delta = income.get("net_income_delta")

    if net_margin is None:
        margin_score = 50.0
    else:
        nm = float(net_margin)
        if nm <= 0:
            margin_score = 30.0
        elif nm < 0.05:
            margin_score = 30 + (nm / 0.05) * 30
        elif nm < 0.10:
            margin_score = 60 + ((nm - 0.05) / 0.05) * 20
        elif nm < 0.20:
            margin_score = 80 + ((nm - 0.10) / 0.10) * 15
        else:
            margin_score = 95.0

    sales_latest = income.get("total_sales_latest")
    if net_delta is None or sales_latest in (None, 0):
        delta_score = 50.0
    else:
        delta_ratio = float(net_delta) / float(sales_latest)
        if delta_ratio <= -0.05:
            delta_score = 20.0
        elif delta_ratio < 0:
            delta_score = 20 + ((delta_ratio + 0.05) / 0.05) * 30
        elif delta_ratio < 0.05:
            delta_score = 50 + (delta_ratio / 0.05) * 30
        elif delta_ratio < 0.10:
            delta_score = 80 + ((delta_ratio - 0.05) / 0.05) * 15
        else:
            delta_score = 95.0

    profit_trend_score = (0.60 * margin_score) + (0.40 * delta_score)

    # (3) balance strength score
    current_ratio = balance.get("current_ratio")
    debt_to_assets = balance.get("debt_to_assets")
    identity_err = balance.get("balance_identity_error")

    if current_ratio is None:
        cr_score = 50.0
    else:
        cr = float(current_ratio)
        if cr < 1.0:
            cr_score = 35.0 + (cr / 1.0) * 15.0
        elif cr < 1.5:
            cr_score = 50.0 + ((cr - 1.0) / 0.5) * 20.0
        elif cr < 2.0:
            cr_score = 70.0 + ((cr - 1.5) / 0.5) * 15.0
        elif cr < 3.0:
            cr_score = 85.0 + ((cr - 2.0) / 1.0) * 10.0
        else:
            cr_score = 95.0

    if debt_to_assets is None:
        da_score = 50.0
    else:
        da = float(debt_to_assets)
        if da <= 0.2:
            da_score = 90.0
        elif da <= 0.4:
            da_score = 90.0 - ((da - 0.2) / 0.2) * 20.0
        elif da <= 0.6:
            da_score = 70.0 - ((da - 0.4) / 0.2) * 25.0
        elif da <= 0.8:
            da_score = 45.0 - ((da - 0.6) / 0.2) * 20.0
        else:
            da_score = 20.0

    identity_penalty = 0.0
    if identity_err is not None and abs(float(identity_err)) > 1.0:
        identity_penalty = 10.0

    balance_strength_score = max(0.0, (0.55 * cr_score + 0.45 * da_score) - identity_penalty)

    return {
        "cash_flow_volatility_proxy_score": round(vol_score, 2),
        "profitability_trend_score": round(profit_trend_score, 2),
        "balance_sheet_strength_score": round(balance_strength_score, 2),
    }


def _maybe_export_debug_csvs(income: Dict[str, Any], balance: Dict[str, Any], comps: Dict[str, float]) -> None:
    if not EXPORT_CSVS:
        return

    # demo.csv
    with open(DEMO_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["statement_type", "year", "metric_key", "value", "source_file"])

        for yr in [income["prev_year"], income["latest_year"]]:
            keymap = {
                "total_sales": "total_sales_prev" if yr == income["prev_year"] else "total_sales_latest",
                "total_expenses": "total_expenses_prev" if yr == income["prev_year"] else "total_expenses_latest",
                "operating_income": "operating_income_prev" if yr == income["prev_year"] else "operating_income_latest",
                "total_non_operating_gains": "total_non_operating_gains_prev" if yr == income["prev_year"] else "total_non_operating_gains_latest",
                "net_income": "net_income_prev" if yr == income["prev_year"] else "net_income_latest",
            }
            for out_key, in_key in keymap.items():
                w.writerow(["income_statement", yr, out_key, income.get(in_key), INCOME_PDF.name])

        for k in [
            "total_current_assets", "total_non_current_assets", "total_assets",
            "total_current_liabilities", "total_non_current_liabilities", "total_liabilities",
            "total_equity", "total_liabilities_and_equity",
        ]:
            w.writerow(["balance_sheet", "unknown", k, balance.get(k), BALANCE_PDF.name])

    # demo_scoring_features.csv
    with open(FEATURES_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["feature_key", "feature_value"])
        for k, v in comps.items():
            w.writerow([k, v])


# ---------------------- public API ----------------------
def get_document_display_values() -> Dict[str, float]:
    """
    Returns exactly what you asked for:

    - doc_cash_flow_volatility (0-100)
    - doc_strength_profitability (0-100) = average of:
        profitability_trend_score and balance_sheet_strength_score
      (keeps it on a 0-100 scale so it’s easy to show in UI)
    """
    if not INCOME_PDF.exists():
        raise FileNotFoundError(f"Missing income PDF: {INCOME_PDF}")
    if not BALANCE_PDF.exists():
        raise FileNotFoundError(f"Missing balance PDF: {BALANCE_PDF}")

    income_text = _extract_text(INCOME_PDF)
    balance_text = _extract_text(BALANCE_PDF)

    income = _extract_income_metrics(income_text)
    balance = _extract_balance_metrics(balance_text)

    comps = _score_documents_components(income, balance)

    strength_profitability = (comps["profitability_trend_score"] + comps["balance_sheet_strength_score"]) / 2.0

    _maybe_export_debug_csvs(income, balance, comps)

    return {
        "doc_cash_flow_volatility": round(comps["cash_flow_volatility_proxy_score"], 2),
        "doc_strength_profitability": round(strength_profitability, 2),
        # optional: keep the raw parts in case you want to show them later
        "profitability_trend_score": comps["profitability_trend_score"],
        "balance_sheet_strength_score": comps["balance_sheet_strength_score"],
    }

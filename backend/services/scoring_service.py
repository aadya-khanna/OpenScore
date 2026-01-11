"""Scoring logic based on Plaid transactions."""
import logging
import requests
from datetime import date, timedelta
from typing import Optional, Tuple, List, Dict, Any
from config import Config

# IMPORTANT: this should match your actual file name
# (you wrote "finance.document_pipeline" in your snippet)
from finance.document_pipeline import get_document_display_values

logger = logging.getLogger(__name__)

# Plaid REST API configuration
BASE_URLS = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com",
}

HEADERS = {
    "Content-Type": "application/json",
}


def get_plaid_base_url() -> str:
    """Get the base URL for Plaid API based on environment."""
    return BASE_URLS.get(Config.PLAID_ENV.lower(), BASE_URLS["sandbox"])


def plaid_post(path: str, payload: dict) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Make a POST request to Plaid API.
    
    Args:
        path: API endpoint path (e.g., "/transactions/get")
        payload: Request payload dictionary
        
    Returns:
        Tuple of (response_data, error_dict). If successful, error_dict is None.
        If error, response_data is None.
    """
    url = f"{get_plaid_base_url()}{path}"
    
    # Add client_id and secret to payload if not present
    if "client_id" not in payload:
        payload["client_id"] = Config.PLAID_CLIENT_ID
    if "secret" not in payload:
        payload["secret"] = Config.PLAID_SECRET
    
    try:
        r = requests.post(url, json=payload, headers=HEADERS, timeout=30)
        try:
            data = r.json()
        except Exception:
            data = {"error": "Non-JSON response", "text": r.text}
        
        if r.status_code >= 400:
            # Plaid errors are in the response body, extract them properly
            error_info = {
                "status": r.status_code,
                "response": data
            }
            # Plaid error structure: {"error_code": "...", "error_message": "..."}
            if isinstance(data, dict):
                if "error_code" in data:
                    error_info["error_code"] = data["error_code"]
                if "error_message" in data:
                    error_info["error_message"] = data["error_message"]
            return None, error_info
        
        return data, None
    except Exception as e:
        logger.error(f"Plaid API request failed: {e}")
        return None, {"error": str(e), "error_code": "REQUEST_FAILED"}


def create_sandbox_public_token(
    institution_id: str = "ins_109508",
    initial_products: Optional[List[str]] = None,
    income_verification: Optional[Dict[str, Any]] = None
) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
    """
    Create a sandbox public token (Sandbox-only, for testing).
    
    Args:
        institution_id: Sandbox institution ID
        initial_products: List of products (e.g., ["auth", "transactions", "income_verification"])
        income_verification: Optional income verification configuration dict.
            Example: {
                "income_source_types": ["bank", "payroll"],
                "bank_income": {"days_requested": 730},
                "payroll_income": {"flow_types": ["payroll_digital_income", "payroll_document_income"]}
            }
        
    Returns:
        Tuple of (public_token, error_dict)
    """
    if Config.PLAID_ENV.lower() != "sandbox":
        return None, {"error": "create_sandbox_public_token only works in sandbox environment"}
    
    if initial_products is None:
        initial_products = ["auth", "transactions"]
    
    sandbox_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "initial_products": initial_products,
        "institution_id": institution_id,
    }
    
    # Note: income_verification configuration is not supported in sandbox/public_token/create
    # It must be configured when creating a link token via /link/token/create
    # For sandbox testing, we'll just include income_verification in products
    # The actual income_verification config would be set up via Link token creation
    
    sandbox_resp, err = plaid_post("/sandbox/public_token/create", sandbox_payload)
    if err:
        return None, err
    
    return sandbox_resp.get("public_token"), None


def exchange_public_token(public_token: str) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
    """
    Exchange a public token for an access token.
    
    Args:
        public_token: Public token from Plaid Link
        
    Returns:
        Tuple of (access_token, error_dict)
    """
    exchange_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "public_token": public_token,
    }
    
    exchange_resp, err = plaid_post("/item/public_token/exchange", exchange_payload)
    if err:
        return None, err
    
    return exchange_resp.get("access_token"), None


def get_accounts(access_token: str) -> Tuple[Optional[List[Dict[str, Any]]], Optional[Dict[str, Any]]]:
    """
    Fetch accounts for an access token.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        Tuple of (accounts_list, error_dict)
    """
    accounts_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
    }
    
    accounts_resp, err = plaid_post("/accounts/get", accounts_payload)
    if err:
        return None, err
    
    # Extract relevant account information
    accounts = []
    for a in accounts_resp.get("accounts", []):
        accounts.append({
            "account_id": a.get("account_id"),
            "name": a.get("name"),
            "type": a.get("type"),
            "subtype": a.get("subtype"),
            "balances": a.get("balances"),
            "mask": a.get("mask"),
            "official_name": a.get("official_name"),
        })
    
    return accounts, None


def refresh_transactions(access_token: str) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Trigger a refresh of transactions for an access token.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        Tuple of (response_data, error_dict)
    """
    refresh_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
    }
    
    return plaid_post("/transactions/refresh", refresh_payload)


def get_transactions(
    access_token: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    count: int = 500,
    offset: int = 0,
    auto_refresh: bool = True
) -> Tuple[Optional[List[Dict[str, Any]]], Optional[Dict[str, Any]]]:
    """
    Fetch transactions for an access token.
    
    Args:
        access_token: Plaid access token
        start_date: Start date for transactions (defaults to 90 days ago)
        end_date: End date for transactions (defaults to today)
        count: Number of transactions to fetch (max 500)
        offset: Offset for pagination
        auto_refresh: If True, automatically refresh transactions if PRODUCT_NOT_READY error occurs
        
    Returns:
        Tuple of (transactions_list, error_dict)
    """
    if start_date is None:
        start_date = date.today() - timedelta(days=90)
    if end_date is None:
        end_date = date.today()
    
    transactions_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "options": {
            "count": min(count, 500),
            "offset": offset
        }
    }
    
    transactions_resp, err = plaid_post("/transactions/get", transactions_payload)
    
    # Check for PRODUCT_NOT_READY error and auto-refresh if enabled
    if err and auto_refresh:
        # Check both direct error_code and nested in response
        error_code = err.get("error_code") or err.get("response", {}).get("error_code")
        if error_code == "PRODUCT_NOT_READY":
            logger.info("Transactions not ready, attempting to refresh...")
            refresh_resp, refresh_err = refresh_transactions(access_token)
            if refresh_err:
                logger.warning(f"Failed to refresh transactions: {refresh_err}")
            else:
                logger.info("Transaction refresh initiated, retrying after 2 seconds...")
                # Retry the request after a brief moment
                import time
                time.sleep(2)
                transactions_resp, err = plaid_post("/transactions/get", transactions_payload)
    
    if err:
        # Extract more detailed error information
        # Error code can be at top level or nested in response
        error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
        error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
        detailed_error = {
            "error_code": error_code,
            "error_message": error_message,
            "full_error": err
        }
        logger.error(f"Failed to get transactions: {error_code} - {error_message}")
        return None, detailed_error
    
    if not transactions_resp:
        return None, {"error": "Empty response from Plaid API"}
    
    transactions = transactions_resp.get("transactions", [])
    if transactions is None:
        transactions = []
    
    return transactions, None


def get_balance(access_token: str, account_ids: Optional[List[str]] = None) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get real-time balance for accounts.
    
    Args:
        access_token: Plaid access token
        account_ids: Optional list of specific account IDs to fetch. If None, fetches all accounts.
        
    Returns:
        Tuple of (balance_data, error_dict)
    """
    balance_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
    }
    
    if account_ids:
        balance_payload["account_ids"] = account_ids
    
    balance_resp, err = plaid_post("/accounts/balance/get", balance_payload)
    if err:
        error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
        error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
        logger.error(f"Failed to get balance: {error_code} - {error_message}")
        return None, {"error_code": error_code, "error_message": error_message, "full_error": err}
    
    return balance_resp, None


def get_liabilities(access_token: str) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get liabilities data for an access token.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        Tuple of (liabilities_data, error_dict)
    """
    liabilities_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
    }
    
    liabilities_resp, err = plaid_post("/liabilities/get", liabilities_payload)
    if err:
        error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
        error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
        logger.error(f"Failed to get liabilities: {error_code} - {error_message}")
        return None, {"error_code": error_code, "error_message": error_message, "full_error": err}
    
    return liabilities_resp, None


def get_investments_holdings(access_token: str, account_ids: Optional[List[str]] = None) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get investment holdings for an access token.
    
    Args:
        access_token: Plaid access token
        account_ids: Optional list of specific account IDs to fetch. If None, fetches all accounts.
        
    Returns:
        Tuple of (holdings_data, error_dict)
    """
    holdings_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
    }
    
    if account_ids:
        holdings_payload["account_ids"] = account_ids
    
    holdings_resp, err = plaid_post("/investments/holdings/get", holdings_payload)
    if err:
        error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
        error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
        logger.error(f"Failed to get investment holdings: {error_code} - {error_message}")
        return None, {"error_code": error_code, "error_message": error_message, "full_error": err}
    
    return holdings_resp, None


def get_investments_transactions(
    access_token: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    account_ids: Optional[List[str]] = None
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Get investment transactions for an access token.
    
    Args:
        access_token: Plaid access token
        start_date: Start date for transactions (defaults to 90 days ago)
        end_date: End date for transactions (defaults to today)
        account_ids: Optional list of specific account IDs to fetch. If None, fetches all accounts.
        
    Returns:
        Tuple of (transactions_data, error_dict)
    """
    if start_date is None:
        start_date = date.today() - timedelta(days=90)
    if end_date is None:
        end_date = date.today()
    
    transactions_payload = {
        "client_id": Config.PLAID_CLIENT_ID,
        "secret": Config.PLAID_SECRET,
        "access_token": access_token,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
    }
    
    if account_ids:
        transactions_payload["account_ids"] = account_ids
    
    transactions_resp, err = plaid_post("/investments/transactions/get", transactions_payload)
    if err:
        error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
        error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
        logger.error(f"Failed to get investment transactions: {error_code} - {error_message}")
        return None, {"error_code": error_code, "error_message": error_message, "full_error": err}
    
    return transactions_resp, None


def calculate_credit_score(
    transactions: List[Dict[str, Any]],
    accounts: Optional[List[Dict[str, Any]]] = None,
    investments: Optional[Dict[str, Any]] = None,
    liabilities: Optional[Dict[str, Any]] = None,
    alternative_income: float = 50000.0,  # Default constant value (placeholder for future calculation)
    education_score: float = 75.0  # Default constant value (0-100)
) -> Dict[str, Any]:
    """
    Calculate credit score based on multiple factors with weighted components.
    
    Weightings:
    - Financial Accounts (Investments, phone, rent, recurring payments) - 40%
    - Alternative Income (Gig income, etc.) - 30%
        * Currently from documents: 60% balance_sheet_strength + 40% profitability_trend
    - Education, Licenses, etc. - 10%
    - Cash Flow Volatility - 20%
        * Currently from documents: doc_cash_flow_volatility
    
    Args:
        transactions: List of Plaid transaction dicts
        accounts: Optional list of account dicts
        investments: Optional investment holdings/transactions data
        liabilities: Optional liabilities data
        alternative_income: Placeholder for future calculation (currently unused, 
            alternative income score is derived from document pipeline)
        education_score: Education/licenses score 0-100 (default: 75)
    
    Returns:
        Dict with credit_score (0-100) and breakdown of components
    """
    # Ensure we have lists
    if accounts is None:
        accounts = []
    
    # --- Document-derived values (PDF pipeline runs here) ---
    doc_vals = get_document_display_values()
    
    # Cash Flow Volatility now comes from document pipeline
    cash_flow_volatility_score = float(doc_vals["doc_cash_flow_volatility"])
    
    # Alternative Income Score = 60% balance_sheet_strength + 40% profitability_trend
    balance_sheet_strength = float(doc_vals.get("balance_sheet_strength_score", 50.0))
    profitability_trend = float(doc_vals.get("profitability_trend_score", 50.0))
    alternative_income_score = (balance_sheet_strength * 0.60) + (profitability_trend * 0.40)
    
    # 1. Financial Accounts Score (40%) - Plaid based
    financial_accounts_score = _calculate_financial_accounts_score(
        transactions, accounts, investments
    )
    
    # 3. Education/Licenses Score (10%) - Use provided value
    education_licenses_score = education_score
    
    # Calculate weighted credit score (KEEP THIS THE SAME)
    credit_score = (
        financial_accounts_score * 0.40 +
        alternative_income_score * 0.30 +
        education_licenses_score * 0.10 +
        cash_flow_volatility_score * 0.20
    )
    
    # Ensure score is between 0 and 100
    credit_score = max(0, min(100, round(credit_score)))
    
    result = {
        "credit_score": credit_score,
        "breakdown": {
            "financial_accounts": {
                "score": round(financial_accounts_score, 2),
                "weight": 40,
                "weighted_contribution": round(financial_accounts_score * 0.40, 2)
            },
            "alternative_income": {
                "score": round(alternative_income_score, 2),
                "weight": 30,
                "weighted_contribution": round(alternative_income_score * 0.30, 2),
                # keep the old key name "amount" even though it's now computed from docs,
                # so the response format matches what you had before:
                "amount": round(alternative_income_score, 2)
            },
            "education_licenses": {
                "score": round(education_licenses_score, 2),
                "weight": 10,
                "weighted_contribution": round(education_licenses_score * 0.10, 2)
            },
            "cash_flow_volatility": {
                "score": round(cash_flow_volatility_score, 2),
                "weight": 20,
                "weighted_contribution": round(cash_flow_volatility_score * 0.20, 2)
            }
        }
    }
    
    return result


def _calculate_financial_accounts_score(
    transactions: List[Dict[str, Any]],
    accounts: Optional[List[Dict[str, Any]]],
    investments: Optional[Dict[str, Any]]
) -> float:
    """Calculate financial accounts score (0-100) based on investments, recurring payments, etc."""
    score = 0.0
    max_score = 100.0
    factors = []
    
    # Factor 1: Investment accounts (up to 30 points)
    if investments:
        holdings = investments.get("holdings", [])
        investment_accounts = investments.get("accounts", [])
        if holdings or investment_accounts:
            # Score based on number of investment accounts and holdings
            num_holdings = len(holdings) if holdings else 0
            num_accounts = len(investment_accounts) if investment_accounts else 0
            investment_score = min(30, (num_accounts * 5) + min(15, num_holdings * 2))
            score += investment_score
            factors.append(f"Investments: {investment_score:.1f}/30")
    
    # Factor 2: Recurring payments (phone, rent, subscriptions) (up to 25 points)
    recurring_keywords = ["phone", "rent", "subscription", "netflix", "spotify", "utilities", 
                          "electric", "water", "internet", "cable", "insurance"]
    recurring_count = 0
    recurring_amount = 0.0
    
    for txn in transactions:
        name = str(txn.get("name", "")).lower()
        merchant = str(txn.get("merchant_name", "")).lower()
        category = str(txn.get("category", [""])[0] if isinstance(txn.get("category"), list) else txn.get("category", "")).lower()
        
        # Check if transaction matches recurring payment patterns
        is_recurring = any(keyword in name or keyword in merchant or keyword in category 
                          for keyword in recurring_keywords)
        
        if is_recurring:
            recurring_count += 1
            recurring_amount += abs(float(txn.get("amount", 0)))
    
    # Score based on consistent recurring payments
    if recurring_count >= 3:
        recurring_score = min(25, 15 + min(10, recurring_count * 0.5))
        score += recurring_score
        factors.append(f"Recurring payments: {recurring_score:.1f}/25 ({recurring_count} transactions)")
    
    # Factor 3: Account diversity and balances (up to 25 points)
    if accounts:
        account_types = set()
        total_balance = 0.0
        
        for account in accounts:
            account_type = account.get("type", "")
            account_subtype = account.get("subtype", "")
            account_types.add(f"{account_type}_{account_subtype}")
            
            balances = account.get("balances", {})
            available = balances.get("available", 0) or 0
            current = balances.get("current", 0) or 0
            total_balance += float(current if current else available)
        
        # Score based on account diversity
        diversity_score = min(15, len(account_types) * 3)
        score += diversity_score
        
        # Score based on total balance (capped)
        balance_score = min(10, total_balance / 10000)  # $10k = 10 points
        score += balance_score
        factors.append(f"Account diversity: {diversity_score:.1f}/15, Balance: {balance_score:.1f}/10")
    
    # Factor 4: Payment history consistency (up to 20 points)
    if len(transactions) >= 10:
        # Check for consistent transaction frequency
        transaction_dates = [txn.get("date") for txn in transactions if txn.get("date")]
        if len(transaction_dates) >= 10:
            # Simple consistency check - more transactions = better
            consistency_score = min(20, len(transactions) / 5)
            score += consistency_score
            factors.append(f"Payment history: {consistency_score:.1f}/20")
    
    return min(max_score, score)


def _calculate_alternative_income_score(alternative_income: float) -> float:
    """Calculate alternative income score (0-100) based on income amount."""
    # Score based on income tiers
    # $0-20k: 0-40 points
    # $20k-50k: 40-70 points
    # $50k-100k: 70-90 points
    # $100k+: 90-100 points
    
    if alternative_income <= 0:
        return 0.0
    elif alternative_income < 20000:
        return (alternative_income / 20000) * 40
    elif alternative_income < 50000:
        return 40 + ((alternative_income - 20000) / 30000) * 30
    elif alternative_income < 100000:
        return 70 + ((alternative_income - 50000) / 50000) * 20
    else:
        return 90 + min(10, (alternative_income - 100000) / 100000 * 10)


def _calculate_cash_flow_volatility_score(transactions: List[Dict[str, Any]]) -> float:
    """Calculate cash flow volatility score (0-100). Lower volatility = higher score."""
    if not transactions or len(transactions) < 3:
        return 50.0  # Neutral score for insufficient data
    
    # Calculate monthly income/expense patterns
    monthly_flows = {}
    
    for txn in transactions:
        date_str = txn.get("date", "")
        if not date_str:
            continue
        
        try:
            # Extract year-month from date (YYYY-MM-DD)
            year_month = date_str[:7]
            amount = float(txn.get("amount", 0))
            
            if year_month not in monthly_flows:
                monthly_flows[year_month] = {"income": 0.0, "expenses": 0.0, "count": 0}
            
            if amount > 0:
                monthly_flows[year_month]["income"] += amount
            else:
                monthly_flows[year_month]["expenses"] += abs(amount)
            
            monthly_flows[year_month]["count"] += 1
        except (ValueError, IndexError):
            continue
    
    if len(monthly_flows) < 2:
        return 50.0  # Need at least 2 months of data
    
    # Calculate net cash flow per month
    net_flows = []
    for month_data in monthly_flows.values():
        net = month_data["income"] - month_data["expenses"]
        net_flows.append(net)
    
    if not net_flows:
        return 50.0
    
    # Calculate coefficient of variation (standard deviation / mean)
    mean_flow = sum(net_flows) / len(net_flows)
    
    if mean_flow == 0:
        return 50.0
    
    variance = sum((x - mean_flow) ** 2 for x in net_flows) / len(net_flows)
    std_dev = variance ** 0.5
    coefficient_of_variation = abs(std_dev / mean_flow) if mean_flow != 0 else 1.0
    
    # Lower volatility (lower CV) = higher score
    # CV of 0 = 100 points, CV of 1+ = 0 points
    volatility_score = max(0, 100 - (coefficient_of_variation * 100))
    
    return volatility_score

"""Test script for scoring_service - fetches Plaid data and documents automatically."""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.scoring_service import calculate_credit_score


def test_scoring():
    """Test the scoring service - all data fetched internally."""
    print("=" * 60)
    print("Testing Scoring Service")
    print("(Plaid data + Document pipeline fetched automatically)")
    print("=" * 60)
    
    # Calculate credit score - everything is fetched internally
    result = calculate_credit_score()
    
    credit_score = result.get("credit_score", 0)
    breakdown = result.get("breakdown", {})
    
    print(f"\nCredit Score: {credit_score}/100\n")
    print("Breakdown:")
    
    # Financial Accounts (from Plaid)
    fin = breakdown.get('financial_accounts', {})
    data = fin.get('data', {})
    print(f"  Financial Accounts: {fin.get('score', 0):.1f}/100 (Weight: 40%)")
    print(f"    - Transactions: {data.get('transactions_count', 0)}")
    print(f"    - Accounts: {data.get('accounts_count', 0)}")
    
    # Alternative Income (from documents)
    alt = breakdown.get('alternative_income', {})
    components = alt.get('components', {})
    print(f"  Alternative Income: {alt.get('score', 0):.1f}/100 (Weight: 30%)")
    if components:
        bs = components.get('balance_sheet_strength', {})
        pt = components.get('profitability_trend', {})
        print(f"    - Balance Sheet Strength: {bs.get('score', 0):.1f}/100 (60%)")
        print(f"    - Profitability Trend: {pt.get('score', 0):.1f}/100 (40%)")
    
    # Education/Licenses
    edu = breakdown.get('education_licenses', {})
    print(f"  Education/Licenses: {edu.get('score', 0):.1f}/100 (Weight: 10%)")
    
    # Cash Flow Volatility (from documents)
    cf = breakdown.get('cash_flow_volatility', {})
    print(f"  Cash Flow Volatility: {cf.get('score', 0):.1f}/100 (Weight: 20%)")
    
    # Show any Plaid errors
    if result.get("plaid_errors"):
        print("\nPlaid Errors:")
        for err in result["plaid_errors"]:
            print(f"  - {err['step']}: {err['error']}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Test completed!")
    print("=" * 60)
    
    return result


if __name__ == "__main__":
    test_scoring()

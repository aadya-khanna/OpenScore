"""Test script for scoring_service with Plaid data and document pipeline."""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.scoring_service import (
    calculate_credit_score,
    create_sandbox_public_token,
    exchange_public_token,
    get_transactions,
    get_accounts,
    get_investments_holdings,
    get_liabilities
)


def test_scoring():
    """Test the scoring service with Plaid data."""
    print("=" * 60)
    print("Testing Scoring Service")
    print("=" * 60)
    
    # Step 1: Create sandbox public token
    print("\n1. Creating sandbox public token...")
    public_token, err = create_sandbox_public_token(
        institution_id="ins_109508",
        initial_products=["auth", "transactions", "liabilities", "investments"]
    )
    if err:
        print(f"   [FAILED] {err}")
        return None
    print(f"   [SUCCESS] Public token: {public_token[:20]}...")
    
    # Step 2: Exchange for access token
    print("\n2. Exchanging for access token...")
    access_token, err = exchange_public_token(public_token)
    if err:
        print(f"   [FAILED] {err}")
        return None
    print(f"   [SUCCESS] Access token: {access_token[:20]}...")
    
    # Step 3: Fetch Plaid data
    print("\n3. Fetching Plaid data...")
    
    transactions, err = get_transactions(access_token)
    if err:
        print(f"   [WARNING] Transactions: {err}")
        transactions = []
    else:
        print(f"   Transactions: {len(transactions)}")
    
    accounts, err = get_accounts(access_token)
    if err:
        print(f"   [WARNING] Accounts: {err}")
        accounts = []
    else:
        print(f"   Accounts: {len(accounts)}")
    
    investments, err = get_investments_holdings(access_token)
    if err:
        print(f"   [WARNING] Investments: {err}")
        investments = {}
    else:
        print(f"   Investment holdings: {len(investments.get('holdings', []))}")
    
    liabilities, err = get_liabilities(access_token)
    if err:
        print(f"   [WARNING] Liabilities: {err}")
        liabilities = {}
    else:
        print(f"   Liabilities: fetched")
    
    # Step 4: Calculate credit score
    print("\n4. Calculating credit score...")
    print("   (Document pipeline provides: alternative_income, cash_flow_volatility)")
    
    result = calculate_credit_score(
        transactions=transactions,
        accounts=accounts,
        investments=investments,
        liabilities=liabilities,
        alternative_income=50000.0,  # Placeholder for future
        education_score=75.0
    )
    
    credit_score = result.get("credit_score", 0)
    breakdown = result.get("breakdown", {})
    
    print(f"\n" + "=" * 60)
    print(f"Credit Score: {credit_score}/100")
    print("=" * 60)
    print("\nBreakdown:")
    
    # Financial Accounts
    fin = breakdown.get('financial_accounts', {})
    print(f"  Financial Accounts: {fin.get('score', 0):.1f}/100 (Weight: 40%)")
    
    # Alternative Income (from documents)
    alt = breakdown.get('alternative_income', {})
    print(f"  Alternative Income: {alt.get('score', 0):.1f}/100 (Weight: 30%) [from documents]")
    
    # Education/Licenses
    edu = breakdown.get('education_licenses', {})
    print(f"  Education/Licenses: {edu.get('score', 0):.1f}/100 (Weight: 10%)")
    
    # Cash Flow Volatility (from documents)
    cf = breakdown.get('cash_flow_volatility', {})
    print(f"  Cash Flow Volatility: {cf.get('score', 0):.1f}/100 (Weight: 20%) [from documents]")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Test completed!")
    print("=" * 60)
    
    return result


if __name__ == "__main__":
    test_scoring()

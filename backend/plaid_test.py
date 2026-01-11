"""Test script for Plaid sandbox API using scoring_service."""
import sys
import os
from datetime import date, timedelta

# Add the backend directory to the path so we can import services
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.scoring_service import (
    create_sandbox_public_token,
    exchange_public_token,
    get_accounts,
    get_transactions,
    get_balance,
    get_liabilities,
    get_investments_holdings,
    get_investments_transactions,
    calculate_credit_score,
    get_plaid_base_url
)
from config import Config

def test_plaid_sandbox():
    """Test Plaid sandbox API integration."""
    print("=" * 60)
    print("Testing Plaid Sandbox API Integration")
    print("=" * 60)
    
    # Check configuration
    print(f"\n1. Configuration Check:")
    print(f"   PLAID_ENV: {Config.PLAID_ENV}")
    print(f"   PLAID_CLIENT_ID: {Config.PLAID_CLIENT_ID[:10]}..." if Config.PLAID_CLIENT_ID else "   PLAID_CLIENT_ID: NOT SET")
    print(f"   PLAID_SECRET: {'*' * 10}..." if Config.PLAID_SECRET else "   PLAID_SECRET: NOT SET")
    print(f"   Base URL: {get_plaid_base_url()}")
    
    if not Config.PLAID_CLIENT_ID or not Config.PLAID_SECRET:
        print("\n[ERROR] PLAID_CLIENT_ID and PLAID_SECRET must be set in .env file")
        return False
    
    if Config.PLAID_ENV.lower() != "sandbox":
        print(f"\n[WARNING] PLAID_ENV is set to '{Config.PLAID_ENV}', not 'sandbox'")
        print("   Some functions may not work correctly.")
    
    # Test 1: Create sandbox public token
    print(f"\n2. Creating Sandbox Public Token...")
    try:
        # Note: income_verification requires special setup via link token creation
        # For sandbox testing, we'll create with standard products
        # Income verification would be configured when creating a link token in production
        public_token, error = create_sandbox_public_token(
            institution_id="ins_109508",  # First Platypus
            initial_products=["auth", "transactions", "liabilities", "investments"]
        )
        if error:
            print(f"   [FAILED] {error}")
            return False
        print(f"   [SUCCESS] Public token: {public_token[:20]}...")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        return False
    
    # Test 2: Exchange public token for access token
    print(f"\n3. Exchanging Public Token for Access Token...")
    try:
        exchange_result, error = exchange_public_token(public_token)
        if error:
            print(f"   [FAILED] {error}")
            return False
        access_token = exchange_result
        item_id = exchange_result  # We'll need to get item_id from accounts later
        print(f"   [SUCCESS] Access token: {access_token[:20]}...")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        return False
    
    # Test 3: Get accounts
    print(f"\n4. Fetching Accounts...")
    try:
        accounts, error = get_accounts(access_token)
        if error:
            print(f"   [FAILED] {error}")
            return False
        print(f"   [SUCCESS] Found {len(accounts)} account(s)")
        for i, account in enumerate(accounts[:3], 1):  # Show first 3
            balance = account.get('balances', {}).get('available', 0)
            print(f"      Account {i}: {account.get('name')} ({account.get('type')}) - Balance: ${balance}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        return False
    
    # Test 4: Get transactions
    print(f"\n5. Fetching Transactions (last 90 days)...")
    try:
        end_date = date.today()
        start_date = end_date - timedelta(days=90)
        transactions, error = get_transactions(
            access_token,
            start_date=start_date,
            end_date=end_date,
            count=100
        )
        if error:
            error_code = error.get('error_code', 'UNKNOWN')
            error_message = error.get('error_message', str(error))
            print(f"   [FAILED] Error Code: {error_code}")
            print(f"   [FAILED] Error Message: {error_message}")
            if error_code == "PRODUCT_NOT_READY":
                print(f"   [INFO] Transactions are not ready yet. This is normal for new items.")
                print(f"   [INFO] Plaid needs time to fetch transaction data. Try again in a few minutes.")
            else:
                print(f"   [DETAILS] Full error: {error}")
            return False
        print(f"   [SUCCESS] Found {len(transactions)} transaction(s)")
        if transactions:
            print(f"   Sample transactions:")
            for i, txn in enumerate(transactions[:5], 1):  # Show first 5
                amount = txn.get('amount', 0)
                name = txn.get('name', 'Unknown')
                date_str = txn.get('date', 'N/A')
                print(f"      {i}. {date_str}: {name} - ${amount:.2f}")
        else:
            print(f"   [WARNING] No transactions found in the date range")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 5: Get Balance
    print(f"\n6. Fetching Account Balances...")
    try:
        balance_data, error = get_balance(access_token)
        if error:
            error_code = error.get('error_code', 'UNKNOWN')
            error_message = error.get('error_message', str(error))
            print(f"   [FAILED] Error Code: {error_code}")
            print(f"   [FAILED] Error Message: {error_message}")
            if error_code != "PRODUCT_NOT_READY":
                print(f"   [INFO] Balance product may not be enabled for this item")
        else:
            accounts = balance_data.get("accounts", [])
            print(f"   [SUCCESS] Found balance data for {len(accounts)} account(s)")
            for i, account in enumerate(accounts[:3], 1):
                balances = account.get("balances", {})
                available = balances.get("available", 0)
                current = balances.get("current", 0)
                print(f"      Account {i}: Available: ${available}, Current: ${current}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
    
    # Test 6: Get Liabilities
    print(f"\n7. Fetching Liabilities...")
    try:
        liabilities_data, error = get_liabilities(access_token)
        if error:
            error_code = error.get('error_code', 'UNKNOWN')
            error_message = error.get('error_message', str(error))
            print(f"   [FAILED] Error Code: {error_code}")
            print(f"   [FAILED] Error Message: {error_message}")
            if error_code == "PRODUCT_NOT_READY":
                print(f"   [INFO] Liabilities data is not ready yet. This is normal for new items.")
            elif error_code == "PRODUCTS_NOT_SUPPORTED":
                print(f"   [INFO] Liabilities product may not be enabled for this item")
        else:
            items = liabilities_data.get("liabilities", {})
            credit = items.get("credit", [])
            mortgage = items.get("mortgage", [])
            student = items.get("student", [])
            total_credit = len(credit)
            total_mortgage = len(mortgage)
            total_student = len(student)
            print(f"   [SUCCESS] Found liabilities:")
            print(f"      Credit accounts: {total_credit}")
            print(f"      Mortgage accounts: {total_mortgage}")
            print(f"      Student loan accounts: {total_student}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
    
    # Test 7: Get Investment Holdings
    print(f"\n8. Fetching Investment Holdings...")
    try:
        holdings_data, error = get_investments_holdings(access_token)
        if error:
            error_code = error.get('error_code', 'UNKNOWN')
            error_message = error.get('error_message', str(error))
            print(f"   [FAILED] Error Code: {error_code}")
            print(f"   [FAILED] Error Message: {error_message}")
            if error_code == "PRODUCT_NOT_READY":
                print(f"   [INFO] Investment data is not ready yet. This is normal for new items.")
            elif error_code == "PRODUCTS_NOT_SUPPORTED":
                print(f"   [INFO] Investments product may not be enabled for this item")
        else:
            holdings = holdings_data.get("holdings", [])
            accounts = holdings_data.get("accounts", [])
            print(f"   [SUCCESS] Found {len(holdings)} holding(s) across {len(accounts)} account(s)")
            if holdings:
                for i, holding in enumerate(holdings[:3], 1):
                    security = holding.get("security", {})
                    name = security.get("name", "Unknown")
                    quantity = holding.get("quantity", 0)
                    print(f"      Holding {i}: {name} - Quantity: {quantity}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
    
    # Test 8: Get Investment Transactions
    print(f"\n9. Fetching Investment Transactions...")
    try:
        inv_transactions_data, error = get_investments_transactions(
            access_token,
            start_date=start_date,
            end_date=end_date
        )
        if error:
            error_code = error.get('error_code', 'UNKNOWN')
            error_message = error.get('error_message', str(error))
            print(f"   [FAILED] Error Code: {error_code}")
            print(f"   [FAILED] Error Message: {error_message}")
            if error_code == "PRODUCT_NOT_READY":
                print(f"   [INFO] Investment transactions are not ready yet.")
            elif error_code == "PRODUCTS_NOT_SUPPORTED":
                print(f"   [INFO] Investments product may not be enabled for this item")
        else:
            inv_transactions = inv_transactions_data.get("investment_transactions", [])
            print(f"   [SUCCESS] Found {len(inv_transactions)} investment transaction(s)")
            if inv_transactions:
                for i, txn in enumerate(inv_transactions[:3], 1):
                    name = txn.get("name", "Unknown")
                    amount = txn.get("amount", 0)
                    date_str = txn.get("date", "N/A")
                    print(f"      {i}. {date_str}: {name} - ${amount:.2f}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
    
    # Test 9: Calculate Credit Score
    print(f"\n10. Calculating Credit Score...")
    try:
        if transactions:
            # Get all necessary data for credit score calculation
            balance_data, _ = get_balance(access_token)
            investments_data, _ = get_investments_holdings(access_token)
            liabilities_data, _ = get_liabilities(access_token)
            
            # Extract accounts from balance data or use accounts we already have
            accounts_for_score = accounts
            if balance_data and balance_data.get("accounts"):
                accounts_for_score = balance_data.get("accounts")
            
            # Calculate credit score with all available data
            credit_result = calculate_credit_score(
                transactions=transactions,
                accounts=accounts_for_score,
                investments=investments_data,
                liabilities=liabilities_data,
                alternative_income=50000.0,  # Constant value for now
                education_score=75.0  # Constant value for now
            )
            
            credit_score = credit_result.get("credit_score", 0)
            breakdown = credit_result.get("breakdown", {})
            
            print(f"   [SUCCESS] Credit Score: {credit_score}/100")
            print(f"   Breakdown:")
            print(f"      Financial Accounts: {breakdown.get('financial_accounts', {}).get('score', 0):.1f}/100 (Weight: 40%)")
            print(f"      Alternative Income: {breakdown.get('alternative_income', {}).get('score', 0):.1f}/100 (Weight: 30%)")
            print(f"      Education/Licenses: {breakdown.get('education_licenses', {}).get('score', 0):.1f}/100 (Weight: 10%)")
            print(f"      Cash Flow Volatility: {breakdown.get('cash_flow_volatility', {}).get('score', 0):.1f}/100 (Weight: 20%)")
            print(f"   (Based on {len(transactions)} transactions, {len(accounts_for_score) if accounts_for_score else 0} accounts)")
        else:
            print(f"   [WARNING] No transactions to calculate score")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("[SUCCESS] All tests completed!")
    print("=" * 60)
    print("\nNote: Some products may show errors if they weren't enabled")
    print("when the item was created. This is normal for sandbox testing.")
    return True

if __name__ == "__main__":
    success = test_plaid_sandbox()
    sys.exit(0 if success else 1)

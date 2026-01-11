"""Debug script to test transaction fetching with detailed error output."""
import sys
import os
import json
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.scoring_service import get_transactions, exchange_public_token, create_sandbox_public_token
from config import Config

def test_transactions_debug():
    """Test transaction fetching with detailed debugging."""
    print("=" * 60)
    print("Transaction Fetching Debug Test")
    print("=" * 60)
    
    # Create a new sandbox item
    print("\n1. Creating new sandbox item...")
    public_token, error = create_sandbox_public_token(
        institution_id="ins_109508",
        initial_products=["transactions"]  # Only transactions
    )
    if error:
        print(f"   [ERROR] Failed to create public token: {error}")
        return False
    
    print(f"   [OK] Public token created")
    
    # Exchange for access token
    print("\n2. Exchanging for access token...")
    access_token, error = exchange_public_token(public_token)
    if error:
        print(f"   [ERROR] Failed to exchange: {error}")
        return False
    
    print(f"   [OK] Access token: {access_token[:30]}...")
    
    # Try to get transactions immediately (might fail)
    print("\n3. Attempting to fetch transactions immediately...")
    print("   (This may fail with PRODUCT_NOT_READY for new items)")
    transactions, error = get_transactions(
        access_token,
        start_date=date.today() - timedelta(days=90),
        end_date=date.today(),
        count=100,
        auto_refresh=False  # Don't auto-refresh to see the error
    )
    
    if error:
        print(f"\n   [ERROR DETAILS]")
        print(f"   Error Code: {error.get('error_code', 'N/A')}")
        print(f"   Error Message: {error.get('error_message', 'N/A')}")
        print(f"\n   Full Error Response:")
        print(json.dumps(error.get('full_error', error), indent=2))
        
        if error.get('error_code') == 'PRODUCT_NOT_READY':
            print(f"\n   [INFO] This is expected for newly created items.")
            print(f"   Plaid needs time to fetch transaction data.")
            print(f"   You can:")
            print(f"   1. Wait a few minutes and try again")
            print(f"   2. Use the refresh_transactions() function")
            print(f"   3. Enable auto_refresh=True in get_transactions()")
    else:
        print(f"   [SUCCESS] Found {len(transactions)} transactions")
        if transactions:
            print(f"   First transaction: {transactions[0].get('name')} - ${transactions[0].get('amount')}")
    
    # Try with auto-refresh enabled
    print("\n4. Attempting with auto-refresh enabled...")
    transactions, error = get_transactions(
        access_token,
        start_date=date.today() - timedelta(days=90),
        end_date=date.today(),
        count=100,
        auto_refresh=True  # Enable auto-refresh
    )
    
    if error:
        print(f"   [STILL FAILED] Error: {error.get('error_code')} - {error.get('error_message')}")
        print(f"   This might mean transactions need more time to be ready.")
    else:
        print(f"   [SUCCESS] Found {len(transactions)} transactions with auto-refresh")
    
    print("\n" + "=" * 60)
    return True

if __name__ == "__main__":
    test_transactions_debug()

"""Collect all sandbox outputs from scoring_service into a JSON file."""
import sys
import os
import json
from datetime import date, timedelta
from typing import Dict, Any

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
    get_plaid_base_url
)
from config import Config


def clean_dict(obj: Any) -> Any:
    """Remove null values and clean up dictionary."""
    if isinstance(obj, dict):
        cleaned = {}
        for key, value in obj.items():
            cleaned_value = clean_dict(value)
            # Only include non-null values
            if cleaned_value is not None:
                cleaned[key] = cleaned_value
        return cleaned if cleaned else None
    elif isinstance(obj, list):
        cleaned_list = [clean_dict(item) for item in obj if clean_dict(item) is not None]
        return cleaned_list if cleaned_list else None
    else:
        return obj


def collect_sandbox_output() -> Dict[str, Any]:
    """Collect all sandbox outputs and return as dictionary."""
    output = {}
    
    # Check if configuration is valid
    if not Config.PLAID_CLIENT_ID or not Config.PLAID_SECRET:
        output["error"] = "PLAID_CLIENT_ID and PLAID_SECRET must be set in .env file"
        return output
    
    try:
        # 1. Create sandbox public token
        print("Creating sandbox public token...")
        public_token, error = create_sandbox_public_token(
            institution_id="ins_109508",  # First Platypus
            initial_products=["auth", "transactions", "liabilities", "investments"]
        )
        if error:
            output["create_sandbox_public_token"] = {"error": error}
            return output
        output["create_sandbox_public_token"] = {"public_token": public_token}
        
        # 2. Exchange public token for access token
        print("Exchanging public token...")
        access_token, error = exchange_public_token(public_token)
        if error:
            output["exchange_public_token"] = {"error": error}
            return output
        output["exchange_public_token"] = {"access_token": access_token}
        
        # 3. Get accounts
        print("Fetching accounts...")
        accounts, error = get_accounts(access_token)
        if error:
            output["get_accounts"] = {"error": error}
        else:
            output["get_accounts"] = {"accounts": accounts}
        
        # 4. Get transactions
        print("Fetching transactions...")
        transactions, error = get_transactions(
            access_token,
            start_date=date.today() - timedelta(days=90),
            end_date=date.today(),
            count=100
        )
        if error:
            output["get_transactions"] = {"error": error}
        else:
            output["get_transactions"] = {"transactions": transactions}
        
        # 5. Get balance
        print("Fetching balance...")
        balance_data, error = get_balance(access_token)
        if error:
            output["get_balance"] = {"error": error}
        else:
            output["get_balance"] = {"balance_data": balance_data}
        
        # 6. Get liabilities
        print("Fetching liabilities...")
        liabilities_data, error = get_liabilities(access_token)
        if error:
            output["get_liabilities"] = {"error": error}
        else:
            output["get_liabilities"] = {"liabilities_data": liabilities_data}
        
        # 7. Get investments holdings
        print("Fetching investments holdings...")
        investments_holdings, error = get_investments_holdings(access_token)
        if error:
            output["get_investments_holdings"] = {"error": error}
        else:
            output["get_investments_holdings"] = {"investments_holdings": investments_holdings}
        
        # 8. Get investments transactions
        print("Fetching investments transactions...")
        investments_transactions, error = get_investments_transactions(
            access_token,
            start_date=date.today() - timedelta(days=90),
            end_date=date.today()
        )
        if error:
            output["get_investments_transactions"] = {"error": error}
        else:
            output["get_investments_transactions"] = {"investments_transactions": investments_transactions}
        
    except Exception as e:
        output["exception"] = {
            "message": str(e),
            "type": type(e).__name__
        }
    
    # Clean up null values
    output = clean_dict(output)
    return output


if __name__ == "__main__":
    print("=" * 60)
    print("Collecting Sandbox Output from scoring_service.py")
    print("=" * 60)
    print()
    
    output = collect_sandbox_output()
    
    # Save to JSON file
    output_file = "sandbox_output.json"
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\n[SUCCESS] All sandbox output saved to: {output_file}")
    print(f"Total results collected: {len(output)}")
    
    # Print summary
    if "error" in output:
        print(f"\n[ERROR] {output['error']}")
    elif "exception" in output:
        print(f"\n[EXCEPTION] {output['exception']['message']}")
    else:
        print("\nSummary:")
        for key, value in output.items():
            if isinstance(value, dict) and "error" in value:
                print(f"  {key}: ERROR - {value['error']}")
            else:
                print(f"  {key}: SUCCESS")

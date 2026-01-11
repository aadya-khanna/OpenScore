"""Plaid service for financial data integration."""
import logging
from datetime import date, timedelta
from typing import Optional, List, Dict, Any, Tuple
from config import Config

logger = logging.getLogger(__name__)

# Try to import Plaid SDK - make it optional
PLAID_AVAILABLE = False
try:
    from plaid import Configuration, ApiClient, Environment
    from plaid.api import plaid_api
    from plaid.model.link_token_create_request import LinkTokenCreateRequest
    from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
    from plaid.model.country_code import CountryCode
    from plaid.model.products import Products
    from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
    from plaid.model.transactions_get_request import TransactionsGetRequest
    from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
    from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
    PLAID_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Plaid SDK not available. Install with: pip install plaid-python. Error: {e}")

# Singleton Plaid client
_plaid_client = None


def get_plaid_client():
    """Get or create the Plaid API client.
    
    Returns:
        PlaidApi instance
        
    Raises:
        ImportError: If plaid-python is not installed
    """
    if not PLAID_AVAILABLE:
        raise ImportError("plaid-python is not installed. Install with: pip install plaid-python")
    
    global _plaid_client
    if _plaid_client is None:
        # Map environment string to Plaid Environment enum
        env_map = {
            "sandbox": Environment.sandbox,
            "development": Environment.development,
            "production": Environment.production,
        }
        
        plaid_env = env_map.get(Config.PLAID_ENV.lower(), Environment.sandbox)
        
        configuration = Configuration(
            host=plaid_env,
            api_key={
                "clientId": Config.PLAID_CLIENT_ID,
                "secret": Config.PLAID_SECRET,
            }
        )
        
        api_client = ApiClient(configuration)
        _plaid_client = plaid_api.PlaidApi(api_client)
        logger.info(f"Plaid client initialized for {Config.PLAID_ENV}")
    
    return _plaid_client


def create_link_token(user_id: str) -> str:
    """Create a Plaid link token for the given user.
    
    Args:
        user_id: User identifier (Auth0 sub)
        
    Returns:
        Link token string
        
    Raises:
        Exception: If link token creation fails
    """
    client = get_plaid_client()
    
    try:
        # Create request using Plaid SDK models
        # Products and CountryCode can be accessed as enums or instantiated
        try:
            # Try enum access first (Products.transactions, CountryCode.US)
            if hasattr(Products, "transactions"):
                products_list = [Products.transactions]
            elif hasattr(Products, "TRANSACTIONS"):
                products_list = [Products.TRANSACTIONS]
            else:
                products_list = [Products("transactions")]
        except:
            products_list = ["transactions"]
        
        try:
            if hasattr(CountryCode, "us"):
                country_codes_list = [CountryCode.us]
            elif hasattr(CountryCode, "US"):
                country_codes_list = [CountryCode.US]
            else:
                country_codes_list = [CountryCode("US")]
        except:
            country_codes_list = ["US"]
        
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=user_id),
            client_name="OpenScore",
            products=products_list,
            country_codes=country_codes_list,
            language="en",
        )
        
        response = client.link_token_create(request)
        
        # Extract link_token - handle different response formats
        link_token = None
        if hasattr(response, "link_token"):
            link_token = response.link_token
        elif isinstance(response, dict):
            link_token = response.get("link_token")
        else:
            # Try to_dict() method
            try:
                response_dict = _convert_to_dict(response)
                if isinstance(response_dict, dict):
                    link_token = response_dict.get("link_token")
            except:
                pass
        
        if not link_token:
            raise ValueError(f"Failed to extract link_token from Plaid response. Response type: {type(response)}")
        
        return str(link_token)
    except Exception as e:
        logger.error(f"Failed to create Plaid link token: {e}")
        raise


def exchange_public_token(public_token: str) -> Tuple[str, str]:
    """Exchange a public token for an access token.
    
    Args:
        public_token: Public token from Plaid Link
        
    Returns:
        Tuple of (access_token, item_id)
        
    Raises:
        Exception: If exchange fails
    """
    client = get_plaid_client()
    
    try:
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = client.item_public_token_exchange(request)
        
        # Extract access_token and item_id from response - handle different formats
        access_token = None
        item_id = None
        
        if hasattr(response, "access_token"):
            access_token = response.access_token
        if hasattr(response, "item_id"):
            item_id = response.item_id
        
        if access_token is None or item_id is None:
            # Try converting to dict
            response_dict = _convert_to_dict(response)
            if isinstance(response_dict, dict):
                access_token = access_token or response_dict.get("access_token")
                item_id = item_id or response_dict.get("item_id")
        
        if not access_token or not item_id:
            raise ValueError(f"Invalid response from Plaid: missing access_token or item_id. Response: {type(response)}")
        
        return str(access_token), str(item_id)
    except Exception as e:
        logger.error(f"Failed to exchange public token: {e}")
        raise


def _convert_to_dict(obj: Any) -> Any:
    """Convert Plaid SDK objects to dictionaries recursively."""
    if isinstance(obj, dict):
        return {k: _convert_to_dict(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_convert_to_dict(item) for item in obj]
    elif hasattr(obj, "__dict__"):
        # Try to_dict first if available
        if hasattr(obj, "to_dict"):
            try:
                return obj.to_dict()
            except:
                pass
        # Otherwise convert __dict__
        result = {}
        for key, value in obj.__dict__.items():
            # Skip private attributes
            if not key.startswith("_"):
                result[key] = _convert_to_dict(value)
        return result
    else:
        return obj


def fetch_transactions(access_token: str, days: int = 90) -> List[Dict[str, Any]]:
    """Fetch transactions for an access token.
    
    Args:
        access_token: Plaid access token
        days: Number of days to fetch (default: 90)
        
    Returns:
        List of transaction dictionaries
        
    Raises:
        Exception: If fetch fails
    """
    client = get_plaid_client()
    
    try:
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Create request
        options = TransactionsGetRequestOptions(count=500)
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
            options=options
        )
        
        response = client.transactions_get(request)
        
        # Extract transactions from response
        transactions = getattr(response, "transactions", None)
        if transactions is None:
            # Try accessing as dict
            if isinstance(response, dict):
                transactions = response.get("transactions", [])
            else:
                transactions = []
        
        # Convert to list of dicts
        result = []
        for txn in transactions:
            txn_dict = _convert_to_dict(txn)
            # Ensure we have the key fields
            if isinstance(txn_dict, dict):
                # Ensure transaction_id exists (might be 'id' in some versions)
                if "transaction_id" not in txn_dict and "id" in txn_dict:
                    txn_dict["transaction_id"] = txn_dict["id"]
                result.append(txn_dict)
        
        return result
    except Exception as e:
        logger.error(f"Failed to fetch transactions: {e}")
        raise


def fetch_balances(access_token: str) -> List[Dict[str, Any]]:
    """Fetch account balances for an access token.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        List of account dictionaries with balance information
        
    Raises:
        Exception: If fetch fails
    """
    client = get_plaid_client()
    
    try:
        request = AccountsBalanceGetRequest(access_token=access_token)
        response = client.accounts_balance_get(request)
        
        # Extract accounts from response
        accounts = getattr(response, "accounts", None)
        if accounts is None:
            # Try accessing as dict
            if isinstance(response, dict):
                accounts = response.get("accounts", [])
            else:
                accounts = []
        
        # Convert to list of dicts
        result = []
        for account in accounts:
            account_dict = _convert_to_dict(account)
            if isinstance(account_dict, dict):
                # Ensure account_id exists (might be 'id' in some versions)
                if "account_id" not in account_dict and "id" in account_dict:
                    account_dict["account_id"] = account_dict["id"]
                result.append(account_dict)
        
        return result
    except Exception as e:
        logger.error(f"Failed to fetch balances: {e}")
        raise


def fetch_income(access_token: str) -> Optional[Dict[str, Any]]:
    """Attempt to fetch income data for an access token.
    
    Note: Income data may not be available in all environments or for all items.
    Income verification requires specific product setup and configuration.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        Income data dictionary, or None if not available
        
    Raises:
        Exception: If fetch fails (other than not available)
    """
    # Note: Income verification endpoints require:
    # 1. Income verification product enabled in Plaid
    # 2. Link token created with income_verification product
    # 3. Additional SDK models that may vary by version
    
    # For now, return None to indicate income data is not available
    # This can be enhanced later when income verification is properly configured
    logger.info("Income data fetch attempted - income verification requires additional product setup")
    return None

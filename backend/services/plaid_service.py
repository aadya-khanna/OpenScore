"""Plaid service for financial data integration."""
import logging
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
    from datetime import datetime, timedelta
    # Income verification may not be available in all Plaid products
    try:
        from plaid.model.income_verification_paystubs_get_request import IncomeVerificationPaystubsGetRequest
        INCOME_VERIFICATION_AVAILABLE = True
    except ImportError:
        IncomeVerificationPaystubsGetRequest = None
        INCOME_VERIFICATION_AVAILABLE = False
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
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=user_id),
            client_name="OpenScore",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en",
        )
        
        response = client.link_token_create(request)
        # Access link_token from response (may be attribute or dict depending on SDK version)
        return getattr(response, "link_token", response.get("link_token", ""))
    except Exception as e:
        logger.error(f"Failed to create Plaid link token: {e}")
        raise


def exchange_public_token(public_token: str):
    """Exchange a Plaid public token for an access token.
    
    Args:
        public_token: Public token from Plaid Link
        
    Returns:
        Tuple of (access_token, item_id)
        
    Raises:
        Exception: If exchange fails
    """
    if not PLAID_AVAILABLE:
        raise ImportError("plaid-python is not installed")
    
    client = get_plaid_client()
    
    try:
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = client.item_public_token_exchange(request)
        
        # Extract access_token and item_id from response
        access_token = getattr(response, "access_token", response.get("access_token", ""))
        item_id = getattr(response, "item_id", response.get("item_id", ""))
        
        logger.info(f"Successfully exchanged public token for item_id: {item_id}")
        return access_token, item_id
    except Exception as e:
        logger.error(f"Failed to exchange public token: {e}")
        raise


def _plaid_obj_to_dict(obj):
    """Convert a Plaid SDK object to a dictionary.
    
    Handles nested objects, dates, and common Plaid SDK types.
    """
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, datetime):
        return obj.isoformat()
    if hasattr(obj, "isoformat"):  # date objects
        return obj.isoformat()
    if isinstance(obj, list):
        return [_plaid_obj_to_dict(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _plaid_obj_to_dict(v) for k, v in obj.items()}
    
    # Try to access as object attributes
    result = {}
    if hasattr(obj, "__dict__"):
        for key, value in obj.__dict__.items():
            if not key.startswith("_"):
                result[key] = _plaid_obj_to_dict(value)
    else:
        # Try common attribute access patterns
        for attr in ["transaction_id", "account_id", "amount", "date", "name", "category", 
                     "account_id", "balances", "name", "type", "subtype", "mask"]:
            if hasattr(obj, attr):
                result[attr] = _plaid_obj_to_dict(getattr(obj, attr))
    
    return result


def fetch_transactions(access_token: str, days: int = 90):
    """Fetch transactions for the given access token.
    
    Args:
        access_token: Plaid access token
        days: Number of days to fetch (default: 90)
        
    Returns:
        List of transaction dictionaries
        
    Raises:
        Exception: If fetch fails
    """
    if not PLAID_AVAILABLE:
        raise ImportError("plaid-python is not installed")
    
    client = get_plaid_client()
    
    try:
        # Calculate start date
        start_date = (datetime.now() - timedelta(days=days)).date()
        end_date = datetime.now().date()
        
        # Create request
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        
        response = client.transactions_get(request)
        
        # Extract transactions from response
        transactions = getattr(response, "transactions", None)
        if transactions is None:
            transactions = response.get("transactions", []) if isinstance(response, dict) else []
        
        # Convert to list of dicts
        result = [_plaid_obj_to_dict(txn) for txn in transactions]
        
        logger.info(f"Fetched {len(result)} transactions")
        return result
    except Exception as e:
        logger.error(f"Failed to fetch transactions: {e}")
        raise


def fetch_balances(access_token: str):
    """Fetch account balances for the given access token.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        List of account dictionaries with balance information
        
    Raises:
        Exception: If fetch fails
    """
    if not PLAID_AVAILABLE:
        raise ImportError("plaid-python is not installed")
    
    client = get_plaid_client()
    
    try:
        request = AccountsBalanceGetRequest(access_token=access_token)
        response = client.accounts_balance_get(request)
        
        # Extract accounts from response
        accounts = getattr(response, "accounts", None)
        if accounts is None:
            accounts = response.get("accounts", []) if isinstance(response, dict) else []
        
        # Convert to list of dicts
        result = [_plaid_obj_to_dict(account) for account in accounts]
        
        logger.info(f"Fetched {len(result)} accounts with balances")
        return result
    except Exception as e:
        logger.error(f"Failed to fetch balances: {e}")
        raise


def fetch_income(access_token: str):
    """Attempt to fetch income data for the given access token.
    
    Note: Income verification may not be available in all Plaid environments/products.
    This function returns None if income data is not available.
    
    Args:
        access_token: Plaid access token
        
    Returns:
        Income data dictionary or None if not available
        
    Raises:
        Exception: If fetch fails (other than unsupported feature)
    """
    if not PLAID_AVAILABLE:
        raise ImportError("plaid-python is not installed")
    
    client = get_plaid_client()
    
    try:
        # Note: Income verification endpoints may vary by Plaid product
        # This is a simplified implementation - adjust based on your Plaid product
        # For sandbox/development, income may not be available
        
        # Check if income verification is available
        if not INCOME_VERIFICATION_AVAILABLE or IncomeVerificationPaystubsGetRequest is None:
            logger.info("Income verification models not available in this Plaid SDK version")
            return None
        
        # Check if income verification endpoint exists
        if not hasattr(client, "income_verification_paystubs_get"):
            logger.info("Income verification endpoint not available in this Plaid product")
            return None
        
        # Try to get income data - this may fail if not supported
        # Using a generic approach that may need adjustment based on Plaid API version
        request = IncomeVerificationPaystubsGetRequest(access_token=access_token)
        response = client.income_verification_paystubs_get(request)
        
        # Extract income data
        paystubs = getattr(response, "paystubs", None)
        if paystubs is None:
            paystubs = response.get("paystubs", []) if isinstance(response, dict) else []
        
        if not paystubs:
            return None
        
        # Convert to dict
        result = {
            "paystubs": [_plaid_obj_to_dict(paystub) for paystub in paystubs]
        }
        
        logger.info(f"Fetched income data with {len(result['paystubs'])} paystubs")
        return result
        
    except (AttributeError, ImportError) as e:
        # Endpoint or model not available
        logger.info(f"Income verification not available: {e}")
        return None
    except Exception as e:
        # Check if it's an unsupported feature error
        error_str = str(e).lower()
        if any(phrase in error_str for phrase in ["not supported", "not available", "income", "not found", "invalid", "unauthorized"]):
            logger.info(f"Income data not available: {e}")
            return None
        logger.error(f"Failed to fetch income: {e}")
        raise


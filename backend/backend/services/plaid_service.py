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


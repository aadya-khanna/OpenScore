"""Configuration management for OpenScore backend."""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables.
    
    Frontend Auth0 Configuration (for reference):
    - Domain: dev-10rq6pvfm662krqd.us.auth0.com
    - Client ID: AbCcNTcFAkLasTpreduJs4wjtBuA7YKb
    - Audience: https://openscore.api
    
    These values should match your .env file.
    """
    
    # Flask
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    
    # Auth0
    # Should match frontend: domain = 'dev-10rq6pvfm662krqd.us.auth0.com'
    # Should match frontend: audience = 'https://openscore.api'
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "")
    AUTH0_AUDIENCE: str = os.getenv("AUTH0_AUDIENCE", "")
    AUTH0_ALGORITHMS: List[str] = ["RS256"]
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DBNAME: str = os.getenv("MONGODB_DBNAME", "openscore")
    
    # Plaid
    PLAID_CLIENT_ID: str = os.getenv("PLAID_CLIENT_ID", "")
    PLAID_SECRET: str = os.getenv("PLAID_SECRET", "")
    PLAID_ENV: str = os.getenv("PLAID_ENV", "sandbox")
    # Plaid products to request access to (e.g., "transactions", "auth", "identity", "income")
    # Format: comma-separated string like "transactions" or "transactions,auth,identity"
    _plaid_products_str = os.getenv("PLAID_PRODUCTS", "transactions")
    PLAID_PRODUCTS: List[str] = [p.strip() for p in _plaid_products_str.split(",") if p.strip()]
    # Plaid country codes (e.g., "US", "CA", "GB")
    # Format: comma-separated string like "US" or "US,CA,GB"
    _plaid_country_codes_str = os.getenv("PLAID_COUNTRY_CODES", "US")
    PLAID_COUNTRY_CODES: List[str] = [c.strip() for c in _plaid_country_codes_str.split(",") if c.strip()]
    
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    @classmethod
    def validate(cls) -> None:
        """Validate that required configuration is present."""
        required = [
            ("AUTH0_DOMAIN", cls.AUTH0_DOMAIN),
            ("AUTH0_AUDIENCE", cls.AUTH0_AUDIENCE),
            ("MONGODB_URI", cls.MONGODB_URI),
        ]
        missing = [name for name, value in required if not value]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")


"""Configuration management for OpenScore backend."""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""
    
    # Flask
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    
    # Auth0
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


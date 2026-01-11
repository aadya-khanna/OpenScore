"""MongoDB client and database access."""
import logging
from pymongo import MongoClient
from pymongo.database import Database
from config import Config

logger = logging.getLogger(__name__)

# Singleton MongoDB client
_client: MongoClient = None


def get_client() -> MongoClient:
    """Get or create the MongoDB client.
    
    Returns:
        MongoClient instance
    """
    global _client
    if _client is None:
        try:
            _client = MongoClient(Config.MONGODB_URI)
            # Test connection
            _client.admin.command("ping")
            logger.info("MongoDB client connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    return _client


def get_db() -> Database:
    """Get the configured database instance.
    
    Returns:
        Database instance
    """
    client = get_client()
    return client[Config.MONGODB_DBNAME]


def get_collection(name: str):
    """Get a MongoDB collection by name.
    
    Args:
        name: Collection name
        
    Returns:
        Collection instance
    """
    db = get_db()
    return db[name]

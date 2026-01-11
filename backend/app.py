"""OpenScore Flask application."""
import logging
import os
from datetime import datetime
from flask import Flask, jsonify, g
from flask_cors import CORS
from config import Config
from auth import require_auth
from db import get_db

# Import blueprints
from routes.plaid import bp as plaid_bp
from routes.score import bp as score_bp
from routes.lender import bp as lender_bp
from routes.data import bp as data_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Configure CORS for localhost frontend ports
CORS(
    app,
    origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)


# Validate configuration
try:
    Config.validate()
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Create MongoDB indexes on startup
def ensure_indexes():
    """Create MongoDB indexes for optimal query performance."""
    try:
        db = get_db()
        
        # Transactions: unique index on (userId, transaction_id)
        db.transactions.create_index([("userId", 1), ("transaction_id", 1)], unique=True)
        logger.info("Created index on transactions (userId, transaction_id)")
        
        # Balances: unique index on (userId, account_id)
        db.balances.create_index([("userId", 1), ("account_id", 1)], unique=True)
        logger.info("Created index on balances (userId, account_id)")
        
        # Plaid items: unique index on userId
        db.plaid_items.create_index([("userId", 1)], unique=True)
        logger.info("Created index on plaid_items (userId)")
        
        # Income: index on userId
        db.income.create_index([("userId", 1)])
        logger.info("Created index on income (userId)")
        
    except Exception as e:
        logger.warning(f"Failed to create MongoDB indexes (non-fatal): {e}")

# Create indexes
ensure_indexes()

# Register blueprints
app.register_blueprint(plaid_bp)
app.register_blueprint(score_bp)
app.register_blueprint(lender_bp)
app.register_blueprint(data_bp)


@app.route("/", methods=["GET"])
def root():
    """Root endpoint - API information."""
    # Build list of available endpoints
    endpoints_dict = {
        "GET /": "This endpoint - API information",
        "GET /health": "Health check (no auth required)",
        "GET /api/me": "Get current user info (auth required)",
        "POST /api/plaid/link-token": "Create Plaid link token (auth required) - Uses REST API",
        "POST /api/plaid/exchange": "Exchange Plaid public token (auth required) - Uses REST API",
        "POST /api/plaid/transactions/sync": "Sync transactions from Plaid (auth required) - Uses REST API",
        "POST /api/plaid/balances/sync": "Sync balances from Plaid (auth required) - Uses REST API",
        "POST /api/plaid/income/sync": "Sync income from Plaid (auth required) - May not be available",
        "GET /api/transactions": "Get stored transactions (auth required)",
        "GET /api/balances": "Get stored balances (auth required)",
        "GET /api/income": "Get stored income (auth required)",
        "POST /api/score/calculate": "Calculate score (auth required) - Placeholder",
        "GET /api/lender/list": "List lenders (auth required) - Placeholder"
    }
    
    endpoints = {
        "name": "OpenScore API",
        "version": "1.0.0",
        "endpoints": endpoints_dict,
        "authentication": "Bearer token (Auth0 JWT) required for /api/* endpoints",
        "note": "All Plaid endpoints now use REST API with configuration from .env file"
    }
    return jsonify(endpoints), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


@app.route("/api/me", methods=["GET"])
@require_auth
def get_me():
    """Get current user information and update last seen timestamp.
    
    This endpoint demonstrates the full stack:
    - Auth0 JWT verification
    - MongoDB write/read operations
    
    Returns:
        JSON with user information from database
    """
    try:
        user_id = g.user.get("sub")
        email = g.user.get("email")
        
        db = get_db()
        users_collection = db.users
        
        # Update or create user record
        now = datetime.utcnow().isoformat()
        update_data = {
            "lastSeenAt": now,
        }
        if email:
            update_data["email"] = email
        
        users_collection.update_one(
            {"_id": user_id},
            {"$set": update_data},
            upsert=True
        )
        
        # Read back the user document
        user_doc = users_collection.find_one({"_id": user_id})
        
        if not user_doc:
            return jsonify({
                "error": {
                    "code": "user_not_found",
                    "message": "User record not found after creation"
                }
            }), 500
        
        # Return user data (exclude MongoDB _id, use user_id instead)
        return jsonify({
            "user_id": user_doc.get("_id"),
            "email": user_doc.get("email"),
            "lastSeenAt": user_doc.get("lastSeenAt")
        }), 200
        
    except Exception as e:
        logger.error(f"Error in /api/me: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 5000))
    app.run(debug=Config.FLASK_ENV == "development", host="0.0.0.0", port=port)


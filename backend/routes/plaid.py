"""Plaid-related routes."""
from flask import Blueprint, jsonify, g, request
from auth import require_auth
from db import get_db
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any, Tuple
import logging
import requests
from config import Config

# Import REST API functions from scoring_service
from services.scoring_service import get_transactions, get_balance

logger = logging.getLogger(__name__)

bp = Blueprint("plaid", __name__, url_prefix="/api/plaid")

# Plaid REST API configuration
BASE_URLS = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com",
}

HEADERS = {
    "Content-Type": "application/json",
}


def get_plaid_base_url() -> str:
    """Get the base URL for Plaid API based on environment."""
    return BASE_URLS.get(Config.PLAID_ENV.lower(), BASE_URLS["sandbox"])


def plaid_post(path: str, payload: dict) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """
    Make a POST request to Plaid API.
    
    Args:
        path: API endpoint path (e.g., "/transactions/get")
        payload: Request payload dictionary
        
    Returns:
        Tuple of (response_data, error_dict). If successful, error_dict is None.
        If error, response_data is None.
    """
    url = f"{get_plaid_base_url()}{path}"
    
    # Add client_id and secret to payload if not present
    if "client_id" not in payload:
        payload["client_id"] = Config.PLAID_CLIENT_ID
    if "secret" not in payload:
        payload["secret"] = Config.PLAID_SECRET
    
    try:
        r = requests.post(url, json=payload, headers=HEADERS, timeout=30)
        try:
            data = r.json()
        except Exception:
            data = {"error": "Non-JSON response", "text": r.text}
        
        if r.status_code >= 400:
            # Plaid errors are in the response body, extract them properly
            error_info = {
                "status": r.status_code,
                "response": data
            }
            # Plaid error structure: {"error_code": "...", "error_message": "..."}
            if isinstance(data, dict):
                if "error_code" in data:
                    error_info["error_code"] = data["error_code"]
                if "error_message" in data:
                    error_info["error_message"] = data["error_message"]
            return None, error_info
        
        return data, None
    except Exception as e:
        logger.error(f"Plaid API request failed: {e}")
        return None, {"error": str(e), "error_code": "REQUEST_FAILED"}


@bp.route("/link-token", methods=["POST"])
@require_auth
def get_link_token():
    """Create a Plaid link token for the authenticated user.
    
    Returns:
        JSON with link_token
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        # Create link token using REST API
        link_token_payload = {
            "client_id": Config.PLAID_CLIENT_ID,
            "secret": Config.PLAID_SECRET,
            "client_name": "OpenScore",
            "user": {
                "client_user_id": user_id
            },
            "products": Config.PLAID_PRODUCTS,
            "country_codes": Config.PLAID_COUNTRY_CODES,
            "language": "en"
        }
        
        link_token_resp, err = plaid_post("/link/token/create", link_token_payload)
        if err:
            error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
            error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
            logger.error(f"Failed to create link token: {error_code} - {error_message}")
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": error_message or f"Failed to create link token: {error_code}"
                }
            }), 500
        
        link_token = link_token_resp.get("link_token") if link_token_resp else None
        if not link_token:
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": "Invalid response from Plaid: missing link_token"
                }
            }), 500
        
        return jsonify({"link_token": link_token}), 200
        
    except Exception as e:
        logger.error(f"Error creating link token: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


def get_user_plaid_item(user_id: str):
    """Get the Plaid item (access_token) for a user.
    
    Returns:
        Dict with access_token and item_id, or None if not found
    """
    db = get_db()
    item = db.plaid_items.find_one({"userId": user_id})
    return item


@bp.route("/exchange", methods=["POST"])
@require_auth
def exchange_token():
    """Exchange a Plaid public token for an access token and store it.
    
    Body:
        {
            "public_token": "..."
        }
    
    Returns:
        JSON with ok status and item_id
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        data = request.get_json()
        if not data or "public_token" not in data:
            return jsonify({
                "error": {
                    "code": "invalid_request",
                    "message": "public_token is required in request body"
                }
            }), 400
        
        public_token = data["public_token"]
        
        # Exchange public token for access token using REST API
        exchange_payload = {
            "client_id": Config.PLAID_CLIENT_ID,
            "secret": Config.PLAID_SECRET,
            "public_token": public_token,
        }
        
        exchange_resp, err = plaid_post("/item/public_token/exchange", exchange_payload)
        if err:
            error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
            error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
            logger.error(f"Failed to exchange token: {error_code} - {error_message}")
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": error_message or f"Failed to exchange token: {error_code}"
                }
            }), 500
        
        access_token = exchange_resp.get("access_token") if exchange_resp else None
        item_id = exchange_resp.get("item_id") if exchange_resp else None
        
        if not access_token or not item_id:
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": "Invalid response from Plaid: missing access_token or item_id"
                }
            }), 500
        
        # Store in MongoDB
        # NOTE: In production, access_token should be encrypted before storage!
        # For hackathon/demo purposes, storing in plaintext.
        db = get_db()
        db.plaid_items.update_one(
            {"userId": user_id},
            {
                "$set": {
                    "userId": user_id,
                    "access_token": access_token,  # TODO: Encrypt in production
                    "item_id": item_id,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        
        logger.info(f"Stored Plaid access token for user {user_id}, item_id: {item_id}")
        
        return jsonify({
            "ok": True,
            "item_id": item_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error exchanging Plaid token: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


@bp.route("/transactions/sync", methods=["POST"])
@require_auth
def sync_transactions():
    """Sync transactions from Plaid and store in MongoDB.
    
    Returns:
        JSON with inserted and updated counts
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        # Get access token
        item = get_user_plaid_item(user_id)
        if not item or "access_token" not in item:
            return jsonify({
                "error": {
                    "code": "plaid_not_connected",
                    "message": "User has not connected a Plaid account. Call /api/plaid/exchange first."
                }
            }), 400
        
        access_token = item["access_token"]
        
        # Fetch transactions using REST API (defaults to last 90 days)
        transactions, err = get_transactions(access_token)
        if err:
            error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
            error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
            logger.error(f"Failed to fetch transactions: {error_code} - {error_message}")
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": error_message or f"Failed to fetch transactions: {error_code}"
                }
            }), 500
        
        if not transactions:
            transactions = []
        
        # Upsert into MongoDB
        db = get_db()
        inserted = 0
        updated = 0
        
        for txn in transactions:
            # Extract transaction_id - handle different possible field names
            txn_id = txn.get("transaction_id") or txn.get("id") or txn.get("_id")
            if not txn_id:
                logger.warning(f"Skipping transaction without ID: {txn}")
                continue
            
            # Prepare document
            doc = {
                "userId": user_id,
                "transaction_id": txn_id,
                **txn
            }
            
            # Upsert
            result = db.transactions.update_one(
                {"userId": user_id, "transaction_id": txn_id},
                {"$set": doc},
                upsert=True
            )
            
            if result.upserted_id:
                inserted += 1
            else:
                updated += 1
        
        logger.info(f"Synced transactions for user {user_id}: {inserted} inserted, {updated} updated")
        
        return jsonify({
            "inserted": inserted,
            "updated": updated
        }), 200
        
    except Exception as e:
        logger.error(f"Error syncing transactions: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


@bp.route("/balances/sync", methods=["POST"])
@require_auth
def sync_balances():
    """Sync account balances from Plaid and store in MongoDB.
    
    Returns:
        JSON with account count
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        # Get access token
        item = get_user_plaid_item(user_id)
        if not item or "access_token" not in item:
            return jsonify({
                "error": {
                    "code": "plaid_not_connected",
                    "message": "User has not connected a Plaid account. Call /api/plaid/exchange first."
                }
            }), 400
        
        access_token = item["access_token"]
        
        # Fetch balances using REST API
        balance_resp, err = get_balance(access_token)
        if err:
            error_code = err.get("error_code") or err.get("response", {}).get("error_code", "UNKNOWN_ERROR")
            error_message = err.get("error_message") or err.get("response", {}).get("error_message", str(err))
            logger.error(f"Failed to fetch balances: {error_code} - {error_message}")
            return jsonify({
                "error": {
                    "code": "plaid_error",
                    "message": error_message or f"Failed to fetch balances: {error_code}"
                }
            }), 500
        
        accounts = balance_resp.get("accounts", []) if balance_resp else []
        
        # Upsert into MongoDB
        db = get_db()
        count = 0
        
        for account in accounts:
            # Extract account_id
            account_id = account.get("account_id") or account.get("id") or account.get("_id")
            if not account_id:
                logger.warning(f"Skipping account without ID: {account}")
                continue
            
            # Prepare document
            doc = {
                "userId": user_id,
                "account_id": account_id,
                **account
            }
            
            # Upsert
            db.balances.update_one(
                {"userId": user_id, "account_id": account_id},
                {"$set": doc},
                upsert=True
            )
            count += 1
        
        logger.info(f"Synced balances for user {user_id}: {count} accounts")
        
        return jsonify({
            "accounts": count
        }), 200
        
    except Exception as e:
        logger.error(f"Error syncing balances: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


@bp.route("/income/sync", methods=["POST"])
@require_auth
def sync_income():
    """Attempt to sync income data from Plaid.
    
    Returns:
        JSON with income data or message if not available
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        # Get access token
        item = get_user_plaid_item(user_id)
        if not item or "access_token" not in item:
            return jsonify({
                "error": {
                    "code": "plaid_not_connected",
                    "message": "User has not connected a Plaid account. Call /api/plaid/exchange first."
                }
            }), 400
        
        access_token = item["access_token"]
        
        # Note: Income verification requires specific product setup
        # For now, return not available as income endpoints require additional configuration
        logger.info(f"Income sync attempted for user {user_id} - income verification requires additional setup")
        
        return jsonify({
            "available": False,
            "message": "Income data is not available for this Plaid item. Income verification may not be enabled or supported in this environment."
        }), 200
        
    except Exception as e:
        logger.error(f"Error syncing income: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


"""Plaid-related routes."""
from flask import Blueprint, jsonify, g, request
from auth import require_auth
from db import get_db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

bp = Blueprint("plaid", __name__, url_prefix="/api/plaid")

# Import plaid_service functions - handle ImportError gracefully
try:
    from services.plaid_service import (
        create_link_token,
        exchange_public_token,
        fetch_transactions,
        fetch_balances,
        fetch_income,
        PLAID_AVAILABLE
    )
except ImportError:
    PLAID_AVAILABLE = False
    create_link_token = None
    exchange_public_token = None
    fetch_transactions = None
    fetch_balances = None
    fetch_income = None


@bp.route("/link-token", methods=["POST"])
@require_auth
def get_link_token():
    """Create a Plaid link token for the authenticated user.
    
    Returns:
        JSON with link_token
    """
    if not PLAID_AVAILABLE or create_link_token is None:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": "Plaid SDK is not installed. Install with: pip install plaid-python"
            }
        }), 503
    
    try:
        user_id = g.user.get("sub")
        link_token = create_link_token(user_id)
        return jsonify({"link_token": link_token}), 200
    except ImportError as e:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": f"Plaid SDK is not installed: {str(e)}"
            }
        }), 503
    except Exception as e:
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
    if not PLAID_AVAILABLE or exchange_public_token is None:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": "Plaid SDK is not installed. Install with: pip install plaid-python"
            }
        }), 503
    
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
        
        # Exchange public token for access token
        access_token, item_id = exchange_public_token(public_token)
        
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
    if not PLAID_AVAILABLE or fetch_transactions is None:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": "Plaid SDK is not installed"
            }
        }), 503
    
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
        
        # Fetch transactions
        transactions = fetch_transactions(access_token, days=90)
        
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
    if not PLAID_AVAILABLE or fetch_balances is None:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": "Plaid SDK is not installed"
            }
        }), 503
    
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
        
        # Fetch balances
        accounts = fetch_balances(access_token)
        
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
    if not PLAID_AVAILABLE or fetch_income is None:
        return jsonify({
            "error": {
                "code": "plaid_not_available",
                "message": "Plaid SDK is not installed"
            }
        }), 503
    
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
        
        # Fetch income (may return None if not available)
        income_data = fetch_income(access_token)
        
        if income_data is None:
            return jsonify({
                "available": False,
                "message": "Income data is not available for this Plaid item. Income verification may not be enabled or supported in this environment."
            }), 200
        
        # Store in MongoDB
        db = get_db()
        db.income.update_one(
            {"userId": user_id},
            {
                "$set": {
                    "userId": user_id,
                    **income_data,
                    "as_of": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        
        logger.info(f"Synced income data for user {user_id}")
        
        return jsonify({
            "available": True,
            "data": income_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error syncing income: {e}")
        return jsonify({
            "error": {
                "code": "plaid_error",
                "message": str(e)
            }
        }), 500


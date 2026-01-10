"""Data retrieval routes for transactions, balances, and income."""
from flask import Blueprint, jsonify, g
from auth import require_auth
from db import get_db
import logging

logger = logging.getLogger(__name__)

bp = Blueprint("data", __name__, url_prefix="/api")


@bp.route("/transactions", methods=["GET"])
@require_auth
def get_transactions():
    """Get the last 100 stored transactions for the current user.
    
    Returns:
        JSON array of transactions sorted by date descending
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
        
        db = get_db()
        
        # Get last 100 transactions, sorted by date descending
        # Try to find date field (could be "date", "authorized_date", "datetime", etc.)
        transactions = list(
            db.transactions.find({"userId": user_id})
            .sort([("date", -1), ("authorized_date", -1), ("_id", -1)])
            .limit(100)
        )
        
        # Remove MongoDB _id and convert to list
        result = []
        for txn in transactions:
            txn.pop("_id", None)
            result.append(txn)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/balances", methods=["GET"])
@require_auth
def get_balances():
    """Get the latest account balances for the current user.
    
    Returns:
        JSON array of account balances
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
        
        db = get_db()
        
        # Get all balances for user
        balances = list(db.balances.find({"userId": user_id}))
        
        # Remove MongoDB _id
        result = []
        for balance in balances:
            balance.pop("_id", None)
            result.append(balance)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching balances: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/income", methods=["GET"])
@require_auth
def get_income():
    """Get the latest income snapshot for the current user.
    
    Returns:
        JSON with income data or 404 if not found
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
        
        db = get_db()
        
        # Get latest income snapshot
        income = db.income.find_one({"userId": user_id})
        
        if not income:
            return jsonify({
                "error": {
                    "code": "not_found",
                    "message": "No income data found for this user. Call /api/plaid/income/sync first."
                }
            }), 404
        
        # Remove MongoDB _id
        income.pop("_id", None)
        
        return jsonify(income), 200
        
    except Exception as e:
        logger.error(f"Error fetching income: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


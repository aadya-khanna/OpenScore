"""Data retrieval routes for transactions, balances, and income."""
from flask import Blueprint, jsonify, g, request
from auth import require_auth
from db import get_db
from services.sandbox_storage_service import compute_summary
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


@bp.route("/data/accounts", methods=["GET"])
@require_auth
def get_data_accounts():
    """Get accounts for the current user.
    
    Returns:
        JSON array of accounts
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
        
        # Get all accounts for user
        accounts = list(db.accounts.find({"user_id": user_id}))
        
        # Remove MongoDB _id
        result = []
        for account in accounts:
            account.pop("_id", None)
            result.append(account)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching accounts: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/data/transactions", methods=["GET"])
@require_auth
def get_data_transactions():
    """Get transactions for the current user.
    
    Query params:
        limit: Maximum number of transactions to return (default: 50)
    
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
        
        # Get limit from query params
        limit = request.args.get("limit", 50, type=int)
        
        # Get transactions, sorted by date descending
        transactions = list(
            db.transactions.find({"user_id": user_id})
            .sort([("date", -1), ("_id", -1)])
            .limit(limit)
        )
        
        # Remove MongoDB _id
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


@bp.route("/data/holdings", methods=["GET"])
@require_auth
def get_data_holdings():
    """Get holdings for the current user.
    
    Returns:
        JSON array of holdings
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
        
        # Get all holdings for user
        holdings = list(db.holdings.find({"user_id": user_id}))
        
        # Remove MongoDB _id
        result = []
        for holding in holdings:
            holding.pop("_id", None)
            result.append(holding)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching holdings: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/data/liabilities", methods=["GET"])
@require_auth
def get_data_liabilities():
    """Get liabilities for the current user.
    
    Returns:
        JSON array of liabilities
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
        
        # Get all liabilities for user
        liabilities = list(db.liabilities.find({"user_id": user_id}))
        
        # Remove MongoDB _id
        result = []
        for liability in liabilities:
            liability.pop("_id", None)
            result.append(liability)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching liabilities: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/data/summary", methods=["GET"])
@require_auth
def get_data_summary():
    """Get aggregate summary statistics for the current user.
    
    Returns:
        JSON with totals, monthlySpend, and topCategories
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
        
        # Compute summary
        summary = compute_summary(db, user_id)
        
        return jsonify({
            "ok": True,
            **summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error computing summary: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


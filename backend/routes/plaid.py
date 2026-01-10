"""Plaid-related routes."""
from flask import Blueprint, jsonify, g
from auth import require_auth

bp = Blueprint("plaid", __name__, url_prefix="/api/plaid")

# Import plaid_service functions - handle ImportError gracefully
try:
    from services.plaid_service import create_link_token, PLAID_AVAILABLE
except ImportError:
    PLAID_AVAILABLE = False
    create_link_token = None


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


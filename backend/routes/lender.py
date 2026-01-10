"""Lender-related routes."""
from flask import Blueprint
from auth import require_auth

bp = Blueprint("lender", __name__, url_prefix="/api/lender")


@bp.route("/list", methods=["GET"])
@require_auth
def list_lenders():
    """List available lenders."""
    # Placeholder implementation
    return {"message": "Lender listing endpoint"}


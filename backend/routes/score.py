"""Scoring-related routes."""
from flask import Blueprint
from auth import require_auth

bp = Blueprint("score", __name__, url_prefix="/api/score")


@bp.route("/calculate", methods=["POST"])
@require_auth
def calculate_score():
    """Calculate score for authenticated user."""
    # Placeholder implementation
    return {"message": "Score calculation endpoint"}


"""Scoring-related routes."""
from flask import Blueprint, jsonify, g, request
from auth import require_auth
from db import get_db
from services.scoring_service import calculate_credit_score
from services.gemini_service import generate_summary
import logging

logger = logging.getLogger(__name__)

bp = Blueprint("score", __name__, url_prefix="/api/score")


@bp.route("/calculate", methods=["GET"])
@require_auth
def calculate_score():
    """Calculate credit score for authenticated user using data from MongoDB.
    
    Returns:
        JSON with credit_score (0-100) and breakdown of components
    """
    try:
        user_id = g.user.get("sub")
        if not user_id:
            logger.error("User ID not found in token")
            return jsonify({
                "error": {
                    "code": "invalid_token",
                    "message": "User ID not found in token"
                }
            }), 401
        
        logger.info(f"Calculating credit score for user: {user_id}")
        db = get_db()
        
        # Fetch transactions
        transactions = list(db.transactions.find({"user_id": user_id}).limit(500))
        logger.info(f"Fetched {len(transactions)} transactions")
        for txn in transactions:
            txn.pop("_id", None)
        
        # Fetch accounts
        accounts = list(db.accounts.find({"user_id": user_id}))
        logger.info(f"Fetched {len(accounts)} accounts")
        for acc in accounts:
            acc.pop("_id", None)
        
        # Fetch holdings (for investments)
        holdings_list = list(db.holdings.find({"user_id": user_id}))
        investments = None
        if holdings_list:
            investments = {
                "holdings": holdings_list,
                "accounts": accounts  # Use accounts as investment accounts if applicable
            }
            for holding in investments["holdings"]:
                holding.pop("_id", None)
        
        # Fetch liabilities
        liabilities_list = list(db.liabilities.find({"user_id": user_id}))
        liabilities = None
        if liabilities_list:
            liabilities = {"liabilities": liabilities_list}
            for liab in liabilities["liabilities"]:
                liab.pop("_id", None)
        
        # Calculate credit score using scoring_service (does NOT use Gemini)
        logger.info("Calculating credit score...")
        score_result = calculate_credit_score(
            transactions=transactions,
            accounts=accounts if accounts else None,
            investments=investments,
            liabilities=liabilities,
            alternative_income=50000.0,  # Default value - could be made configurable
            education_score=75.0  # Default value - could be made configurable
        )
        logger.info(f"Credit score calculated: {score_result.get('credit_score')}")
        
        return jsonify(score_result), 200
        
    except Exception as e:
        logger.error(f"Error calculating credit score: {e}", exc_info=True)
        print(f"ERROR in calculate_score: {e}")  # Also print to console for debugging
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/analyze", methods=["GET"])
@require_auth
def analyze_score():
    """Get AI analysis of credit score for authenticated user using Gemini.
    
    Returns:
        JSON with AI-generated analysis text
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
        
        # Fetch transactions
        transactions = list(db.transactions.find({"user_id": user_id}).limit(500))
        for txn in transactions:
            txn.pop("_id", None)
        
        # Fetch accounts
        accounts = list(db.accounts.find({"user_id": user_id}))
        for acc in accounts:
            acc.pop("_id", None)
        
        # Fetch holdings (for investments)
        holdings_list = list(db.holdings.find({"user_id": user_id}))
        investments = None
        if holdings_list:
            investments = {
                "holdings": holdings_list,
                "accounts": accounts  # Use accounts as investment accounts if applicable
            }
            for holding in investments["holdings"]:
                holding.pop("_id", None)
        
        # Fetch liabilities
        liabilities_list = list(db.liabilities.find({"user_id": user_id}))
        liabilities = None
        if liabilities_list:
            liabilities = {"liabilities": liabilities_list}
            for liab in liabilities["liabilities"]:
                liab.pop("_id", None)
        
        # Calculate credit score first to include in analysis (using same data as calculate endpoint)
        score_result = calculate_credit_score(
            transactions=transactions,
            accounts=accounts if accounts else None,
            investments=investments,
            liabilities=liabilities,
            alternative_income=50000.0,
            education_score=75.0
        )
        
        # Prepare data for Gemini analysis
        analysis_data = {
            "credit_score": score_result.get("credit_score"),
            "breakdown": score_result.get("breakdown"),
            "total_transactions": len(transactions),
            "total_accounts": len(accounts),
            "summary": {
                "accounts_count": len(accounts),
                "transactions_count": len(transactions)
            }
        }
        
        # Generate analysis using Gemini
        prompt = f"""Analyze this credit score data and provide personalized financial insights and recommendations. 
        
Credit Score: {analysis_data['credit_score']}/100
Score Breakdown:
- Financial Accounts: {analysis_data['breakdown']['financial_accounts']['score']}/100 (Weight: {analysis_data['breakdown']['financial_accounts']['weight']}%)
- Alternative Income: {analysis_data['breakdown']['alternative_income']['score']}/100 (Weight: {analysis_data['breakdown']['alternative_income']['weight']}%)
- Education/Licenses: {analysis_data['breakdown']['education_licenses']['score']}/100 (Weight: {analysis_data['breakdown']['education_licenses']['weight']}%)
- Cash Flow Volatility: {analysis_data['breakdown']['cash_flow_volatility']['score']}/100 (Weight: {analysis_data['breakdown']['cash_flow_volatility']['weight']}%)

Financial Summary:
- Total Accounts: {analysis_data['total_accounts']}
- Total Transactions Analyzed: {analysis_data['total_transactions']}

Provide a concise, actionable analysis in 7-12 sentences with specific recommendations to improve the credit score."""
        
        gemini_response = generate_summary({"prompt": prompt})
        
        return jsonify({
            "analysis": gemini_response.get("summary", ""),
            "model": gemini_response.get("model", "gemini-pro")
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating Gemini analysis: {e}")
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500


@bp.route("/chat", methods=["POST"])
@require_auth
def chat_with_gemini():
    """Chat with Gemini AI about user's financial data and credit score.
    
    Request body:
        {
            "message": "user's question/message"
        }
    
    Returns:
        JSON with AI response text
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
        
        # Get user message from request body
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({
                "error": {
                    "code": "invalid_request",
                    "message": "Missing 'message' in request body"
                }
            }), 400
        
        user_message = data.get("message", "").strip()
        if not user_message:
            return jsonify({
                "error": {
                    "code": "invalid_request",
                    "message": "Message cannot be empty"
                }
            }), 400
        
        db = get_db()
        
        # Fetch transactions
        transactions = list(db.transactions.find({"user_id": user_id}).limit(500))
        for txn in transactions:
            txn.pop("_id", None)
        
        # Fetch accounts
        accounts = list(db.accounts.find({"user_id": user_id}))
        for acc in accounts:
            acc.pop("_id", None)
        
        # Fetch holdings (for investments)
        holdings_list = list(db.holdings.find({"user_id": user_id}))
        investments = None
        if holdings_list:
            investments = {
                "holdings": holdings_list,
                "accounts": accounts
            }
            for holding in investments["holdings"]:
                holding.pop("_id", None)
        
        # Fetch liabilities
        liabilities_list = list(db.liabilities.find({"user_id": user_id}))
        liabilities = None
        if liabilities_list:
            liabilities = {"liabilities": liabilities_list}
            for liab in liabilities["liabilities"]:
                liab.pop("_id", None)
        
        # Calculate credit score to include in context
        score_result = calculate_credit_score(
            transactions=transactions,
            accounts=accounts if accounts else None,
            investments=investments,
            liabilities=liabilities,
            alternative_income=50000.0,
            education_score=75.0
        )
        
        # Prepare financial context for Gemini
        financial_context = {
            "credit_score": score_result.get("credit_score"),
            "breakdown": score_result.get("breakdown"),
            "total_transactions": len(transactions),
            "total_accounts": len(accounts),
            "accounts": accounts[:10] if accounts else [],  # Limit to first 10 for context
            "recent_transactions": transactions[:20] if transactions else []  # Limit to recent 20
        }
        
        # Build prompt with financial context
        prompt = f"""You are a financial credit advisor helping a user understand and improve their credit score. You have access to their financial data.

CURRENT CREDIT SCORE: {financial_context['credit_score']}/100

SCORE BREAKDOWN:
- Financial Accounts: {financial_context['breakdown']['financial_accounts']['score']}/100 (Weight: {financial_context['breakdown']['financial_accounts']['weight']}%)
- Alternative Income: {financial_context['breakdown']['alternative_income']['score']}/100 (Weight: {financial_context['breakdown']['alternative_income']['weight']}%)
- Education/Licenses: {financial_context['breakdown']['education_licenses']['score']}/100 (Weight: {financial_context['breakdown']['education_licenses']['weight']}%)
- Cash Flow Volatility: {financial_context['breakdown']['cash_flow_volatility']['score']}/100 (Weight: {financial_context['breakdown']['cash_flow_volatility']['weight']}%)

FINANCIAL SUMMARY:
- Total Accounts: {financial_context['total_accounts']}
- Total Transactions Analyzed: {financial_context['total_transactions']}

USER'S QUESTION: {user_message}

Provide a helpful, personalized response as their credit advisor. Answer their question based on their current financial situation and credit score. Be specific, actionable, and encouraging. Keep your response to exactly 7-12 sentences."""
        
        # Generate response using Gemini
        gemini_response = generate_summary({"prompt": prompt})
        
        return jsonify({
            "response": gemini_response.get("summary", ""),
            "model": gemini_response.get("model", "gemini-pro")
        }), 200
        
    except Exception as e:
        logger.error(f"Error in Gemini chat: {e}", exc_info=True)
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500

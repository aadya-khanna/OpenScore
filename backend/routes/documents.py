"""Document upload and processing routes."""
import logging
from io import BytesIO
from pathlib import Path
from flask import Blueprint, request, jsonify, g
from auth import require_auth
from finance.document_pipeline import process_uploaded_documents, get_document_display_values

logger = logging.getLogger(__name__)

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")

# Directory to save uploaded PDFs
BACKEND_DIR = Path(__file__).parent.parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)


@documents_bp.route("/upload", methods=["POST"])
@require_auth
def upload_documents():
    """
    Upload income and balance PDFs for processing.
    
    Expects multipart/form-data with:
    - income_pdf: Income statement PDF file
    - balance_pdf: Balance sheet PDF file
    
    Files are saved to backend/data/ and processed immediately.
    
    Returns:
        Document-derived scores (cash_flow_volatility, strength_profitability, etc.)
    """
    try:
        # Check if files are in the request
        if "income_pdf" not in request.files:
            return jsonify({"error": "Missing income_pdf file"}), 400
        if "balance_pdf" not in request.files:
            return jsonify({"error": "Missing balance_pdf file"}), 400
        
        income_file = request.files["income_pdf"]
        balance_file = request.files["balance_pdf"]
        
        # Validate file types
        if not income_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "income_pdf must be a PDF file"}), 400
        if not balance_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "balance_pdf must be a PDF file"}), 400
        
        # Save files to backend/data/
        income_path = DATA_DIR / "income.pdf"
        balance_path = DATA_DIR / "balance.pdf"
        
        income_file.save(str(income_path))
        balance_file.save(str(balance_path))
        
        logger.info(f"Saved uploaded documents to: {income_path}, {balance_path}")
        
        # Process the saved documents
        result = get_document_display_values()
        
        return jsonify({
            "success": True,
            "scores": result,
            "files_saved": {
                "income": str(income_path),
                "balance": str(balance_path)
            },
            "original_filenames": {
                "income": income_file.filename,
                "balance": balance_file.filename
            }
        })
    
    except Exception as e:
        logger.error(f"Document processing error: {e}")
        return jsonify({"error": str(e)}), 500


@documents_bp.route("/scores", methods=["GET"])
@require_auth
def get_document_scores():
    """
    Get document scores from default PDF files.
    
    Uses backend/data/income.pdf and backend/data/balance.pdf
    
    Returns:
        Document-derived scores
    """
    try:
        result = get_document_display_values()
        return jsonify({
            "success": True,
            "scores": result
        })
    except FileNotFoundError as e:
        return jsonify({"error": str(e), "hint": "Upload PDFs via POST /api/documents/upload"}), 404
    except Exception as e:
        logger.error(f"Error getting document scores: {e}")
        return jsonify({"error": str(e)}), 500

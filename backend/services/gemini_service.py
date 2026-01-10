"""Google Gemini service for AI-powered features."""
import logging
import google.generativeai as genai
from config import Config

logger = logging.getLogger(__name__)

# Initialize Gemini client
_genai_configured = False


def _configure_gemini() -> None:
    """Configure the Gemini client with API key."""
    global _genai_configured
    if not _genai_configured and Config.GEMINI_API_KEY:
        try:
            genai.configure(api_key=Config.GEMINI_API_KEY)
            _genai_configured = True
            logger.info("Gemini client configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")
            raise
    elif not Config.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, Gemini features will be unavailable")


def generate_summary(payload: dict) -> dict:
    """Generate a summary using Gemini AI.
    
    Args:
        payload: Input data dictionary
        
    Returns:
        Dictionary with generated summary/content
        
    Raises:
        ValueError: If Gemini is not configured or generation fails
    """
    _configure_gemini()
    
    if not _genai_configured:
        raise ValueError("Gemini API key not configured")
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        
        # Create a prompt from the payload
        prompt = f"Generate a summary for the following data: {payload}"
        
        response = model.generate_content(prompt)
        
        return {
            "summary": response.text,
            "model": "gemini-pro"
        }
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        raise ValueError(f"Failed to generate summary: {e}")


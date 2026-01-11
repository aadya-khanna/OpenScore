"""Auth0 JWT verification middleware."""
import logging
import requests
from functools import wraps
from typing import Dict, Optional
import jwt
from flask import request, g, jsonify
from config import Config

logger = logging.getLogger(__name__)

# Cache for JWKS
_jwks_cache: Optional[Dict] = None


def get_token_auth_header(request) -> str:
    """Extract the Bearer token from the Authorization header.
    
    Args:
        request: Flask request object
        
    Returns:
        The JWT token string
        
    Raises:
        ValueError: If Authorization header is missing or malformed
    """
    import json
    import os
    from datetime import datetime
    log_path = "/Users/aadya/Desktop/OpenScore/backend/.cursor/debug.log"
    
    auth_header = request.headers.get("Authorization", None)
    # #region agent log
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"A","location":"auth.py:35","message":"Checking Authorization header","data":{"headerPresent":auth_header is not None,"headerValue":(auth_header[:50] + "...") if auth_header and len(auth_header) > 50 else auth_header,"headerLength":len(auth_header) if auth_header else 0},"timestamp":int(datetime.now().timestamp()*1000)}
            f.write(json.dumps(log_data) + "\n")
            f.flush()
    except Exception as e:
        logger.debug(f"Debug log write failed: {e}")
    # #endregion
    
    if not auth_header:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"A","location":"auth.py:47","message":"Authorization header missing","data":{"allHeaders":dict(request.headers)},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except Exception as e:
            logger.debug(f"Debug log write failed: {e}")
        # #endregion
        raise ValueError("Authorization header is missing. Provide: Authorization: Bearer <token>")
    
    parts = auth_header.split()
    # #region agent log
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"B","location":"auth.py:55","message":"Parsing Authorization header","data":{"partsCount":len(parts),"firstPart":parts[0] if parts else None,"allParts":parts},"timestamp":int(datetime.now().timestamp()*1000)}
            f.write(json.dumps(log_data) + "\n")
            f.flush()
    except Exception as e:
        logger.debug(f"Debug log write failed: {e}")
    # #endregion
    
    if parts[0].lower() != "bearer":
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"B","location":"auth.py:63","message":"Authorization header does not start with Bearer","data":{"firstPart":parts[0],"expected":"bearer"},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except Exception as e:
            logger.debug(f"Debug log write failed: {e}")
        # #endregion
        raise ValueError("Authorization header must start with 'Bearer'. Format: Authorization: Bearer <token>")
    
    if len(parts) != 2:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"C","location":"auth.py:71","message":"Authorization header has wrong number of parts","data":{"partsCount":len(parts),"parts":parts,"headerValue":auth_header},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except Exception as e:
            logger.debug(f"Debug log write failed: {e}")
        # #endregion
        # Include diagnostic info in error message
        error_msg = f"Authorization header must be in format: Bearer <token>. Received {len(parts)} part(s): {parts}. Header value: '{auth_header}'"
        raise ValueError(error_msg)
    
    # #region agent log
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            log_data = {"sessionId":"debug-session","runId":"auth-debug","hypothesisId":"ALL","location":"auth.py:79","message":"Token extracted successfully","data":{"tokenLength":len(parts[1]),"tokenPrefix":parts[1][:20] + "..." if len(parts[1]) > 20 else parts[1]},"timestamp":int(datetime.now().timestamp()*1000)}
            f.write(json.dumps(log_data) + "\n")
            f.flush()
    except Exception as e:
        logger.debug(f"Debug log write failed: {e}")
    # #endregion
    
    return parts[1]


def get_jwks() -> Dict:
    """Fetch and cache JWKS from Auth0.
    
    Returns:
        JWKS dictionary
    """
    global _jwks_cache
    if _jwks_cache is None:
        jwks_url = f"https://{Config.AUTH0_DOMAIN}/.well-known/jwks.json"
        try:
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            _jwks_cache = response.json()
        except Exception as e:
            logger.error(f"Failed to fetch JWKS: {e}")
            raise ValueError(f"Failed to fetch JWKS: {e}")
    return _jwks_cache


def get_rsa_key(token: str) -> Dict:
    """Get the RSA key from JWKS for the given token.
    
    Args:
        token: JWT token string
        
    Returns:
        RSA public key dictionary
    """
    import json
    import os
    from datetime import datetime
    log_path = "/Users/aadya/Desktop/OpenScore/.cursor/debug.log"
    
    try:
        unverified_header = jwt.get_unverified_header(token)
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"get-rsa-key","hypothesisId":"F","location":"auth.py:141","message":"Token header decoded","data":{"kid":unverified_header.get("kid"),"alg":unverified_header.get("alg")},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
    except Exception as e:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"get-rsa-key","hypothesisId":"F","location":"auth.py:145","message":"Failed to decode token header","data":{"error":str(e)},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        raise ValueError(f"Invalid token header: {e}")
    
    jwks = get_jwks()
    # #region agent log
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            jwks_keys = jwks.get("keys", [])
            jwks_kids = [k.get("kid") for k in jwks_keys]
            log_data = {"sessionId":"debug-session","runId":"get-rsa-key","hypothesisId":"F","location":"auth.py:155","message":"JWKS retrieved","data":{"numKeys":len(jwks_keys),"jwksKids":jwks_kids,"tokenKid":unverified_header.get("kid")},"timestamp":int(datetime.now().timestamp()*1000)}
            f.write(json.dumps(log_data) + "\n")
            f.flush()
    except: pass
    # #endregion
    
    rsa_key = {}
    token_kid = unverified_header.get("kid")
    
    for key in jwks.get("keys", []):
        if key["kid"] == token_kid:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
            # #region agent log
            try:
                os.makedirs(os.path.dirname(log_path), exist_ok=True)
                with open(log_path, "a") as f:
                    log_data = {"sessionId":"debug-session","runId":"get-rsa-key","hypothesisId":"F","location":"auth.py:165","message":"Matching key found","data":{"kid":key["kid"]},"timestamp":int(datetime.now().timestamp()*1000)}
                    f.write(json.dumps(log_data) + "\n")
                    f.flush()
            except: pass
            # #endregion
            break
    
    if not rsa_key:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"get-rsa-key","hypothesisId":"F","location":"auth.py:172","message":"ERROR: No matching key found","data":{"tokenKid":token_kid,"jwksKids":[k.get("kid") for k in jwks.get("keys", [])]},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        raise ValueError("Unable to find appropriate key")
    
    return rsa_key


def verify_jwt(token: str) -> Dict:
    """Verify JWT token signature and claims.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded JWT payload
        
    Raises:
        ValueError: If token is invalid
    """
    import json
    import os
    from datetime import datetime
    log_path = "/Users/aadya/Desktop/OpenScore/backend/.cursor/debug.log"
    
    try:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"A","location":"auth.py:168","message":"Starting JWT verification","data":{"auth0Domain":Config.AUTH0_DOMAIN,"auth0Audience":Config.AUTH0_AUDIENCE,"algorithms":Config.AUTH0_ALGORITHMS},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        
        rsa_key = get_rsa_key(token)
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(rsa_key)
        
        issuer = f"https://{Config.AUTH0_DOMAIN}/"
        
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"A","location":"auth.py:178","message":"Decoding JWT","data":{"issuer":issuer,"audience":Config.AUTH0_AUDIENCE},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        
        payload = jwt.decode(
            token,
            public_key,
            algorithms=Config.AUTH0_ALGORITHMS,
            audience=Config.AUTH0_AUDIENCE,
            issuer=issuer,
        )
        
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"ALL","location":"auth.py:189","message":"JWT verification successful","data":{"sub":payload.get("sub"),"aud":payload.get("aud"),"iss":payload.get("iss")},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        
        return payload
    except jwt.ExpiredSignatureError:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"B","location":"auth.py:197","message":"Token expired","data":{},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        raise ValueError("Token is expired")
    except jwt.InvalidAudienceError as e:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"C","location":"auth.py:205","message":"Invalid audience","data":{"expected":Config.AUTH0_AUDIENCE,"error":str(e)},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        raise ValueError(f"Invalid audience. Expected: {Config.AUTH0_AUDIENCE}")
    except jwt.InvalidIssuerError as e:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"D","location":"auth.py:213","message":"Invalid issuer","data":{"expected":f"https://{Config.AUTH0_DOMAIN}/","error":str(e)},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        raise ValueError(f"Invalid issuer. Expected: https://{Config.AUTH0_DOMAIN}/")
    except Exception as e:
        # #region agent log
        try:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a") as f:
                log_data = {"sessionId":"debug-session","runId":"verify-jwt","hypothesisId":"E","location":"auth.py:221","message":"JWT verification failed","data":{"error":str(e),"errorType":type(e).__name__},"timestamp":int(datetime.now().timestamp()*1000)}
                f.write(json.dumps(log_data) + "\n")
                f.flush()
        except: pass
        # #endregion
        logger.error(f"JWT verification failed: {e}")
        raise ValueError(f"Token verification failed: {e}")


def require_auth(f):
    """Decorator to require JWT authentication.
    
    Attaches decoded payload to flask.g.user.
    Returns 401/403 JSON errors on failure.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            token = get_token_auth_header(request)
            payload = verify_jwt(token)
            g.user = payload
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({
                "error": {
                    "code": "authentication_failed",
                    "message": str(e),
                    "help": "This endpoint requires authentication. Provide an Auth0 JWT token in the Authorization header: Authorization: Bearer <your-token>",
                    "public_endpoints": [
                        "GET / - API documentation",
                        "GET /health - Health check"
                    ],
                    "documentation": "See GET / for full API documentation"
                }
            }), 401
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return jsonify({
                "error": {
                    "code": "authentication_error",
                    "message": "Authentication failed",
                    "help": "This endpoint requires authentication. Provide an Auth0 JWT token in the Authorization header: Authorization: Bearer <your-token>",
                    "public_endpoints": [
                        "GET / - API documentation",
                        "GET /health - Health check"
                    ],
                    "documentation": "See GET / for full API documentation"
                }
            }), 401
    
    return decorated_function


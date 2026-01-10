# OpenScore Backend

Flask backend for OpenScore hackathon project with Auth0 JWT authentication, MongoDB, Plaid, and Google Gemini integration.

## Setup

1. **Create and activate virtual environment (if not already created):**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   # or
   .venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   **Note:** If you see "No such file or directory" errors, make sure you're using `.venv` (with a dot) not `venv`, or activate the virtual environment first.

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your credentials:
   - Auth0 domain and audience
   - MongoDB Atlas connection string
   - Plaid client ID and secret
   - Google Gemini API key

3. **Run the application:**
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test `/api/me` Endpoint

The `/api/me` endpoint requires Auth0 JWT authentication. To test:

1. **Get an Auth0 access token** (using Auth0 Dashboard, Postman, or your frontend)

2. **Make a request with Bearer token:**
   ```bash
   curl -X GET http://localhost:5000/api/me \
     -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"
   ```

3. **Expected response:**
   ```json
   {
     "user_id": "auth0|...",
     "email": "user@example.com",
     "lastSeenAt": "2024-01-01T12:00:00.000000"
   }
   ```

The endpoint will:
- Verify the JWT token signature using Auth0 JWKS
- Validate audience and issuer
- Write/update user record in MongoDB `users` collection
- Return the stored user document

## API Endpoints

- `GET /health` - Health check (no auth required)
- `GET /api/me` - Get current user info (requires auth)
- `POST /api/plaid/link-token` - Create Plaid link token (requires auth)
- `POST /api/score/calculate` - Calculate score (requires auth, placeholder)
- `GET /api/lender/list` - List lenders (requires auth, placeholder)

## Project Structure

```
backend/
├── app.py                 # Flask application and main endpoints
├── config.py             # Configuration management
├── auth.py               # Auth0 JWT verification middleware
├── db.py                 # MongoDB client
├── routes/                # API route blueprints
│   ├── plaid.py
│   ├── score.py
│   └── lender.py
├── services/             # Business logic services
│   ├── plaid_service.py
│   ├── gemini_service.py
│   └── scoring_service.py
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variable template
└── README.md            # This file
```

## Error Handling

All endpoints return consistent JSON error responses:
```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message"
  }
}
```

## Authentication

All protected endpoints use the `@require_auth` decorator which:
- Extracts Bearer token from `Authorization` header
- Verifies JWT signature using Auth0 JWKS
- Validates audience and issuer
- Attaches decoded payload to `flask.g.user`


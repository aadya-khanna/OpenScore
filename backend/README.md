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

### Testing Plaid Integration Endpoints

All Plaid endpoints require Auth0 JWT authentication. Replace `YOUR_AUTH0_ACCESS_TOKEN` with your actual Auth0 access token in all examples below.

#### 1. Create a Plaid Link Token

First, create a link token to initialize Plaid Link in your frontend:

```bash
curl -X POST http://localhost:5000/api/plaid/link-token \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "link_token": "link-sandbox-..."
}
```

#### 2. Exchange Public Token for Access Token

After the user completes Plaid Link in your frontend, you'll receive a `public_token`. Exchange it for an `access_token`:

```bash
curl -X POST http://localhost:5000/api/plaid/exchange \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "public_token": "public-sandbox-..."
  }'
```

**Expected response:**
```json
{
  "ok": true,
  "item_id": "item-..."
}
```

This stores the `access_token` in MongoDB keyed by your Auth0 user ID (`sub` claim).

#### 3. Sync Transactions

Fetch and store the last 90 days of transactions:

```bash
curl -X POST http://localhost:5000/api/plaid/transactions/sync \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "inserted": 45,
  "updated": 12
}
```

#### 4. Sync Balances

Fetch and store current account balances:

```bash
curl -X POST http://localhost:5000/api/plaid/balances/sync \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "accounts": 3
}
```

#### 5. Sync Income (Optional)

Attempt to fetch income data (may not be available in sandbox):

```bash
curl -X POST http://localhost:5000/api/plaid/income/sync \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response (if available):**
```json
{
  "available": true,
  "data": { ... }
}
```

**Expected response (if not available):**
```json
{
  "available": false,
  "message": "Income data is not available for this Plaid item..."
}
```

#### 6. Retrieve Stored Data

Get the last 100 transactions:

```bash
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"
```

Get account balances:

```bash
curl -X GET http://localhost:5000/api/balances \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"
```

Get income data:

```bash
curl -X GET http://localhost:5000/api/income \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"
```

### Important Notes

- **Authentication**: All `/api/*` endpoints require an `Authorization: Bearer <token>` header with a valid Auth0 JWT token.
- **User ID**: The user ID is automatically derived from the JWT `sub` claim. Never send `userId` in the request body.
- **Demo Safety**: If a user hasn't connected Plaid yet, sync endpoints will return a 400 error with a clear message.
- **Access Token Storage**: For hackathon/demo purposes, Plaid access tokens are stored in plaintext in MongoDB. **In production, these should be encrypted.**

## API Endpoints

### General
- `GET /health` - Health check (no auth required)
- `GET /api/me` - Get current user info (requires auth)

### Plaid Integration
- `POST /api/plaid/link-token` - Create Plaid link token (requires auth)
- `POST /api/plaid/exchange` - Exchange public token for access token (requires auth)
- `POST /api/plaid/transactions/sync` - Sync transactions from Plaid (requires auth)
- `POST /api/plaid/balances/sync` - Sync account balances from Plaid (requires auth)
- `POST /api/plaid/income/sync` - Sync income data from Plaid (requires auth, may not be available)

### Data Retrieval
- `GET /api/transactions` - Get last 100 stored transactions (requires auth)
- `GET /api/balances` - Get latest account balances (requires auth)
- `GET /api/income` - Get latest income snapshot (requires auth)

### Other
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
│   ├── data.py
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


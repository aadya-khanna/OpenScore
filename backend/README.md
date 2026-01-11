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
   - SANDBOX_JSON_PATH (optional, defaults to "../sandbox_output.json")
   - DATA_ENCRYPTION_KEY (optional, for encrypting access tokens)

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

### Testing Sandbox Data Loading

Load sandbox data from a local JSON file:

```bash
curl -X POST http://localhost:5000/api/sandbox/load \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"
```

**Expected response:**
```json
{
  "ok": true,
  "fileLoaded": true,
  "counts": {
    "accounts": 10,
    "transactions": 100,
    "holdings": 5,
    "liabilities": 3
  },
  "storedAccessToken": true
}
```

This endpoint:
- Reads the JSON file from `SANDBOX_JSON_PATH` (defaults to `../sandbox_output.json` relative to backend/)
- Parses and sanitizes the payload (removes access_token/public_token)
- Stores data in MongoDB collections: accounts, transactions, holdings, liabilities
- Stores a sanitized snapshot in raw_snapshots collection
- Returns counts of stored records

After loading, you can retrieve data using the new data endpoints:

```bash
# Get accounts
curl -X GET http://localhost:5000/api/data/accounts \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"

# Get transactions (limit 50)
curl -X GET http://localhost:5000/api/data/transactions?limit=50 \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"

# Get holdings
curl -X GET http://localhost:5000/api/data/holdings \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"

# Get liabilities
curl -X GET http://localhost:5000/api/data/liabilities \
  -H "Authorization: Bearer YOUR_AUTH0_ACCESS_TOKEN"

# Get summary statistics
curl -X GET http://localhost:5000/api/data/summary \
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

### Sandbox Data Loading
- `POST /api/sandbox/load` - Load sandbox JSON file and persist to MongoDB (requires auth)

### New Data Endpoints
- `GET /api/data/accounts` - Get accounts for current user (requires auth)
- `GET /api/data/transactions?limit=50` - Get transactions with limit (requires auth)
- `GET /api/data/holdings` - Get holdings for current user (requires auth)
- `GET /api/data/liabilities` - Get liabilities for current user (requires auth)
- `GET /api/data/summary` - Get aggregate summary statistics (requires auth)

### Other
- `POST /api/score/calculate` - Calculate score (requires auth, placeholder)
- `GET /api/lender/list` - List lenders (requires auth, placeholder)

### Lender Dashboard Endpoints (X-Lender-Token required)

**Authentication:** These endpoints use a separate authentication system. Use `POST /api/lender/login` to get a session token, then include it in the `X-Lender-Token` header.

- `POST /api/lender/login` - Lender login (no auth, returns token)
- `POST /api/lender/logout` - Lender logout
- `GET /api/lender/session` - Get current lender session info
- `POST /api/lender/applications/create` - Create loan application
- `GET /api/lender/applications` - List applications (query: status?, limit?)
- `GET /api/lender/applications/<id>` - Get application detail with risk snapshot
- `POST /api/lender/applications/<id>/decision` - Record decision (approve/reject/etc)
- `POST /api/lender/applications/<id>/notes` - Add note to application
- `POST /api/lender/applications/<id>/recompute` - Recompute risk snapshot

## Lender Authentication

The lender dashboard uses a simple password-based authentication system separate from Auth0.

### Environment Variable

Set `LENDER_PASSWORD` in your `.env` file:
```
LENDER_PASSWORD=dinobank123
```

Default password is `dinobank123` if not set.

### Lender API Examples

#### 1. Login to get a session token

```bash
curl -X POST http://localhost:5000/api/lender/login \
  -H "Content-Type: application/json" \
  -d '{"password": "dinobank123"}'
```

**Response:**
```json
{
  "ok": true,
  "token": "abc123...",
  "lender": {
    "lender_id": "dinobank",
    "lender_name": "Dino Bank"
  },
  "expires_at": "2024-01-02T12:00:00.000000"
}
```

Save the `token` value for subsequent requests.

#### 2. Create an application

```bash
export LENDER_TOKEN="your_token_here"

curl -X POST http://localhost:5000/api/lender/applications/create \
  -H "X-Lender-Token: $LENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "auth0|1234567890",
    "requested_amount": 5000,
    "purpose": "personal loan"
  }'
```

**Response:**
```json
{
  "ok": true,
  "application_id": "uuid-here"
}
```

#### 3. List applications

```bash
# All applications
curl -X GET "http://localhost:5000/api/lender/applications" \
  -H "X-Lender-Token: $LENDER_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/lender/applications?status=submitted&limit=20" \
  -H "X-Lender-Token: $LENDER_TOKEN"
```

**Response:**
```json
{
  "ok": true,
  "applications": [
    {
      "application_id": "uuid",
      "user_id": "auth0|...",
      "status": "submitted",
      "openscore": 720,
      "risk_level": "low",
      "confidence": "high",
      "metrics": {
        "monthly_income": 5000,
        "monthly_spend": 3000,
        "net_cashflow": 2000
      },
      "flags": [
        {"code": "CONSISTENT_RENT", "severity": "low", "message": "..."}
      ],
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "count": 1
}
```

#### 4. Get application detail

```bash
curl -X GET "http://localhost:5000/api/lender/applications/APPLICATION_ID" \
  -H "X-Lender-Token: $LENDER_TOKEN"
```

**Response includes:**
- Full application details
- Risk snapshot (openscore, metrics, flags, explain)
- Chart-ready aggregates (monthly income/spend, top categories, recent transactions)
- Notes and decision history
- User info (if available)

#### 5. Record a decision

```bash
curl -X POST "http://localhost:5000/api/lender/applications/APPLICATION_ID/decision" \
  -H "X-Lender-Token: $LENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "reason_codes": ["GOOD_INCOME", "LOW_RISK"],
    "note": "Strong financial profile"
  }'
```

Valid actions: `approve`, `reject`, `request_info`, `set_review`

**Response:**
```json
{
  "ok": true,
  "status": "approved"
}
```

#### 6. Add a note

```bash
curl -X POST "http://localhost:5000/api/lender/applications/APPLICATION_ID/notes" \
  -H "X-Lender-Token: $LENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body": "Called applicant, verified employment"}'
```

#### 7. Recompute risk snapshot

```bash
curl -X POST "http://localhost:5000/api/lender/applications/APPLICATION_ID/recompute" \
  -H "X-Lender-Token: $LENDER_TOKEN"
```

Returns the updated snapshot with fresh metrics computed from latest user data.

## Project Structure

```
backend/
├── app.py                 # Flask application and main endpoints
├── config.py             # Configuration management
├── auth.py               # Auth0 JWT verification middleware
├── db.py                 # MongoDB client and indexes
├── routes/                # API route blueprints
│   ├── plaid.py          # Plaid integration endpoints
│   ├── data.py           # User data retrieval endpoints
│   ├── score.py          # Credit score endpoints
│   ├── lender.py         # Lender placeholder (Auth0)
│   ├── lender_auth.py    # Lender login/logout endpoints
│   ├── lender_api.py     # Lender application management
│   └── sandbox_loader.py # Sandbox data loading
├── services/             # Business logic services
│   ├── plaid_service.py          # Plaid API integration
│   ├── gemini_service.py         # Google Gemini AI
│   ├── scoring_service.py        # User credit score calculation
│   ├── sandbox_storage_service.py # Sandbox data persistence
│   ├── lender_auth_service.py    # Lender session management
│   ├── lender_scoring_service.py # Risk scoring for lenders
│   └── lender_store_service.py   # Lender MongoDB operations
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


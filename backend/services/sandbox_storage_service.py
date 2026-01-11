"""Service for loading and storing sandbox data from JSON file to MongoDB."""
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet

from config import Config
from db import get_db

logger = logging.getLogger(__name__)

# Global Fernet instance (cached)
_fernet: Optional[Fernet] = None


def get_fernet() -> Optional[Fernet]:
    """Get or create Fernet instance for encryption.
    
    Returns:
        Fernet instance if DATA_ENCRYPTION_KEY is set, None otherwise
    """
    global _fernet
    if _fernet is None and Config.DATA_ENCRYPTION_KEY:
        try:
            _fernet = Fernet(Config.DATA_ENCRYPTION_KEY.encode())
        except Exception as e:
            logger.warning(f"Failed to initialize Fernet encryption: {e}")
            return None
    return _fernet


def load_json_file(path: str) -> Dict[str, Any]:
    """Load JSON file from path.
    
    Args:
        path: Path to JSON file (can be relative to backend/ or absolute)
        
    Returns:
        Parsed JSON dictionary
        
    Raises:
        FileNotFoundError: If file doesn't exist
        json.JSONDecodeError: If file is not valid JSON
    """
    # Resolve path relative to backend directory if relative
    backend_dir = Path(__file__).parent.parent
    file_path = Path(path)
    
    if not file_path.is_absolute():
        file_path = backend_dir / file_path
    
    file_path = file_path.resolve()
    
    logger.info(f"Loading JSON file from: {file_path}")
    
    with open(file_path, 'r') as f:
        return json.load(f)


def sanitize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Remove sensitive token fields from payload.
    
    Recursively removes any access_token or public_token fields
    from nested dictionaries.
    
    Args:
        payload: Dictionary to sanitize (will be copied, not mutated)
        
    Returns:
        Sanitized dictionary
    """
    def _sanitize_recursive(obj: Any) -> Any:
        if isinstance(obj, dict):
            sanitized = {}
            for key, value in obj.items():
                if key in ('access_token', 'public_token'):
                    # Skip these keys
                    continue
                sanitized[key] = _sanitize_recursive(value)
            return sanitized
        elif isinstance(obj, list):
            return [_sanitize_recursive(item) for item in obj]
        else:
            return obj
    
    return _sanitize_recursive(payload)


def redact_token(token: str) -> str:
    """Redact a token to show only first 6 and last 6 characters.
    
    Args:
        token: Token string to redact
        
    Returns:
        Redacted token like "public-...last6"
    """
    if not token or len(token) <= 12:
        return "***"
    prefix = token[:6]
    suffix = token[-6:]
    return f"{prefix}...{suffix}"


def upsert_from_payload(db, user_id: str, payload: Dict[str, Any]) -> Dict[str, int]:
    """Extract data from payload and upsert to MongoDB collections.
    
    Args:
        db: MongoDB database instance
        user_id: User ID from JWT sub claim
        payload: Parsed JSON payload from sandbox file
        
    Returns:
        Dictionary with counts: {accounts, transactions, holdings, liabilities, storedAccessToken}
    """
    now = datetime.utcnow()
    counts = {
        'accounts': 0,
        'transactions': 0,
        'holdings': 0,
        'liabilities': 0,
        'storedAccessToken': False
    }
    
    # Upsert user record
    user_doc = {
        '_id': user_id,
        'lastSeenAt': now.isoformat(),
    }
    # Add email/name if available in JWT (will be set by caller if needed)
    # For now, just update lastSeenAt
    db.users.update_one(
        {'_id': user_id},
        {'$set': user_doc},
        upsert=True
    )
    
    # Extract and store tokens
    public_token = None
    access_token = None
    
    if 'create_sandbox_public_token' in payload:
        public_token = payload['create_sandbox_public_token'].get('public_token')
    
    if 'exchange_public_token' in payload:
        access_token = payload['exchange_public_token'].get('access_token')
    
    # Store tokens
    if public_token or access_token:
        token_doc = {
            'user_id': user_id,
            'public_token_redacted': redact_token(public_token) if public_token else None,
            'has_access_token': bool(access_token),
            'updatedAt': now.isoformat()
        }
        
        # Encrypt access token if encryption key is available
        fernet = get_fernet()
        if access_token and fernet:
            try:
                encrypted_token = fernet.encrypt(access_token.encode())
                token_doc['access_token_encrypted_or_null'] = encrypted_token.decode()
                counts['storedAccessToken'] = True
            except Exception as e:
                logger.error(f"Failed to encrypt access token: {e}")
                # Don't store unencrypted token
        elif access_token:
            # No encryption key, don't store token
            logger.info("DATA_ENCRYPTION_KEY not set, skipping access_token storage")
        
        db.plaid_tokens.update_one(
            {'user_id': user_id},
            {'$set': token_doc},
            upsert=True
        )
    
    # Extract and store accounts
    accounts_data = None
    if 'get_accounts' in payload:
        accounts_data = payload['get_accounts'].get('accounts', [])
    elif 'get_balance' in payload and 'balance_data' in payload['get_balance']:
        accounts_data = payload['get_balance']['balance_data'].get('accounts', [])
    
    if accounts_data:
        for acc in accounts_data:
            account_id = acc.get('account_id')
            if not account_id:
                continue
            
            account_doc = {
                'user_id': user_id,
                'account_id': account_id,
                'name': acc.get('name'),
                'type': acc.get('type'),
                'subtype': acc.get('subtype'),
                'mask': acc.get('mask'),
                'official_name': acc.get('official_name'),
                'balances': acc.get('balances', {}),
                'updatedAt': now.isoformat()
            }
            
            db.accounts.update_one(
                {'user_id': user_id, 'account_id': account_id},
                {'$set': account_doc},
                upsert=True
            )
            counts['accounts'] += 1
    
    # Extract and store transactions
    if 'get_transactions' in payload:
        transactions_data = payload['get_transactions'].get('transactions', [])
        
        for txn in transactions_data:
            transaction_id = txn.get('transaction_id')
            
            # Generate deterministic ID if missing
            if not transaction_id:
                # Use sha256(user_id + account_id + date + name + amount)
                txn_str = f"{user_id}{txn.get('account_id', '')}{txn.get('date', '')}{txn.get('name', '')}{txn.get('amount', 0)}"
                transaction_id = hashlib.sha256(txn_str.encode()).hexdigest()
            
            transaction_doc = {
                'user_id': user_id,
                'transaction_id': transaction_id,
                'account_id': txn.get('account_id'),
                'date': txn.get('date'),
                'name': txn.get('name'),
                'amount': txn.get('amount'),
                'category': txn.get('category'),
                'merchant_name': txn.get('merchant_name'),
                'pending': txn.get('pending', False),
                'payment_channel': txn.get('payment_channel'),
                'raw': txn,
                'updatedAt': now.isoformat()
            }
            
            db.transactions.update_one(
                {'user_id': user_id, 'transaction_id': transaction_id},
                {'$set': transaction_doc},
                upsert=True
            )
            counts['transactions'] += 1
    
    # Extract and store holdings
    if 'get_investments_holdings' in payload:
        holdings_data = payload['get_investments_holdings'].get('investments_holdings', {}).get('holdings', [])
        
        for holding in holdings_data:
            account_id = holding.get('account_id')
            security_id = holding.get('security_id')
            
            if not account_id or not security_id:
                continue
            
            holding_doc = {
                'user_id': user_id,
                'account_id': account_id,
                'security_id': security_id,
                'quantity': holding.get('quantity'),
                'cost_basis': holding.get('cost_basis'),
                'institution_value': holding.get('institution_value'),
                'raw': holding,
                'updatedAt': now.isoformat()
            }
            
            db.holdings.update_one(
                {'user_id': user_id, 'account_id': account_id, 'security_id': security_id},
                {'$set': holding_doc},
                upsert=True
            )
            counts['holdings'] += 1
    
    # Extract and store liabilities
    if 'get_liabilities' in payload:
        liabilities_data = payload['get_liabilities'].get('liabilities_data', {})
        
        # Extract mortgage, student, credit arrays
        for liability_type in ['mortgage', 'student', 'credit']:
            liability_list = liabilities_data.get(liability_type, [])
            
            for liability in liability_list:
                account_id = liability.get('account_id')
                if not account_id:
                    continue
                
                liability_doc = {
                    'user_id': user_id,
                    'account_id': account_id,
                    'liability_type': liability_type,
                    'raw': liability,
                    'updatedAt': now.isoformat()
                }
                
                db.liabilities.update_one(
                    {'user_id': user_id, 'account_id': account_id, 'liability_type': liability_type},
                    {'$set': liability_doc},
                    upsert=True
                )
                counts['liabilities'] += 1
    
    return counts


def compute_summary(db, user_id: str) -> Dict[str, Any]:
    """Compute aggregate summary statistics for user.
    
    Args:
        db: MongoDB database instance
        user_id: User ID from JWT sub claim
        
    Returns:
        Dictionary with totals, monthlySpend, topCategories
    """
    summary = {
        'totals': {},
        'monthlySpend': [],
        'topCategories': []
    }
    
    # Compute total current balance across depository accounts
    depository_accounts = list(db.accounts.find({
        'user_id': user_id,
        'type': 'depository'
    }))
    
    total_current_balance = 0.0
    for acc in depository_accounts:
        balances = acc.get('balances', {})
        current = balances.get('current')
        if current is not None:
            total_current_balance += float(current)
    
    summary['totals'] = {
        'current_balance': total_current_balance
    }
    
    # Compute monthly spend from transactions
    # Group by YYYY-MM, sum negative amounts as spend
    pipeline = [
        {'$match': {'user_id': user_id}},
        {'$project': {
            'amount': 1,
            'date': 1,
            'year_month': {'$substr': ['$date', 0, 7]}  # Extract YYYY-MM
        }},
        {'$match': {'amount': {'$lt': 0}}},  # Only negative amounts (spend)
        {'$group': {
            '_id': '$year_month',
            'total_spend': {'$sum': {'$abs': '$amount'}}  # Sum absolute value
        }},
        {'$sort': {'_id': 1}},
        {'$project': {
            '_id': 0,
            'month': '$_id',
            'spend': '$total_spend'
        }}
    ]
    
    monthly_spend = list(db.transactions.aggregate(pipeline))
    summary['monthlySpend'] = monthly_spend
    
    # Compute top 5 categories by spend
    category_pipeline = [
        {'$match': {'user_id': user_id, 'amount': {'$lt': 0}}},
        {'$unwind': {'path': '$category', 'preserveNullAndEmptyArrays': True}},
        {'$group': {
            '_id': '$category',
            'total_spend': {'$sum': {'$abs': '$amount'}}
        }},
        {'$sort': {'total_spend': -1}},
        {'$limit': 5},
        {'$project': {
            '_id': 0,
            'category': '$_id',
            'spend': '$total_spend'
        }}
    ]
    
    top_categories = list(db.transactions.aggregate(category_pipeline))
    summary['topCategories'] = top_categories
    
    return summary


def ensure_indexes(db) -> None:
    """Create MongoDB indexes for optimal query performance.
    
    Args:
        db: MongoDB database instance
    """
    try:
        # Accounts: unique index on (user_id, account_id)
        db.accounts.create_index([("user_id", 1), ("account_id", 1)], unique=True)
        logger.info("Created index on accounts (user_id, account_id)")
        
        # Transactions: unique index on (user_id, transaction_id)
        db.transactions.create_index([("user_id", 1), ("transaction_id", 1)], unique=True)
        logger.info("Created index on transactions (user_id, transaction_id)")
        
        # Holdings: unique index on (user_id, account_id, security_id)
        db.holdings.create_index([("user_id", 1), ("account_id", 1), ("security_id", 1)], unique=True)
        logger.info("Created index on holdings (user_id, account_id, security_id)")
        
        # Liabilities: unique index on (user_id, account_id, liability_type)
        db.liabilities.create_index([("user_id", 1), ("account_id", 1), ("liability_type", 1)], unique=True)
        logger.info("Created index on liabilities (user_id, account_id, liability_type)")
        
        # Raw snapshots: index on (user_id, createdAt desc)
        db.raw_snapshots.create_index([("user_id", 1), ("createdAt", -1)])
        logger.info("Created index on raw_snapshots (user_id, createdAt)")
        
    except Exception as e:
        logger.warning(f"Failed to create MongoDB indexes (non-fatal): {e}")

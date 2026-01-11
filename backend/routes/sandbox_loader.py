"""Sandbox data loading routes."""
import json
import logging
from datetime import datetime
from flask import Blueprint, jsonify, g
from auth import require_auth
from db import get_db
from config import Config
from services.sandbox_storage_service import (
    load_json_file,
    sanitize_payload,
    upsert_from_payload
)

logger = logging.getLogger(__name__)

bp = Blueprint("sandbox_loader", __name__, url_prefix="/api/sandbox")


@bp.route("/load", methods=["POST"])
@require_auth
def load_sandbox():
    """Load sandbox JSON file and persist to MongoDB.
    
    Reads the JSON file from SANDBOX_JSON_PATH, parses it, sanitizes tokens,
    and upserts data to MongoDB collections.
    
    Returns:
        JSON with ok status, fileLoaded, counts, and storedAccessToken flag
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
        
        # Load JSON file
        try:
            payload = load_json_file(Config.SANDBOX_JSON_PATH)
        except FileNotFoundError:
            return jsonify({
                "error": {
                    "code": "file_not_found",
                    "message": f"Sandbox JSON file not found at: {Config.SANDBOX_JSON_PATH}"
                }
            }), 404
        except json.JSONDecodeError as e:
            return jsonify({
                "error": {
                    "code": "invalid_json",
                    "message": f"Failed to parse JSON file: {str(e)}"
                }
            }), 400
        
        # Sanitize payload for raw_snapshots
        sanitized_payload = sanitize_payload(payload)
        
        # Store raw snapshot (sanitized)
        from pathlib import Path
        
        backend_dir = Path(__file__).parent.parent
        file_path = Path(Config.SANDBOX_JSON_PATH)
        if not file_path.is_absolute():
            file_path = backend_dir / file_path
        file_path = file_path.resolve()
        
        snapshot_doc = {
            'user_id': user_id,
            'source': 'local_file',
            'file_path': str(file_path),
            'payload': sanitized_payload,
            'createdAt': datetime.utcnow().isoformat()
        }
        db.raw_snapshots.insert_one(snapshot_doc)
        
        # Upsert data from payload
        counts = upsert_from_payload(db, user_id, payload)
        
        # Debug: Display users from MongoDB (print to terminal)
        print("=" * 60)
        print("DEBUG: Fetching users from MongoDB")
        print("=" * 60)
        users_list = list(db.users.find({}))
        print(f"Total users in database: {len(users_list)}")
        for user in users_list:
            # Convert MongoDB ObjectId to string if present
            user_dict = dict(user)
            if '_id' in user_dict:
                user_dict['_id'] = str(user_dict['_id'])
            print(f"User: {user_dict}")
        
        # Debug: Display accounts for this user
        print("=" * 60)
        print(f"DEBUG: Fetching accounts for user_id: {user_id}")
        print("=" * 60)
        accounts_list = list(db.accounts.find({"user_id": user_id}))
        print(f"Total accounts for user: {len(accounts_list)}")
        for acc in accounts_list:
            acc_dict = dict(acc)
            if '_id' in acc_dict:
                acc_dict['_id'] = str(acc_dict['_id'])
            print(f"Account ID: {acc.get('account_id')}")
            print(f"  Name: {acc.get('name')}")
            print(f"  Type: {acc.get('type')}")
            print(f"  Subtype: {acc.get('subtype')}")
            print(f"  Full doc: {acc_dict}")
        
        # Debug: Display transactions count
        transactions_count = db.transactions.count_documents({"user_id": user_id})
        print(f"Total transactions for user: {transactions_count}")
        
        # Debug: Display sample transactions
        sample_transactions = list(db.transactions.find({"user_id": user_id}).limit(3))
        print(f"Sample transactions (first 3):")
        for txn in sample_transactions:
            txn_dict = dict(txn)
            if '_id' in txn_dict:
                txn_dict['_id'] = str(txn_dict['_id'])
            print(f"  Transaction: {txn.get('transaction_id')} - {txn.get('name')} - ${txn.get('amount')}")
        
        # Debug: Display raw_snapshots count
        snapshots_count = db.raw_snapshots.count_documents({"user_id": user_id})
        print(f"Total raw_snapshots for user: {snapshots_count}")
        
        # Debug: Display holdings count
        holdings_count = db.holdings.count_documents({"user_id": user_id})
        print(f"Total holdings for user: {holdings_count}")
        
        # Debug: Display liabilities count
        liabilities_count = db.liabilities.count_documents({"user_id": user_id})
        print(f"Total liabilities for user: {liabilities_count}")
        
        print("=" * 60)
        print(f"Summary: accounts={counts['accounts']}, transactions={counts['transactions']}, holdings={counts['holdings']}, liabilities={counts['liabilities']}")
        print("=" * 60)
        
        # Update user record with email/name from JWT if available
        user_update = {}
        if g.user.get('email'):
            user_update['email'] = g.user['email']
        if g.user.get('name'):
            user_update['name'] = g.user['name']
        user_doc = db.users.find_one({'_id': user_id})
        if not user_doc or 'createdAt' not in user_doc:
            user_update['createdAt'] = datetime.utcnow().isoformat()
        
        if user_update:
            db.users.update_one(
                {'_id': user_id},
                {'$set': user_update},
                upsert=True
            )
        
        return jsonify({
            'ok': True,
            'fileLoaded': True,
            'counts': {
                'accounts': counts['accounts'],
                'transactions': counts['transactions'],
                'holdings': counts['holdings'],
                'liabilities': counts['liabilities']
            },
            'storedAccessToken': counts['storedAccessToken']
        }), 200
        
    except Exception as e:
        logger.error(f"Error in /api/sandbox/load: {e}", exc_info=True)
        return jsonify({
            "error": {
                "code": "server_error",
                "message": str(e)
            }
        }), 500

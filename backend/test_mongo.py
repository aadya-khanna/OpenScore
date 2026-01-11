# test_mongodb.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_db, get_client

try:
    # Test connection
    client = get_client()
    client.admin.command("ping")
    print("✅ MongoDB connection successful!")
    
    # Test database access
    db = get_db()
    print(f"✅ Connected to database: {db.name}")
    
    # List collections
    collections = db.list_collection_names()
    print(f"✅ Collections in database: {collections}")
    
    # Test a simple query
    users_count = db.users.count_documents({})
    print(f"✅ Users collection has {users_count} documents")
    
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    sys.exit(1)
import aiosqlite
import os
import logging
import bcrypt
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_PATH = os.getenv("DATABASE_PATH", "authcenter.db")
_db_connection: Optional[aiosqlite.Connection] = None

async def get_database() -> aiosqlite.Connection:
    """Get database connection singleton"""
    global _db_connection
    if _db_connection is None:
        _db_connection = await aiosqlite.connect(DATABASE_PATH)
        _db_connection.row_factory = aiosqlite.Row
    return _db_connection

async def init_database():
    """Initialize database with all required tables and seed data"""
    db = await get_database()
    
    # Create tables
    await create_tables(db)
    
    # Seed initial data
    await seed_providers(db)
    await seed_admin(db)
    await seed_internal_apps(db)
    
    await db.commit()
    logger.info("Database initialized successfully")

async def create_tables(db: aiosqlite.Connection):
    """Create all required database tables"""
    
    # Users table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Providers table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            oauth_config TEXT NOT NULL,
            scopes TEXT NOT NULL,
            enabled BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Connections table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
            external_id TEXT NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            expires_at DATETIME,
            scopes TEXT,
            metadata TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, provider_id, external_id)
        )
    """)

    # Audit logs table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            resource TEXT,
            details TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Admin config table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS admin_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL DEFAULT 'admin',
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Internal apps table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS internal_apps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            api_endpoints TEXT,
            manifest_data TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # App mappings table
    await db.execute("""
        CREATE TABLE IF NOT EXISTS app_mappings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_service TEXT NOT NULL,
            internal_app_id INTEGER REFERENCES internal_apps(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mapping_config TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

async def seed_providers(db: aiosqlite.Connection):
    """Seed initial providers data"""
    await db.execute("""
        INSERT OR IGNORE INTO providers (name, display_name, oauth_config, scopes)
        VALUES (?, ?, ?, ?)
    """, (
        'google',
        'Google',
        '{"authUrl": "https://accounts.google.com/o/oauth2/auth", "tokenUrl": "https://oauth2.googleapis.com/token"}',
        'email,profile,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar'
    ))

async def seed_admin(db: aiosqlite.Connection):
    """Seed admin user with default password"""
    # Hash the default password "De7au!t"
    password_hash = bcrypt.hashpw(b'De7au!t', bcrypt.gensalt()).decode('utf-8')
    
    await db.execute("""
        INSERT OR IGNORE INTO admin_config (id, username, password_hash)
        VALUES (?, ?, ?)
    """, (1, 'admin', password_hash))
    
    logger.info("Admin user seeded with default password")

async def seed_internal_apps(db: aiosqlite.Connection):
    """Seed internal applications - focused on Magnetiq CMS only"""
    manifest_data = {
        "pcarp_version": "1.0",
        "app": {
            "name": "magnetiq",
            "type": "internal",
            "description": "Website CMS for content management",
            "version": "1.0.0",
            "developer": "Voltaic Systems"
        },
        "authentication": {
            "required_scopes": ["email.read", "calendar.read"],
            "callback_urls": ["https://voltaic.systems/api/auth/callback"],
            "webhook_url": "https://voltaic.systems/api/auth/webhook"
        },
        "capabilities": {
            "data_types": ["email", "calendar"],
            "operations": ["read", "sync", "publish"],
            "realtime": True
        }
    }
    
    api_endpoints = {
        "webhook": "https://voltaic.systems/api/auth/webhook",
        "health": "https://voltaic.systems/api/health"
    }
    
    import json
    # Only insert if app doesn't already exist
    cursor = await db.execute("SELECT id FROM internal_apps WHERE name = ? AND display_name = ?", 
                               ('magnetiq', 'Magnetiq CMS'))
    existing = await cursor.fetchone()
    
    if not existing:
        await db.execute("""
            INSERT INTO internal_apps (name, display_name, description, logo_url, api_endpoints, manifest_data)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            'magnetiq',
            'Magnetiq CMS',
            'Website content management system for dynamic content creation and publishing',
            '/logos/magnetiq.svg',
            json.dumps(api_endpoints),
            json.dumps(manifest_data)
        ))
    
    logger.info("Internal apps seeded successfully")
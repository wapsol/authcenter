import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { logger } from '../utils/logger';

let db: Database;

export async function connectDatabase(): Promise<void> {
  try {
    db = await open({
      filename: './authcenter.db',
      driver: sqlite3.Database
    });
    
    logger.info('Connected to SQLite database');
    
    await createTables();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProvidersTable = `
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      oauth_config TEXT NOT NULL,
      scopes TEXT NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createConnectionsTable = `
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
    );
  `;

  const createAuditLogsTable = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      resource TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createAdminConfigTable = `
    CREATE TABLE IF NOT EXISTS admin_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createInternalAppsTable = `
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
    );
  `;

  const createAppMappingsTable = `
    CREATE TABLE IF NOT EXISTS app_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
      internal_app_id INTEGER REFERENCES internal_apps(id) ON DELETE CASCADE,
      connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(external_provider_id, internal_app_id, connection_id)
    );
  `;

  const createAuthEventsTable = `
    CREATE TABLE IF NOT EXISTS auth_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      external_app TEXT,
      internal_app TEXT,
      user_identifier TEXT,
      ip_address TEXT,
      user_agent TEXT,
      success BOOLEAN NOT NULL,
      error_message TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.exec(createUsersTable);
    await db.exec(createProvidersTable);
    await db.exec(createConnectionsTable);
    await db.exec(createAuditLogsTable);
    await db.exec(createAdminConfigTable);
    await db.exec(createInternalAppsTable);
    await db.exec(createAppMappingsTable);
    await db.exec(createAuthEventsTable);
    
    await seedProviders();
    await seedAdmin();
    await seedInternalApps();
    
    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Failed to create tables:', error);
    throw error;
  }
}

async function seedProviders(): Promise<void> {
  const googleProvider = `
    INSERT OR IGNORE INTO providers (name, display_name, oauth_config, scopes)
    VALUES ('google', 'Google', 
      '{"authUrl": "https://accounts.google.com/o/oauth2/auth", "tokenUrl": "https://oauth2.googleapis.com/token"}',
      'email,profile,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar'
    );
  `;
  
  try {
    await db.exec(googleProvider);
  } catch (error) {
    logger.error('Failed to seed providers:', error);
  }
}

async function seedAdmin(): Promise<void> {
  // Hash the default password "De7au!t"
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync('De7au!t', 10);
  
  const seedAdminQuery = `
    INSERT OR IGNORE INTO admin_config (id, username, password_hash)
    VALUES (1, 'admin', '${passwordHash}');
  `;
  
  try {
    await db.exec(seedAdminQuery);
    logger.info('Admin user seeded with default password');
  } catch (error) {
    logger.error('Failed to seed admin user:', error);
  }
}

async function seedInternalApps(): Promise<void> {
  const internalApps = `
    INSERT OR IGNORE INTO internal_apps (name, display_name, description, logo_url, api_endpoints, manifest_data) VALUES
    ('magnetiq', 'Magnetiq CMS', 'Website content management system for dynamic content creation and publishing', '/logos/magnetiq.svg', 
     '{"webhook": "https://voltaic.systems/api/auth/webhook", "health": "https://voltaic.systems/api/health"}',
     '{"pcarp_version": "1.0", "app": {"name": "magnetiq", "type": "internal", "description": "Website CMS for content management", "version": "1.0.0", "developer": "Voltaic Systems"}, "authentication": {"required_scopes": ["email.read", "calendar.read"], "callback_urls": ["https://voltaic.systems/api/auth/callback"], "webhook_url": "https://voltaic.systems/api/auth/webhook"}, "capabilities": {"data_types": ["email", "calendar"], "operations": ["read", "sync", "publish"], "realtime": true}}');
  `;
  
  try {
    await db.exec(internalApps);
    logger.info('Internal apps seeded successfully');
  } catch (error) {
    logger.error('Failed to seed internal apps:', error);
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    logger.info('Database connection closed');
  }
}
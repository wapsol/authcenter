"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const logger_1 = require("../utils/logger");
let db;
async function connectDatabase() {
    try {
        db = await (0, sqlite_1.open)({
            filename: './authcenter.db',
            driver: sqlite3_1.default.Database
        });
        logger_1.logger.info('Connected to SQLite database');
        await createTables();
    }
    catch (error) {
        logger_1.logger.error('Database connection failed:', error);
        throw error;
    }
}
async function createTables() {
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
        logger_1.logger.info('Database tables created successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to create tables:', error);
        throw error;
    }
}
async function seedProviders() {
    const googleProvider = `
    INSERT OR IGNORE INTO providers (name, display_name, oauth_config, scopes)
    VALUES ('google', 'Google', 
      '{"authUrl": "https://accounts.google.com/o/oauth2/auth", "tokenUrl": "https://oauth2.googleapis.com/token"}',
      'email,profile,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/calendar'
    );
  `;
    try {
        await db.exec(googleProvider);
    }
    catch (error) {
        logger_1.logger.error('Failed to seed providers:', error);
    }
}
async function seedAdmin() {
    // Hash the default password "De7au!t"
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync('De7au!t', 10);
    const seedAdminQuery = `
    INSERT OR IGNORE INTO admin_config (id, username, password_hash)
    VALUES (1, 'admin', '${passwordHash}');
  `;
    try {
        await db.exec(seedAdminQuery);
        logger_1.logger.info('Admin user seeded with default password');
    }
    catch (error) {
        logger_1.logger.error('Failed to seed admin user:', error);
    }
}
async function seedInternalApps() {
    const internalApps = `
    INSERT OR IGNORE INTO internal_apps (name, display_name, description, logo_url) VALUES
    ('ai-email-processor', 'AI Email Processor', 'Process and analyze emails using AI', '/logos/ai-email.svg'),
    ('document-analyzer', 'Document Analyzer', 'Analyze and extract insights from documents', '/logos/doc-analyzer.svg'),
    ('calendar-optimizer', 'Calendar Optimizer', 'Optimize and manage calendar events', '/logos/calendar-opt.svg'),
    ('data-pipeline', 'Data Pipeline', 'Process and transform external data', '/logos/data-pipeline.svg');
  `;
    try {
        await db.exec(internalApps);
        logger_1.logger.info('Internal apps seeded successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to seed internal apps:', error);
    }
}
function getDatabase() {
    if (!db) {
        throw new Error('Database not connected');
    }
    return db;
}
async function closeDatabase() {
    if (db) {
        await db.close();
        logger_1.logger.info('Database connection closed');
    }
}
//# sourceMappingURL=database.js.map
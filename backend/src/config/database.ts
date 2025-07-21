import { Client } from 'pg';
import { logger } from '../utils/logger';

let client: Client;

export async function connectDatabase(): Promise<void> {
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    logger.info('Connected to PostgreSQL database');
    
    await createTables();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProvidersTable = `
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      oauth_config JSONB NOT NULL,
      scopes TEXT[] NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createConnectionsTable = `
    CREATE TABLE IF NOT EXISTS connections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
      external_id VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at TIMESTAMP,
      scopes TEXT[],
      metadata JSONB,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, provider_id, external_id)
    );
  `;

  const createAuditLogsTable = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(100),
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await client.query(createUsersTable);
    await client.query(createProvidersTable);
    await client.query(createConnectionsTable);
    await client.query(createAuditLogsTable);
    
    await seedProviders();
    
    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Failed to create tables:', error);
    throw error;
  }
}

async function seedProviders(): Promise<void> {
  const googleProvider = `
    INSERT INTO providers (name, display_name, oauth_config, scopes)
    VALUES ('google', 'Google', 
      '{"authUrl": "https://accounts.google.com/o/oauth2/auth", "tokenUrl": "https://oauth2.googleapis.com/token"}',
      ARRAY['email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar']
    )
    ON CONFLICT (name) DO NOTHING;
  `;
  
  try {
    await client.query(googleProvider);
  } catch (error) {
    logger.error('Failed to seed providers:', error);
  }
}

export function getDatabase(): Client {
  if (!client) {
    throw new Error('Database not connected');
  }
  return client;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
    logger.info('Database connection closed');
  }
}
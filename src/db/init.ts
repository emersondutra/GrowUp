import { pool } from './index.ts';
import { seedIfEmpty } from './portfolio.ts';
import { seedAdminUserIfEmpty } from './users.ts';

/**
 * Initializes the PostgreSQL database schema and tables if they do not exist.
 * This ensures zero-friction deployment on any fresh VPS, Docker container,
 * or self-hosted PostgreSQL instance without requiring manual SQL commands.
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Verifying PostgreSQL tables and schema structure...');

    // 1. Users table (Admin and Clientes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT UNIQUE,
        full_name TEXT DEFAULT '' NOT NULL,
        name TEXT DEFAULT '' NOT NULL,
        email TEXT UNIQUE NOT NULL,
        cpf TEXT UNIQUE,
        role TEXT DEFAULT 'cliente' NOT NULL,
        status TEXT DEFAULT 'ativo' NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure columns exist if table was created in an earlier migration
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'cliente' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    // 2. Positions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticker TEXT NOT NULL,
        name TEXT NOT NULL,
        market TEXT NOT NULL,
        asset_class TEXT NOT NULL,
        current_price DOUBLE PRECISION NOT NULL,
        current_price_currency TEXT DEFAULT 'BRL' NOT NULL,
        avg_price DOUBLE PRECISION NOT NULL,
        total_quantity DOUBLE PRECISION NOT NULL,
        quantity_unit_label TEXT DEFAULT 'COTAS',
        target_percent DOUBLE PRECISION DEFAULT 0,
        current_percent DOUBLE PRECISION DEFAULT 0,
        day_change_percent DOUBLE PRECISION DEFAULT 0,
        total_profit_loss DOUBLE PRECISION DEFAULT 0,
        total_profit_loss_percent DOUBLE PRECISION DEFAULT 0,
        status_label TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 3. Broker allocations per position
    await client.query(`
      CREATE TABLE IF NOT EXISTS broker_allocations (
        id SERIAL PRIMARY KEY,
        position_id TEXT NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
        broker TEXT NOT NULL,
        broker_full_name TEXT NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        value_brl DOUBLE PRECISION NOT NULL,
        value_usd DOUBLE PRECISION NOT NULL
      );
    `);

    // 4. Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        ticker TEXT NOT NULL,
        name TEXT NOT NULL,
        market TEXT NOT NULL,
        asset_class TEXT NOT NULL,
        broker TEXT NOT NULL,
        date TEXT NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        currency TEXT DEFAULT 'BRL' NOT NULL,
        fees DOUBLE PRECISION DEFAULT 0,
        total DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 5. Dividends table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dividends (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ticker TEXT NOT NULL,
        asset_class TEXT NOT NULL,
        broker TEXT NOT NULL,
        market TEXT NOT NULL,
        per_share DOUBLE PRECISION NOT NULL,
        quantity DOUBLE PRECISION NOT NULL,
        payment_date TEXT NOT NULL,
        status TEXT NOT NULL,
        total_amount DOUBLE PRECISION NOT NULL,
        currency TEXT DEFAULT 'BRL' NOT NULL,
        gross_amount DOUBLE PRECISION,
        tax_deduction TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 6. Broker balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS broker_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        broker TEXT NOT NULL,
        name TEXT NOT NULL,
        currency TEXT DEFAULT 'BRL' NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        free_cash DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'connected' NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Performance Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
      CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
      CREATE INDEX IF NOT EXISTS idx_dividends_ticker ON dividends(ticker);
    `);

    console.log('PostgreSQL schema verification complete.');

    // Seed initial data if tables are empty
    await seedIfEmpty();
    await seedAdminUserIfEmpty();
  } catch (error) {
    console.error('PostgreSQL database initialization warning:', error);
  } finally {
    client.release();
  }
}

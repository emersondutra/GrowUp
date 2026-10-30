import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    let poolConfig: PoolConfig;

    if (databaseUrl) {
      // Direct connection string (e.g. postgresql://user:password@localhost:5432/dbname)
      const isSslExplicit = process.env.DB_SSL !== undefined;
      const enableSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require';

      poolConfig = {
        connectionString: databaseUrl,
        ssl: isSslExplicit
          ? enableSsl ? { rejectUnauthorized: false } : false
          : databaseUrl.includes('sslmode=require') || databaseUrl.includes('supabase.co')
          ? { rejectUnauthorized: false }
          : false,
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      };
    } else {
      // Individual connection parameters with fallback to standard PG / Cloud SQL / VPS variables
      const host = process.env.SQL_HOST || process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost';
      const user = process.env.SQL_USER || process.env.PGUSER || process.env.POSTGRES_USER || 'postgres';
      const password = process.env.SQL_PASSWORD || process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '';
      const database = process.env.SQL_DB_NAME || process.env.PGDATABASE || process.env.POSTGRES_DB || 'growup';
      const port = parseInt(
        process.env.SQL_PORT || process.env.PGPORT || process.env.POSTGRES_PORT || '5432',
        10
      );
      const enableSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require';

      poolConfig = {
        host,
        port,
        user,
        password,
        database,
        ssl: enableSsl ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
      };
    }

    global._postgresPool = new Pool(poolConfig);

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
export const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

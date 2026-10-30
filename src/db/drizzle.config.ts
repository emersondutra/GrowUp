import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const sqlHost = process.env.SQL_HOST || process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost';
const sqlDbName = process.env.SQL_DB_NAME || process.env.PGDATABASE || process.env.POSTGRES_DB || 'growup';
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER || process.env.PGUSER || process.env.POSTGRES_USER || 'postgres';
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '';
const port = parseInt(process.env.SQL_PORT || process.env.PGPORT || process.env.POSTGRES_PORT || '5432', 10);
const enableSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require';

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle", // Output directory for migrations.
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: databaseUrl
    ? {
        url: databaseUrl,
        ssl: enableSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: sqlHost,
        port: port,
        user: user,
        password: password,
        database: sqlDbName,
        ssl: enableSsl ? { rejectUnauthorized: false } : false,
      },
  verbose: true, // Enable verbose output.
});

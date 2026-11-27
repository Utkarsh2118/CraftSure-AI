import { resolve } from 'path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Ensure environment variables are loaded reliably from apps/api/.env
config({ path: resolve(__dirname, '../../.env') });

const connectionString = process.env['DATABASE_URL']?.trim();

if (!connectionString) {
  throw new Error('[DB] DATABASE_URL environment variable is not set or is empty. Please configure it in apps/api/.env.');
}

/**
 * Configure postgres.js client for Supabase PostgreSQL.
 *
 * Supabase Connection Modes:
 * - Session Mode (port 5432): Provides dedicated PostgreSQL sessions per connection.
 * - Transaction Mode (port 6543): Multiplexes connections via Supavisor / PgBouncer,
 *   returning backend connections to the pool after each transaction.
 *
 * Compatibility Requirements:
 * 1. prepare: false - When using the Supabase pooler (especially Transaction mode
 *    on port 6543), connection multiplexing prevents persistent server-side prepared
 *    statements. Disabling prepared statements (prepare: false) prevents
 *    prepared statement collisions across all modes.
 * 2. ssl: 'require' - Cloud-hosted Supabase instances mandate encrypted SSL connections in transit.
 */
const isLocal =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('0.0.0.0');

const poolSize = parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10);

const queryClient = postgres(connectionString, {
  prepare: false,
  max: Number.isNaN(poolSize) || poolSize <= 0 ? 10 : poolSize,
  ssl: isLocal ? false : 'require',
  connect_timeout: process.env['NODE_ENV'] === 'test' ? 1 : 10,
  idle_timeout: 5,
});

export { queryClient };
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;

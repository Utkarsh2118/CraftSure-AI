import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('[DB] DATABASE_URL environment variable is not set.');
}

// For migrations, max:1 is required.
// For queries, the connection pool size depends on load.
const queryClient = postgres(connectionString, {
  max: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;

import { resolve } from 'path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Ensure .env is loaded reliably from apps/api/.env regardless of invocation directory
config({ path: resolve(__dirname, '../../.env') });

async function runMigrations(): Promise<void> {
  const connectionString = process.env['DATABASE_URL']?.trim();

  if (!connectionString) {
    console.error('[Migration Error] DATABASE_URL is not set or is empty. Please configure it in apps/api/.env.');
    process.exitCode = 1;
    return;
  }

  console.warn('[Migration] Connecting to PostgreSQL database...');

  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1') ||
    connectionString.includes('0.0.0.0');

  /**
   * Drizzle migrations require a single dedicated connection (max: 1).
   *
   * Supabase Connection Modes:
   * - Session Mode (port 5432): Dedicated connection per session.
   * - Transaction Mode (port 6543): Multiplexed pool via Supavisor / PgBouncer.
   *
   * prepare: false is required when routing through the pooler to avoid prepared
   * statement collisions.
   */
  const migrationClient = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: isLocal ? false : 'require',
  });

  const db = drizzle(migrationClient);

  try {
    const migrationsFolder = resolve(__dirname, './migrations');
    console.warn(`[Migration] Applying migrations from ${migrationsFolder}...`);

    await migrate(db, { migrationsFolder });

    console.warn('[Migration] Migrations applied successfully.');
  } catch (error) {
    process.exitCode = 1;
    console.error('[Migration Error] Failed to apply database migrations:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  } finally {
    await migrationClient.end();
  }
}

void runMigrations();



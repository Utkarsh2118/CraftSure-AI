import { resolve } from 'path';
import { config } from 'dotenv';

// Ensure .env is loaded reliably from apps/api/.env
config({ path: resolve(__dirname, '../../.env') });

export interface AppConfig {
  readonly PORT: number;
  readonly CORS_ORIGIN: string;
  readonly NODE_ENV: string;
  readonly DB_POOL_SIZE: number;
}

export const env: AppConfig = {
  PORT: parseInt(process.env['PORT'] ?? '4000', 10),
  CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  DB_POOL_SIZE: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
};


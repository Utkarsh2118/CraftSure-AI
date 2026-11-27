import { resolve } from 'path';
import { config } from 'dotenv';

// Ensure .env is loaded reliably from apps/api/.env
config({ path: resolve(__dirname, '../../.env') });

export interface AppConfig {
  readonly PORT: number;
  readonly CORS_ORIGIN: string;
  readonly NODE_ENV: string;
  readonly DB_POOL_SIZE: number;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly RAZORPAY_KEY_ID: string;
  readonly RAZORPAY_KEY_SECRET: string;
  readonly RAZORPAY_WEBHOOK_SECRET: string;
}

export const env: AppConfig = {
  PORT: parseInt(process.env['PORT'] ?? '4000', 10),
  CORS_ORIGIN: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  DB_POOL_SIZE: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
  SUPABASE_URL: process.env['SUPABASE_URL'] ?? '',
  SUPABASE_ANON_KEY: process.env['SUPABASE_ANON_KEY'] ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  RAZORPAY_KEY_ID: process.env['RAZORPAY_KEY_ID'] ?? '',
  RAZORPAY_KEY_SECRET: process.env['RAZORPAY_KEY_SECRET'] ?? '',
  RAZORPAY_WEBHOOK_SECRET: process.env['RAZORPAY_WEBHOOK_SECRET'] ?? '',
};


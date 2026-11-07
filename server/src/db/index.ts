import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = isProduction || connectionString.includes('sslmode=require');

const poolConfig: PoolConfig = {
  connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
};

export const pool = new Pool(poolConfig);

// Simple helper so the rest of the app never imports `pool` directly —
// it always goes through this one function, in one place.
export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple helper so the rest of the app never imports `pool` directly —
// it always goes through this one function, in one place.
export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};
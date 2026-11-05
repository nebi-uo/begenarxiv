import { query } from './index';

export async function runMigrations() {
  try {
    // 1. Add approval and contributor columns to mezmurs table
    await query(`
      ALTER TABLE mezmurs
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
        ADD COLUMN IF NOT EXISTS contributor_name TEXT DEFAULT 'Begenarxiv',
        ADD COLUMN IF NOT EXISTS contributor_email TEXT,
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP DEFAULT NOW();
    `);

    // Ensure all existing rows have default approved status and contributor
    await query(`
      UPDATE mezmurs SET status = 'approved' WHERE status IS NULL;
      UPDATE mezmurs SET contributor_name = 'Begenarxiv' WHERE contributor_name IS NULL;
    `);

    // 2. Ensure mezmur_requests table exists
    await query(`
      CREATE TABLE IF NOT EXISTS mezmur_requests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT,
        youtube_url TEXT,
        notes TEXT,
        requester_name TEXT,
        requester_email TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✓ Database schema migrations applied successfully.');
  } catch (err) {
    console.warn('Migration warning (non-fatal):', err);
  }
}


import { query } from './index';

export async function runMigrations() {
  try {
    // 1. Add approval and contributor columns to mezmurs table
    await query(`
      ALTER TABLE mezmurs
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS contributor_name TEXT DEFAULT 'Begenarxiv',
        ADD COLUMN IF NOT EXISTS contributor_email TEXT,
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP DEFAULT NOW();
      ALTER TABLE mezmurs ALTER COLUMN status SET DEFAULT 'pending';
    `);

    // Ensure all existing rows have default approved status and contributor
    await query(`
      UPDATE mezmurs SET status = 'approved' WHERE status IS NULL;
      UPDATE mezmurs SET contributor_name = 'Begenarxiv' WHERE contributor_name IS NULL;
    `);

    // 2. Update difficulty check constraint to include 'practice'
    await query(`
      ALTER TABLE mezmurs DROP CONSTRAINT IF EXISTS mezmurs_difficulty_check;
      ALTER TABLE mezmurs ADD CONSTRAINT mezmurs_difficulty_check 
        CHECK (difficulty IN ('practice', 'beginner', 'intermediate', 'advanced'));
    `);

    // 3. Ensure mezmur_requests table exists
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

    // 4. Support in-notation pauses and rests in mezmur_sequences
    await query(`
      ALTER TABLE mezmur_sequences ALTER COLUMN string_id DROP NOT NULL;
      ALTER TABLE mezmur_sequences ADD COLUMN IF NOT EXISTS is_rest BOOLEAN DEFAULT FALSE;
      ALTER TABLE mezmur_sequences ADD COLUMN IF NOT EXISTS phrase_break BOOLEAN DEFAULT FALSE;
    `);

    // 5. Support raw_notation persistence on mezmurs
    await query(`
      ALTER TABLE mezmurs ADD COLUMN IF NOT EXISTS raw_notation TEXT;
    `);

    // 6. Ensure the 3 standard Begena tuning profiles and tunes exist
    await query(`
      INSERT INTO tuning_profiles (id, name, description) VALUES
        (1, 'Tizita', 'Tizita mode: 1=E, 2=C, 3=D, 4=A, 5=G'),
        (2, 'Selamta', 'Selamta mode: 1=F, 2=C, 3=D, 4=A, 5=G'),
        (3, 'Anchi-Hoye', 'Anchi-Hoye mode: 1=F, 2=C, 3=C#, 4=A, 5=F#')
      ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, description = EXCLUDED.description;

      SELECT setval('tuning_profiles_id_seq', (SELECT GREATEST(MAX(id), 3) FROM tuning_profiles));
    `);

    await query(`
      DELETE FROM tunes WHERE name IN ('Sample Tune', 'Second Sample Tune', '');
      INSERT INTO tunes (name) VALUES ('Tizita') ON CONFLICT (name) DO NOTHING;
      INSERT INTO tunes (name) VALUES ('Selamta') ON CONFLICT (name) DO NOTHING;
      INSERT INTO tunes (name) VALUES ('Anchi-Hoye') ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✓ Database schema migrations applied successfully.');
  } catch (err) {
    console.warn('Migration warning (non-fatal):', err);
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}



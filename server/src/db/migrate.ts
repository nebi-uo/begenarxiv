import { query } from './index';

export async function runMigrations() {
  try {
    // 0. Base Table Initialization (ensures a brand new cloud database bootstraps cleanly)
    await query(`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tunes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS strings (
        id SERIAL PRIMARY KEY,
        note_name TEXT NOT NULL,
        string_position INT NOT NULL UNIQUE,
        audio_file_url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tuning_profiles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS tuning_profile_notes (
        id SERIAL PRIMARY KEY,
        tuning_profile_id INT NOT NULL REFERENCES tuning_profiles(id) ON DELETE CASCADE,
        string_id INT NOT NULL REFERENCES strings(id),
        frequency_hz NUMERIC(6,2) NOT NULL,
        UNIQUE(tuning_profile_id, string_id)
      );

      CREATE TABLE IF NOT EXISTS mezmurs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        lyrics TEXT,
        youtube_url TEXT,
        difficulty TEXT CHECK (difficulty IN ('practice', 'beginner', 'intermediate', 'advanced')),
        artist_id INT REFERENCES artists(id),
        tune_id INT REFERENCES tunes(id),
        tuning_profile_id INT REFERENCES tuning_profiles(id),
        status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
        contributor_name TEXT DEFAULT 'Begenarxiv',
        contributor_email TEXT,
        approved_at TIMESTAMP DEFAULT NOW(),
        raw_notation TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mezmur_sequences (
        id SERIAL PRIMARY KEY,
        mezmur_id INT NOT NULL REFERENCES mezmurs(id) ON DELETE CASCADE,
        string_id INT REFERENCES strings(id) ON DELETE CASCADE,
        group_id INT DEFAULT NULL,
        line_number INT NOT NULL DEFAULT 1,
        step_order INT NOT NULL,
        duration_ms INT,
        is_rest BOOLEAN DEFAULT FALSE,
        phrase_break BOOLEAN DEFAULT FALSE,
        UNIQUE(mezmur_id, step_order)
      );

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

    // 1. Add approval and contributor columns to mezmurs table (safe idempotent upgrades)
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

    // 3. Ensure mezmur_requests has requester details
    await query(`
      ALTER TABLE mezmur_requests ADD COLUMN IF NOT EXISTS requester_name TEXT;
      ALTER TABLE mezmur_requests ADD COLUMN IF NOT EXISTS requester_email TEXT;
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

    // 6. Ensure default strings and tuning profiles exist
    await query(`
      INSERT INTO strings (id, note_name, string_position, audio_file_url) VALUES
        (1, 'E', 1, '/audio/strings/e.mp3'),
        (2, 'C', 2, '/audio/strings/c.mp3'),
        (3, 'D', 3, '/audio/strings/d.mp3'),
        (4, 'A', 4, '/audio/strings/a.mp3'),
        (5, 'G', 5, '/audio/strings/g.mp3')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('strings_id_seq', (SELECT GREATEST(MAX(id), 5) FROM strings));

      INSERT INTO tuning_profiles (id, name, description) VALUES
        (1, 'Tizita', 'Tizita mode: 1=E, 2=C, 3=D, 4=A, 5=G'),
        (2, 'Selamta', 'Selamta mode: 1=F, 2=C, 3=D, 4=A, 5=G'),
        (3, 'Anchi-Hoye', 'Anchi-Hoye mode: 1=F, 2=C, 3=C#, 4=A, 5=F#')
      ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, description = EXCLUDED.description;
      SELECT setval('tuning_profiles_id_seq', (SELECT GREATEST(MAX(id), 3) FROM tuning_profiles));

      INSERT INTO tuning_profile_notes (tuning_profile_id, string_id, frequency_hz) VALUES
        (1, 1, 164.81),
        (1, 2, 130.81),
        (1, 3, 146.83),
        (1, 4, 220.00),
        (1, 5, 196.00)
      ON CONFLICT (tuning_profile_id, string_id) DO NOTHING;
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




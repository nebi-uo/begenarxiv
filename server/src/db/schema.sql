-- Artists: the people/groups who perform mezmurs
CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tunes: the musical mode/category a mezmur belongs to (for browsing/discovery)
CREATE TABLE tunes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Strings: the reusable note-sample library (~5-6 rows total, recorded once)
CREATE TABLE strings (
  id SERIAL PRIMARY KEY,
  note_name TEXT NOT NULL,
  string_position INT NOT NULL UNIQUE, -- physical position on the instrument, e.g. 1-6
  audio_file_url TEXT NOT NULL
);

-- Tuning profiles: a named tuning configuration (e.g. "Standard C-D-E-G-A")
CREATE TABLE tuning_profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Tuning profile notes: the actual target frequency for each string, per profile
-- Split from tuning_profiles because one profile has MANY string/frequency pairs —
-- same one-to-many rule as before, foreign key lives on the "many" side.
CREATE TABLE tuning_profile_notes (
  id SERIAL PRIMARY KEY,
  tuning_profile_id INT NOT NULL REFERENCES tuning_profiles(id) ON DELETE CASCADE,
  string_id INT NOT NULL REFERENCES strings(id),
  frequency_hz NUMERIC(6,2) NOT NULL,
  UNIQUE(tuning_profile_id, string_id) -- a string can't have two target frequencies in the same profile
);

-- Mezmurs: the actual songs
CREATE TABLE mezmurs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  lyrics TEXT,
  youtube_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('practice', 'beginner', 'intermediate', 'advanced')),
  artist_id INT REFERENCES artists(id),
  tune_id INT REFERENCES tunes(id),
  tuning_profile_id INT REFERENCES tuning_profiles(id),
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  contributor_name TEXT DEFAULT 'Begenarxiv',
  contributor_email TEXT,
  approved_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mezmur sequences: the "which string plays at which step" data for tap-to-hear
CREATE TABLE mezmur_sequences (
  id SERIAL PRIMARY KEY,
  mezmur_id INT NOT NULL REFERENCES mezmurs(id) ON DELETE CASCADE,
  string_id INT REFERENCES strings(id) ON DELETE CASCADE,
  group_id INT DEFAULT NULL,
  line_number INT NOT NULL DEFAULT 1,
  step_order INT NOT NULL,
  duration_ms INT,
  is_rest BOOLEAN DEFAULT FALSE,
  phrase_break BOOLEAN DEFAULT FALSE,
  UNIQUE(mezmur_id, step_order) -- prevents two rows claiming to be "step 3" of the same song
);


-- Mezmur requests: crowd-sourced requests for mezmurs to be decoded
CREATE TABLE IF NOT EXISTS mezmur_requests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  youtube_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

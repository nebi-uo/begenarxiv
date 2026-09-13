-- Strings: the 5 reusable note samples (adjust note names/positions to match real Begena tuning)
INSERT INTO strings (note_name, string_position, audio_file_url) VALUES
  ('C', 1, '/audio/strings/c.mp3'),
  ('D', 2, '/audio/strings/d.mp3'),
  ('E', 3, '/audio/strings/e.mp3'),
  ('G', 4, '/audio/strings/g.mp3'),
  ('A', 5, '/audio/strings/a.mp3');

-- One standard tuning profile
INSERT INTO tuning_profiles (name, description) VALUES
  ('Standard C-D-E-G-A', 'Default Begena tuning');

-- Frequencies for that profile — string_id values assume the inserts above ran in order (1-5)
INSERT INTO tuning_profile_notes (tuning_profile_id, string_id, frequency_hz) VALUES
  (1, 1, 130.81), -- C3
  (1, 2, 146.83), -- D3
  (1, 3, 164.81), -- E3
  (1, 4, 196.00), -- G3
  (1, 5, 220.00); -- A3

-- One artist and one tune, so a mezmur has somewhere to point
INSERT INTO artists (name) VALUES ('Sample Artist');
INSERT INTO tunes (name) VALUES ('Sample Tune');

-- One mezmur
INSERT INTO mezmurs (title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id) VALUES
  ('Sample Mezmur', 'Lyrics line one\nLyrics line two', 'https://youtube.com/watch?v=example', 'beginner', 1, 1, 1);

-- A short sequence for that mezmur: string 1, then 3, then 2, then 4 — made up, just to test stepping through it
INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms) VALUES
  (1, 1, 1, 1, 500),
  (1, 3, 2, 1, 500),
  (1, 2, 3, 2, 500),
  (1, 4, 4, 2, 500);
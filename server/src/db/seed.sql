-- Strings: the 5 playable Begena strings (Tizita tuning: 1=E, 2=C, 3=D, 4=A, 5=G)
INSERT INTO strings (note_name, string_position, audio_file_url) VALUES
  ('E', 1, '/audio/strings/e.mp3'),
  ('C', 2, '/audio/strings/c.mp3'),
  ('D', 3, '/audio/strings/d.mp3'),
  ('A', 4, '/audio/strings/a.mp3'),
  ('G', 5, '/audio/strings/g.mp3');

-- 3 Traditional Begena Tuning Profiles
INSERT INTO tuning_profiles (id, name, description) VALUES
  (1, 'Tizita', 'Tizita mode: 1=E, 2=C, 3=D, 4=A, 5=G'),
  (2, 'Selamta', 'Selamta mode: 1=F, 2=C, 3=D, 4=A, 5=G'),
  (3, 'Anchi-Hoye', 'Anchi-Hoye mode: 1=F, 2=C, 3=C#, 4=A, 5=F#')
ON CONFLICT (id) DO NOTHING;

-- Frequencies for Tizita profile (profile 1)
INSERT INTO tuning_profile_notes (tuning_profile_id, string_id, frequency_hz) VALUES
  (1, 1, 164.81), -- E3
  (1, 2, 130.81), -- C3
  (1, 3, 146.83), -- D3
  (1, 4, 220.00), -- A3
  (1, 5, 196.00); -- G3

-- Mezmurs and sequences: populated dynamically via the Begenarxiv curation portal (/portal)

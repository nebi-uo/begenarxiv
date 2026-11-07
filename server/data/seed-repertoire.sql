-- Begenarxiv Production Repertoire Seed Data

-- 1. Artists
INSERT INTO artists (id, name) VALUES (4, 'Traditional') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
SELECT setval('artists_id_seq', (SELECT GREATEST(MAX(id), 1) FROM artists));

-- 2. Mezmurs
INSERT INTO mezmurs (id, title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id, status, contributor_name, contributor_email, approved_at, raw_notation)
VALUES (7, 'በጌቴሴማኒ (Begetesemani)', 'በጌቴሴማኒ በአትክልቱ ቦታ  (x2)

ለኛ ሲል ጌታችን [በዓለም ተንገላታ](x2)

አዝ…

አዳምና ሔዋን ባጠፉት ጥፋት  (x2)

በኛም ነበረብን [የዘለዓለም ሞት](x2)

አዝ…

መስቀል ተሸክሞ ሲወጣ ተራራ  (x2)

ይገርፉት ነበረ [ሁሉም በየተራ](x2)

አዝ…

ድንግል አልቻለችም ዕንባዋን ልትገታ  (x2)

አያየች በመስቀል [ልጇ ሲንገላታ](x2)

አዝ…

በአምላክነቱ ሳይፈርድባቸው  (x2)

እንዲህ ሲል ጸለየ [አባት ሆይ ማራቸው](x2)

አዝ…

በረቂቅ ስልጣኑ ሁሉን የፈጠረ  (x2)

በሰዎች ተገርፎ [ሞተ ተቀበረ](x2)

አዝ…

ፍቅሩን የገለጸው ተወልዶ በስጋ  (x2)

እየሱስ ጌታ ነው [አልፋና ኦሜጋ](x2)', 'https://youtu.be/mnZ4cvkFaL8?si=khz-NvpbDx4YvJjF', 'beginner', 4, 4, 2, 'approved', 'Begenarxiv', NULL, 'Thu Nov 05 2026 20:12:48 GMT+0300 (East Africa Time)', '4 2 3 - 2 2 4 - 5 4 2 - 2 2 2 - (x2) 
4 2 3 - 1 1 5 - 1 1 3 - 2 2 4 - 5 4 2 - 2 2 2')
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmurs (id, title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id, status, contributor_name, contributor_email, approved_at, raw_notation)
VALUES (8, 'ሆዴ ልመድ (Hode Lmed)', 'ሆዴ ልመድ  (x2)
የለህምና ዘመድ', NULL, 'practice', 4, 4, 2, 'approved', 'Begenarxiv', NULL, 'Thu Nov 05 2026 20:23:32 GMT+0300 (East Africa Time)', '4 5 - 1 3 1 | (x2) 
3 1 5 1 3 - 2 4 2')
ON CONFLICT (id) DO NOTHING;
SELECT setval('mezmurs_id_seq', (SELECT GREATEST(MAX(id), 1) FROM mezmurs));

-- 3. Sequences (Tap-to-Hear Plucks)
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (18, 7, 4, NULL, 1, 1, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (19, 7, 2, NULL, 1, 2, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (20, 7, 3, NULL, 1, 3, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (21, 7, NULL, NULL, 1, 4, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (22, 7, 2, NULL, 1, 5, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (23, 7, 2, NULL, 1, 6, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (24, 7, 4, NULL, 1, 7, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (25, 7, NULL, NULL, 1, 8, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (26, 7, 5, NULL, 1, 9, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (27, 7, 4, NULL, 1, 10, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (28, 7, 2, NULL, 1, 11, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (29, 7, NULL, NULL, 1, 12, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (30, 7, 2, NULL, 1, 13, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (31, 7, 2, NULL, 1, 14, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (32, 7, 2, NULL, 1, 15, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (33, 7, NULL, NULL, 1, 16, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (34, 7, 4, NULL, 1, 17, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (35, 7, 2, NULL, 1, 18, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (36, 7, 3, NULL, 1, 19, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (37, 7, NULL, NULL, 1, 20, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (38, 7, 2, NULL, 1, 21, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (39, 7, 2, NULL, 1, 22, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (40, 7, 4, NULL, 1, 23, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (41, 7, NULL, NULL, 1, 24, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (42, 7, 5, NULL, 1, 25, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (43, 7, 4, NULL, 1, 26, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (44, 7, 2, NULL, 1, 27, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (45, 7, NULL, NULL, 1, 28, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (46, 7, 2, NULL, 1, 29, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (47, 7, 2, NULL, 1, 30, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (48, 7, 2, NULL, 1, 31, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (49, 7, NULL, NULL, 1, 32, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (50, 7, 4, NULL, 2, 33, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (51, 7, 2, NULL, 2, 34, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (52, 7, 3, NULL, 2, 35, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (53, 7, NULL, NULL, 2, 36, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (54, 7, 1, NULL, 2, 37, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (55, 7, 1, NULL, 2, 38, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (56, 7, 5, NULL, 2, 39, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (57, 7, NULL, NULL, 2, 40, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (58, 7, 1, NULL, 2, 41, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (59, 7, 1, NULL, 2, 42, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (60, 7, 3, NULL, 2, 43, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (61, 7, NULL, NULL, 2, 44, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (62, 7, 2, NULL, 2, 45, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (63, 7, 2, NULL, 2, 46, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (64, 7, 4, NULL, 2, 47, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (65, 7, NULL, NULL, 2, 48, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (66, 7, 5, NULL, 2, 49, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (67, 7, 4, NULL, 2, 50, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (68, 7, 2, NULL, 2, 51, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (69, 7, NULL, NULL, 2, 52, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (70, 7, 2, NULL, 2, 53, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (71, 7, 2, NULL, 2, 54, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (72, 7, 2, NULL, 2, 55, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (73, 8, 4, NULL, 1, 1, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (74, 8, 5, NULL, 1, 2, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (75, 8, NULL, NULL, 1, 3, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (76, 8, 1, NULL, 1, 4, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (77, 8, 3, NULL, 1, 5, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (78, 8, 1, NULL, 1, 6, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (79, 8, NULL, NULL, 1, 7, 700, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (80, 8, 4, NULL, 1, 8, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (81, 8, 5, NULL, 1, 9, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (82, 8, NULL, NULL, 1, 10, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (83, 8, 1, NULL, 1, 11, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (84, 8, 3, NULL, 1, 12, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (85, 8, 1, NULL, 1, 13, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (86, 8, NULL, NULL, 1, 14, 700, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (87, 8, 3, NULL, 2, 15, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (88, 8, 1, NULL, 2, 16, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (89, 8, 5, NULL, 2, 17, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (90, 8, 1, NULL, 2, 18, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (91, 8, 3, NULL, 2, 19, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (92, 8, NULL, NULL, 2, 20, 500, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (93, 8, 2, NULL, 2, 21, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (94, 8, 4, NULL, 2, 22, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mezmur_sequences (id, mezmur_id, string_id, group_id, line_number, step_order, duration_ms, is_rest, phrase_break)
VALUES (95, 8, 2, NULL, 2, 23, 500, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;
SELECT setval('mezmur_sequences_id_seq', (SELECT GREATEST(MAX(id), 1) FROM mezmur_sequences));


import fs from 'fs';
import path from 'path';
import { query } from './index';

interface MezmurInput {
  title: string;
  artist: string;
  tune: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lyrics: string;
  youtube_url: string;
  sequence: { line: number; notes: string[] }[];
}

// Finds an existing row by name, or creates one — avoids duplicate artists/tunes
// every time you re-run this against overlapping data.
async function findOrCreate(table: 'artists' | 'tunes', name: string): Promise<number> {
  const existing = await query(`SELECT id FROM ${table} WHERE name = $1`, [name]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const inserted = await query(`INSERT INTO ${table} (name) VALUES ($1) RETURNING id`, [name]);
  return inserted.rows[0].id;
}

async function importMezmur(data: MezmurInput) {
  const artistId = await findOrCreate('artists', data.artist);
  const tuneId = await findOrCreate('tunes', data.tune);

  const mezmurResult = await query(
    `INSERT INTO mezmurs (title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [data.title, data.lyrics, data.youtube_url, data.difficulty, artistId, tuneId, 1]
  );
  const mezmurId = mezmurResult.rows[0].id;

  // Look up each string's id by its physical position, once, for fast lookup below
  const stringsResult = await query('SELECT id, string_position FROM strings');
  const stringIdByPosition = new Map<number, number>(
    stringsResult.rows.map((s) => [s.string_position, s.id])
  );

  let stepOrder = 1;
  let groupCounter = 1;

  for (const { line, notes } of data.sequence) {
    for (const token of notes) {
      const isGrouped = token.length > 1;
      const groupId = isGrouped ? groupCounter : null;
      const duration = isGrouped ? 180 : 500; // grouped notes play much faster
  
      for (const digit of token) {
        const notePosition = parseInt(digit, 10);
        const stringId = stringIdByPosition.get(notePosition);
        if (!stringId) {
          console.warn(`  ⚠ Skipping unknown string position ${notePosition} in "${data.title}"`);
          continue;
        }
        await query(
          `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, group_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [mezmurId, stringId, stepOrder, line, duration, groupId]
        );
        stepOrder++;
      }
      if (isGrouped) groupCounter++;
    }   
  }

  console.log(`✓ Imported "${data.title}" (id ${mezmurId}, ${stepOrder - 1} notes)`);
}

async function run() {
  const filePath = path.join(__dirname, '../../data/mezmurs.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const mezmurs: MezmurInput[] = JSON.parse(raw);

  for (const mezmur of mezmurs) {
    await importMezmur(mezmur);
  }

  console.log(`\nDone. Imported ${mezmurs.length} mezmur(s).`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
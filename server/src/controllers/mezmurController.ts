import { Request, Response } from 'express';
import { query } from '../db';
import { MezmurWithSequence } from '../types';
import { sendContributorApprovalEmail } from '../services/emailService';

async function findOrCreate(table: 'artists' | 'tunes', name: string): Promise<number> {
  const trimmed = name.trim();
  const existing = await query(`SELECT id FROM ${table} WHERE LOWER(TRIM(name)) = LOWER($1)`, [trimmed]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const inserted = await query(`INSERT INTO ${table} (name) VALUES ($1) RETURNING id`, [trimmed]);
  return inserted.rows[0].id;
}

async function getTuningProfileId(tuneName: string): Promise<number> {
  const lower = (tuneName || '').toLowerCase();
  let targetName = 'Tizita';
  if (lower.includes('selamta')) targetName = 'Selamta';
  else if (lower.includes('anchi')) targetName = 'Anchi-Hoye';

  // 1. Try matching by exact or partial name in tuning_profiles
  const match = await query(
    `SELECT id FROM tuning_profiles WHERE LOWER(name) LIKE $1 ORDER BY id ASC LIMIT 1`,
    [`%${targetName.toLowerCase()}%`]
  );
  if (match.rows.length > 0) return match.rows[0].id;

  // 2. Fallback to first available tuning profile or 1
  const first = await query('SELECT id FROM tuning_profiles ORDER BY id ASC LIMIT 1');
  return first.rows[0]?.id ?? 1;
}

const GEEZ_NUMERAL_MAP: Record<string, number> = {
  '፩': 1, '፪': 2, '፫': 3, '፬': 4, '፭': 5, '፮': 6, '፯': 7, '፰': 8, '፱': 9, '፲': 10,
};

const SECTION_REPEAT_REGEX =
  /\[([^\]]+)\]\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])/gi;

const LINE_REPEAT_REGEX =
  /\s*(?:[\(\[]\s*(?:(?:x\s*(\d+))|(?:(\d+)\s*x)|(?:(\d+)\s*(?:times|ጊዜ)?)|(?:([፩-፲])\s*(?:x|ጊዜ|times)?))\s*[\)\]])\s*$/i;

function parseRepeatCount(m1?: string, m2?: string, m3?: string, m4?: string): number {
  if (m1) return parseInt(m1, 10);
  if (m2) return parseInt(m2, 10);
  if (m3) return parseInt(m3, 10);
  if (m4) return GEEZ_NUMERAL_MAP[m4] || 2;
  return 2;
}

function parseAndExpandRawNotation(raw: string): { line: number; notes: string[] }[] {
  if (!raw.trim()) return [];
  const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const cleanNote = (tok: string) => tok.trim();

  return rawLines.map((lineStr, idx) => {
    let workingLine = lineStr;
    let lineRepeatCount = 1;

    const lineMatch = workingLine.match(LINE_REPEAT_REGEX);
    if (lineMatch) {
      lineRepeatCount = parseRepeatCount(lineMatch[1], lineMatch[2], lineMatch[3], lineMatch[4]);
      workingLine = workingLine.replace(LINE_REPEAT_REGEX, '').trim();
    }

    const segments: { notes: string[]; repeatCount: number }[] = [];
    const matches = Array.from(workingLine.matchAll(SECTION_REPEAT_REGEX));

    if (matches.length > 0) {
      let lastIndex = 0;
      for (const m of matches) {
        const matchIdx = m.index ?? 0;
        if (matchIdx > lastIndex) {
          const pre = workingLine.slice(lastIndex, matchIdx).trim();
          if (pre) {
            const preNotes = pre.split(/[\s,]+/).map(cleanNote).filter((t) => /^([1-5]+|\||\-+)$/.test(t));
            if (preNotes.length > 0) segments.push({ notes: preNotes, repeatCount: 1 });
          }
        }
        const secContent = m[1].trim();
        const repCount = parseRepeatCount(m[2], m[3], m[4], m[5]);
        const secNotes = secContent.split(/[\s,]+/).map(cleanNote).filter((t) => /^([1-5]+|\||\-+)$/.test(t));
        if (secNotes.length > 0) segments.push({ notes: secNotes, repeatCount: repCount });
        lastIndex = matchIdx + m[0].length;
      }
      if (lastIndex < workingLine.length) {
        const post = workingLine.slice(lastIndex).trim();
        if (post) {
          const postNotes = post.split(/[\s,]+/).map(cleanNote).filter((t) => /^([1-5]+|\||\-+)$/.test(t));
          if (postNotes.length > 0) segments.push({ notes: postNotes, repeatCount: 1 });
        }
      }
    } else {
      const notes = workingLine.split(/[\s,]+/).map(cleanNote).filter((t) => /^([1-5]+|\||\-+)$/.test(t));
      if (notes.length > 0) segments.push({ notes, repeatCount: 1 });
    }

    // Expand section repeats
    const singleLineNotes: string[] = [];
    for (const seg of segments) {
      for (let r = 0; r < seg.repeatCount; r++) {
        singleLineNotes.push(...seg.notes);
      }
    }

    // Expand line repeats
    const expandedNotes: string[] = [];
    for (let lr = 0; lr < lineRepeatCount; lr++) {
      expandedNotes.push(...singleLineNotes);
    }

    return { line: idx + 1, notes: expandedNotes };
  }).filter((l) => l.notes.length > 0);
}

// GET /api/mezmurs — public catalogue listing (ONLY approved hymns)
export const getAllMezmurs = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT m.id, m.title, m.difficulty, m.status, m.contributor_name,
             a.name AS artist_name, t.name AS tune_name
      FROM mezmurs m
      LEFT JOIN artists a ON m.artist_id = a.id
      LEFT JOIN tunes t ON m.tune_id = t.id
      WHERE m.status = 'approved'
      ORDER BY m.title
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mezmurs' });
  }
};

// GET /api/mezmurs/:id — single mezmur page with contributor attribution
export const getMezmurById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.query.admin === 'true';

  try {
    const mezmurResult = await query(
      `SELECT m.*, a.name AS artist_name, t.name AS tune_name
       FROM mezmurs m
       LEFT JOIN artists a ON m.artist_id = a.id
       LEFT JOIN tunes t ON m.tune_id = t.id
       WHERE m.id = $1`,
      [id]
    );

    if (mezmurResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mezmur not found' });
    }

    const mezmurRow = mezmurResult.rows[0];
    if (mezmurRow.status !== 'approved' && !isAdmin) {
      return res.status(404).json({ error: 'Mezmur not found or awaiting curator approval' });
    }

    const sequenceResult = await query(
      `SELECT ms.step_order, ms.line_number, ms.duration_ms, ms.group_id,
              ms.is_rest, ms.phrase_break,
              s.id AS string_id,
              COALESCE(s.string_position, 0) AS string_position,
              COALESCE(s.note_name, '') AS note_name,
              COALESCE(s.audio_file_url, '') AS audio_file_url
      FROM mezmur_sequences ms
      LEFT JOIN strings s ON ms.string_id = s.id
      WHERE ms.mezmur_id = $1
      ORDER BY ms.line_number, ms.step_order`,
      [id]
    );

    const response: MezmurWithSequence = {
      ...mezmurResult.rows[0],
      sequence: sequenceResult.rows,
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mezmur' });
  }
};

interface CreateMezmurBody {
  title: string;
  artist?: string;
  tune?: string;
  difficulty?: 'practice' | 'beginner' | 'intermediate' | 'advanced';
  lyrics?: string;
  youtube_url?: string;
  sequence?: { line: number; notes: string[] }[];
  raw_notation?: string;
  status?: 'approved' | 'pending';
  contributor_name?: string;
  contributor_email?: string;
  is_admin?: boolean;
}

// POST /api/mezmurs — create / submit a mezmur
export const createMezmur = async (req: Request, res: Response) => {
  const {
    title,
    artist = 'Traditional',
    tune = 'Tizita',
    difficulty = 'beginner',
    lyrics = '',
    youtube_url = '',
    sequence: providedSequence,
    raw_notation,
    status: explicitStatus,
    contributor_name,
    contributor_email,
    is_admin = false,
  }: CreateMezmurBody = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Determine publication status:
  // User submissions are strictly 'pending' awaiting admin review.
  // Only explicitly authorized admin creations can be 'approved'.
  const finalStatus: 'approved' | 'pending' = is_admin ? (explicitStatus || 'approved') : 'pending';
  const finalContributor = contributor_name?.trim() || (is_admin ? 'Begenarxiv' : 'Anonymous Learner');
  const finalEmail = contributor_email?.trim() || null;

  // Parse raw_notation if provided
  let parsedSequence: { line: number; notes: string[] }[] = [];
  if (providedSequence && Array.isArray(providedSequence) && providedSequence.length > 0) {
    parsedSequence = providedSequence;
  } else if (raw_notation && typeof raw_notation === 'string') {
    parsedSequence = parseAndExpandRawNotation(raw_notation);
  }

  try {
    const artistId = await findOrCreate('artists', artist.trim() || 'Traditional');
    const tuneId = await findOrCreate('tunes', tune.trim() || 'Tizita');
    const tuningProfileId = await getTuningProfileId(tune);

    const mezmurResult = await query(
      `INSERT INTO mezmurs (title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id, status, contributor_name, contributor_email, approved_at, raw_notation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        title.trim(),
        lyrics.trim() || null,
        youtube_url.trim() || null,
        difficulty,
        artistId,
        tuneId,
        tuningProfileId,
        finalStatus,
        finalContributor,
        finalEmail,
        finalStatus === 'approved' ? new Date() : null,
        raw_notation?.trim() || null,
      ]
    );

    const mezmurId = mezmurResult.rows[0].id;

    // Look up active string IDs by position 1-5
    const stringsResult = await query('SELECT id, string_position FROM strings');
    const stringIdByPosition = new Map<number, number>(
      stringsResult.rows.map((s: { id: number; string_position: number }) => [s.string_position, s.id])
    );

    let stepOrder = 1;
    let groupCounter = 1;

    for (const { line, notes } of parsedSequence) {
      for (const token of notes) {
        if (token === '|') {
          // Phrase pause / boundary: ~700ms natural breath pause
          await query(
            `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, is_rest, phrase_break)
             VALUES ($1, NULL, $2, $3, $4, FALSE, TRUE)`,
            [mezmurId, stepOrder, line, 700]
          );
          stepOrder++;
          continue;
        }

        if (/^\-+$/.test(token)) {
          // Rest pause: 500ms per hyphen beat
          const restDuration = Math.min(token.length * 500, 3000);
          await query(
            `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, is_rest, phrase_break)
             VALUES ($1, NULL, $2, $3, $4, TRUE, FALSE)`,
            [mezmurId, stepOrder, line, restDuration]
          );
          stepOrder++;
          continue;
        }

        const isGrouped = token.length > 1;
        const groupId = isGrouped ? groupCounter : null;
        const duration = isGrouped ? 200 : 500;

        for (const digit of token) {
          const pos = parseInt(digit, 10);
          const stringId = stringIdByPosition.get(pos);
          if (!stringId) continue;

          await query(
            `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, group_id, is_rest, phrase_break)
             VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE)`,
            [mezmurId, stringId, stepOrder, line, duration, groupId]
          );
          stepOrder++;
        }

        if (isGrouped) groupCounter++;
      }
    }

    res.status(201).json({
      success: true,
      mezmurId,
      title: title.trim(),
      status: finalStatus,
      contributor_name: finalContributor,
      totalSteps: stepOrder - 1,
      totalLines: parsedSequence.length,
      message:
        finalStatus === 'approved'
          ? 'Mezmur published to catalogue successfully.'
          : 'Your submission is pending approval, thanks for your contribution!',
    });
  } catch (err: unknown) {
    const errorMsg =
      (err && typeof err === 'object' && 'detail' in err && typeof (err as { detail: string }).detail === 'string')
        ? (err as { detail: string }).detail
        : err instanceof Error
        ? err.message
        : 'Failed to create mezmur';
    console.error('Failed to create mezmur:', err);
    res.status(500).json({ error: errorMsg });
  }
};

// GET /api/mezmurs/pending — list pending community submissions (admin only)
export const getPendingMezmurs = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT m.id, m.title, m.lyrics, m.youtube_url, m.difficulty, m.status,
             m.contributor_name, m.contributor_email, m.created_at,
             a.name AS artist_name, t.name AS tune_name
      FROM mezmurs m
      LEFT JOIN artists a ON m.artist_id = a.id
      LEFT JOIN tunes t ON m.tune_id = t.id
      WHERE m.status = 'pending'
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending mezmurs' });
  }
};

// POST /api/mezmurs/:id/approve — admin green lights a submission
export const approveMezmur = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updateResult = await query(
      `UPDATE mezmurs
       SET status = 'approved', approved_at = NOW()
       WHERE id = $1
       RETURNING id, title, contributor_name, contributor_email, tune_id`,
      [id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mezmur not found' });
    }

    const mezmur = updateResult.rows[0];

    // Look up tune name
    const tuneResult = await query(`SELECT name FROM tunes WHERE id = $1`, [mezmur.tune_id]);
    const tuneName = tuneResult.rows[0]?.name || 'Tizita';

    // Send recognition certificate email if contributor provided an email
    if (mezmur.contributor_email) {
      await sendContributorApprovalEmail({
        contributorName: mezmur.contributor_name || 'Contributor',
        contributorEmail: mezmur.contributor_email,
        mezmurId: mezmur.id,
        mezmurTitle: mezmur.title,
        tuneName,
        approvedDate: new Date().toLocaleDateString(),
      }).catch((e) => console.warn('Email dispatch failed:', e));
    }

    res.json({
      success: true,
      message: `"${mezmur.title}" is approved and published to the catalogue!`,
      mezmur,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve mezmur' });
  }
};

// POST /api/mezmurs/:id/reject — admin rejects a submission
export const rejectMezmur = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await query(
      `UPDATE mezmurs SET status = 'rejected' WHERE id = $1 RETURNING id, title`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mezmur not found' });
    }

    res.json({ success: true, message: 'Mezmur submission marked as rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reject mezmur' });
  }
};

// GET /api/mezmurs/admin/all — all mezmurs across statuses for the admin catalogue dashboard
export const getAllMezmursAdmin = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT m.id, m.title, m.difficulty, m.status, m.contributor_name, m.contributor_email,
             m.approved_at, m.created_at, m.lyrics, m.youtube_url,
             a.name AS artist_name, t.name AS tune_name,
             (SELECT COUNT(*) FROM mezmur_sequences WHERE mezmur_id = m.id) AS step_count
      FROM mezmurs m
      LEFT JOIN artists a ON m.artist_id = a.id
      LEFT JOIN tunes t ON m.tune_id = t.id
      ORDER BY m.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin catalogue' });
  }
};

// DELETE /api/mezmurs/:id — delete a mezmur and its sequences
export const deleteMezmur = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM mezmurs WHERE id = $1 RETURNING id, title', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mezmur not found' });
    }
    res.json({ success: true, message: `Deleted "${result.rows[0].title}"`, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete mezmur' });
  }
};

// PUT /api/mezmurs/:id — edit an existing mezmur and update its notation
export const updateMezmur = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    artist = 'Traditional',
    tune = 'Tizita',
    difficulty = 'beginner',
    lyrics = '',
    youtube_url = '',
    raw_notation,
    status: newStatus,
  }: CreateMezmurBody = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const artistId = await findOrCreate('artists', artist.trim() || 'Traditional');
    const tuneId = await findOrCreate('tunes', tune.trim() || 'Tizita');
    const tuningProfileId = await getTuningProfileId(tune);

    const updateRes = await query(
      `UPDATE mezmurs
       SET title = $1, lyrics = $2, youtube_url = $3, difficulty = $4,
           artist_id = $5, tune_id = $6, tuning_profile_id = $7,
           status = COALESCE($8, status),
           raw_notation = COALESCE($9, raw_notation)
       WHERE id = $10
       RETURNING id, title, status, raw_notation`,
      [
        title.trim(),
        lyrics.trim() || null,
        youtube_url.trim() || null,
        difficulty,
        artistId,
        tuneId,
        tuningProfileId,
        newStatus || null,
        raw_notation !== undefined ? (raw_notation?.trim() || null) : null,
        id,
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Mezmur not found' });
    }

    // If raw_notation was provided, re-populate mezmur_sequences
    if (raw_notation !== undefined && typeof raw_notation === 'string') {
      await query('DELETE FROM mezmur_sequences WHERE mezmur_id = $1', [id]);

      const parsedSequence = parseAndExpandRawNotation(raw_notation);

      const stringsResult = await query('SELECT id, string_position FROM strings');
      const stringIdByPosition = new Map<number, number>(
        stringsResult.rows.map((s: { id: number; string_position: number }) => [s.string_position, s.id])
      );

      let stepOrder = 1;
      let groupCounter = 1;

      for (const { line, notes } of parsedSequence) {
        for (const token of notes) {
          if (token === '|') {
            await query(
              `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, is_rest, phrase_break)
               VALUES ($1, NULL, $2, $3, $4, FALSE, TRUE)`,
              [id, stepOrder, line, 700]
            );
            stepOrder++;
            continue;
          }

          if (/^\-+$/.test(token)) {
            const restDuration = Math.min(token.length * 500, 3000);
            await query(
              `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, is_rest, phrase_break)
               VALUES ($1, NULL, $2, $3, $4, TRUE, FALSE)`,
              [id, stepOrder, line, restDuration]
            );
            stepOrder++;
            continue;
          }

          const isGrouped = token.length > 1;
          const groupId = isGrouped ? groupCounter : null;
          const duration = isGrouped ? 200 : 500;

          for (const digit of token) {
            const pos = parseInt(digit, 10);
            const stringId = stringIdByPosition.get(pos);
            if (!stringId) continue;

            await query(
              `INSERT INTO mezmur_sequences (mezmur_id, string_id, step_order, line_number, duration_ms, group_id, is_rest, phrase_break)
               VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE)`,
              [id, stringId, stepOrder, line, duration, groupId]
            );
            stepOrder++;
          }

          if (isGrouped) groupCounter++;
        }
      }
    }

    res.json({
      success: true,
      message: `Updated "${updateRes.rows[0].title}" successfully`,
      mezmurId: updateRes.rows[0].id,
    });
  } catch (err: unknown) {
    const errorMsg =
      (err && typeof err === 'object' && 'detail' in err && typeof (err as { detail: string }).detail === 'string')
        ? (err as { detail: string }).detail
        : err instanceof Error
        ? err.message
        : 'Failed to update mezmur';
    console.error('Failed to update mezmur:', err);
    res.status(500).json({ error: errorMsg });
  }
};

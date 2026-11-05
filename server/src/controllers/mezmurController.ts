import { Request, Response } from 'express';
import { query } from '../db';
import { MezmurWithSequence } from '../types';
import { sendContributorApprovalEmail } from '../services/emailService';

async function findOrCreate(table: 'artists' | 'tunes', name: string): Promise<number> {
  const existing = await query(`SELECT id FROM ${table} WHERE name = $1`, [name]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const inserted = await query(`INSERT INTO ${table} (name) VALUES ($1) RETURNING id`, [name]);
  return inserted.rows[0].id;
}

function getTuningProfileId(tuneName: string): number {
  const lower = tuneName.toLowerCase();
  if (lower.includes('selamta')) return 2;
  if (lower.includes('anchi')) return 3;
  return 1; // Tizita
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
      WHERE m.status = 'approved' OR m.status IS NULL
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

    const sequenceResult = await query(
      `SELECT ms.step_order, ms.line_number, ms.duration_ms, ms.group_id,
              s.id AS string_id, s.string_position, s.note_name, s.audio_file_url
      FROM mezmur_sequences ms
      JOIN strings s ON ms.string_id = s.id
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
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
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
  // Admin creations go to 'approved'; user community submissions go to 'pending'
  const finalStatus = explicitStatus || (is_admin ? 'approved' : 'pending');
  const finalContributor = contributor_name?.trim() || (is_admin ? 'Begenarxiv' : 'Anonymous Learner');
  const finalEmail = contributor_email?.trim() || null;

  // Parse raw_notation if provided
  let parsedSequence: { line: number; notes: string[] }[] = [];
  if (providedSequence && Array.isArray(providedSequence) && providedSequence.length > 0) {
    parsedSequence = providedSequence;
  } else if (raw_notation && typeof raw_notation === 'string') {
    const rawLines = raw_notation.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    parsedSequence = rawLines.map((lineStr, idx) => {
      const tokens = lineStr
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter((t) => /^[1-5]+$/.test(t));
      return { line: idx + 1, notes: tokens };
    }).filter((l) => l.notes.length > 0);
  }

  try {
    const artistId = await findOrCreate('artists', artist.trim() || 'Traditional');
    const tuneId = await findOrCreate('tunes', tune.trim() || 'Tizita');
    const tuningProfileId = getTuningProfileId(tune);

    const mezmurResult = await query(
      `INSERT INTO mezmurs (title, lyrics, youtube_url, difficulty, artist_id, tune_id, tuning_profile_id, status, contributor_name, contributor_email, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
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
        const isGrouped = token.length > 1;
        const groupId = isGrouped ? groupCounter : null;
        const duration = isGrouped ? 200 : 500;

        for (const digit of token) {
          const pos = parseInt(digit, 10);
          const stringId = stringIdByPosition.get(pos);
          if (!stringId) continue;

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
  } catch (err) {
    console.error('Failed to create mezmur:', err);
    res.status(500).json({ error: 'Failed to create mezmur' });
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

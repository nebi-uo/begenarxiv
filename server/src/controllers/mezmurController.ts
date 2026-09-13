import { Request, Response } from 'express';
import { query } from '../db';
import { Mezmur, SequenceStep, MezmurWithSequence } from '../types';

// GET /api/mezmurs — catalogue listing (browse by artist/tune)
export const getAllMezmurs = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT m.id, m.title, m.difficulty, a.name AS artist_name, t.name AS tune_name
      FROM mezmurs m
      LEFT JOIN artists a ON m.artist_id = a.id
      LEFT JOIN tunes t ON m.tune_id = t.id
      ORDER BY m.title
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mezmurs' });
  }
};

// GET /api/mezmurs/:id — single mezmur page: full details + its tap-to-hear sequence
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
      `SELECT ms.step_order, ms.line_number, ms.duration_ms,
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
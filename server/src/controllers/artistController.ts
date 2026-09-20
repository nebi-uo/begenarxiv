import { Request, Response } from 'express';
import { query } from '../db';

export const getAllArtists = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, name FROM artists ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
};

export const getMezmursByArtist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const excludeId = req.query.exclude as string | undefined;

  try {
    const result = await query(
      `SELECT m.id, m.title, m.difficulty, a.name AS artist_name, t.name AS tune_name
       FROM mezmurs m
       LEFT JOIN artists a ON m.artist_id = a.id
       LEFT JOIN tunes t ON m.tune_id = t.id
       WHERE m.artist_id = $1 AND m.id != $2
       ORDER BY m.title`,
      [id, excludeId ?? -1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artist mezmurs' });
  }
};
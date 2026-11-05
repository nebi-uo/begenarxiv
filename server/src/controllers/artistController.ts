import { Request, Response } from 'express';
import { query } from '../db';

export const getAllArtists = async (req: Request, res: Response) => {
  const includeEmpty = req.query.include_empty === 'true';

  try {
    const result = await query(`
      SELECT a.id, a.name, COUNT(m.id)::int AS mezmur_count
      FROM artists a
      LEFT JOIN mezmurs m ON m.artist_id = a.id AND m.status = 'approved'
      WHERE a.name IS NOT NULL AND TRIM(a.name) != ''
      GROUP BY a.id, a.name
      ${includeEmpty ? '' : 'HAVING COUNT(m.id) > 0'}
      ORDER BY a.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
};

export const createArtist = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Artist name is required' });
    return;
  }
  const trimmed = name.trim();
  try {
    const existing = await query(
      'SELECT id, name FROM artists WHERE LOWER(TRIM(name)) = LOWER($1)',
      [trimmed]
    );
    if (existing.rows.length > 0) {
      res.json(existing.rows[0]);
      return;
    }
    const inserted = await query(
      'INSERT INTO artists (name) VALUES ($1) RETURNING id, name',
      [trimmed]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create artist' });
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
       WHERE m.artist_id = $1 AND m.id != $2 AND m.status = 'approved'
       ORDER BY m.title`,
      [id, excludeId ?? -1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch artist mezmurs' });
  }
};

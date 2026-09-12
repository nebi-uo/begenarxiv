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
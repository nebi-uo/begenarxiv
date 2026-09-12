import { Request, Response } from 'express';
import { query } from '../db';

export const getAllTunes = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, name FROM tunes ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tunes' });
  }
};
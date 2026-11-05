import { Request, Response } from 'express';
import { query } from '../db';

// Ensure table exists on first run
const initTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS mezmur_requests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT,
        youtube_url TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (e) {
    // ignore
  }
};
initTable();

// GET /api/requests — list all requests
export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT * FROM mezmur_requests
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to get requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// POST /api/requests — submit a decode request
export const createRequest = async (req: Request, res: Response) => {
  const { title, artist, youtube_url, notes } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Hymn title is required' });
  }

  try {
    const result = await query(
      `INSERT INTO mezmur_requests (title, artist, youtube_url, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), artist?.trim() || null, youtube_url?.trim() || null, notes?.trim() || null]
    );

    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error('Failed to create request:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

// PATCH /api/requests/:id — update status (e.g. 'in_progress', 'completed')
export const updateRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await query(
      `UPDATE mezmur_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ success: true, request: result.rows[0] });
  } catch (err) {
    console.error('Failed to update request:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
};


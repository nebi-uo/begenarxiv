import { Request, Response } from 'express';
import { query } from '../db';
import {
  sendDecodeRequestReceivedEmail,
  sendDecodeRequestCompletedEmail,
} from '../services/emailService';

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
        requester_name TEXT,
        requester_email TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
        created_at TIMESTAMP DEFAULT NOW()
      );
      ALTER TABLE mezmur_requests ADD COLUMN IF NOT EXISTS requester_name TEXT;
      ALTER TABLE mezmur_requests ADD COLUMN IF NOT EXISTS requester_email TEXT;
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
  const { title, artist, youtube_url, notes, requester_name, requester_email } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Hymn title is required' });
  }

  try {
    const result = await query(
      `INSERT INTO mezmur_requests (title, artist, youtube_url, notes, requester_name, requester_email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        artist?.trim() || null,
        youtube_url?.trim() || null,
        notes?.trim() || null,
        requester_name?.trim() || null,
        requester_email?.trim() || null,
      ]
    );

    const savedRequest = result.rows[0];

    // Trigger emails: notification to admin (nebiyoutahoa@gmail.com) + confirmation receipt to requester
    await sendDecodeRequestReceivedEmail({
      requestId: savedRequest.id,
      title: savedRequest.title,
      artist: savedRequest.artist,
      youtubeUrl: savedRequest.youtube_url,
      notes: savedRequest.notes,
      requesterName: savedRequest.requester_name,
      requesterEmail: savedRequest.requester_email,
    }).catch((e) => console.warn('Request notification email dispatch failed:', e));

    res.status(201).json({ success: true, request: savedRequest });
  } catch (err) {
    console.error('Failed to create request:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

// PATCH /api/requests/:id — update status (e.g. 'in_progress', 'completed')
export const updateRequestStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, mezmur_id } = req.body;

  try {
    const result = await query(
      `UPDATE mezmur_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = result.rows[0];

    // If marked completed and requester provided an email, notify them that it is live
    if (status === 'completed' && updated.requester_email) {
      await sendDecodeRequestCompletedEmail({
        title: updated.title,
        mezmurId: mezmur_id || updated.id,
        requesterName: updated.requester_name,
        requesterEmail: updated.requester_email,
      }).catch((e) => console.warn('Completion email dispatch failed:', e));
    }

    res.json({ success: true, request: updated });
  } catch (err) {
    console.error('Failed to update request:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
};


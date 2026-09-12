import { Request, Response } from 'express';
import { query } from '../db';
import { TuningProfileWithNotes } from '../types';

// GET /api/tuning-profiles — list of available tunings (for standalone tuner selector)
export const getAllTuningProfiles = async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, name, description FROM tuning_profiles ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tuning profiles' });
  }
};

// GET /api/tuning-profiles/:id — full guided-walkthrough data: each string's target frequency + audio
export const getTuningProfileById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const profileResult = await query(
      'SELECT id, name, description FROM tuning_profiles WHERE id = $1',
      [id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tuning profile not found' });
    }

    const notesResult = await query(
      `SELECT s.id AS string_id, s.note_name, s.audio_file_url, tpn.frequency_hz
       FROM tuning_profile_notes tpn
       JOIN strings s ON tpn.string_id = s.id
       WHERE tpn.tuning_profile_id = $1
       ORDER BY s.string_position`,
      [id]
    );

    const response: TuningProfileWithNotes = {
      ...profileResult.rows[0],
      notes: notesResult.rows,
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tuning profile' });
  }
};
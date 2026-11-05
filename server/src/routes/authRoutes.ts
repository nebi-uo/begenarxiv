import { Router, Request, Response } from 'express';
import {
  verifyAdminPassword,
  generateAdminToken,
  extractBearerToken,
  verifyAdminToken,
} from '../middleware/auth';

const router = Router();

// POST /api/admin/login — authenticate master curator password
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body || {};

  if (!password || !verifyAdminPassword(password)) {
    return res.status(401).json({
      error: 'Invalid curator password. Please check your credentials.',
    });
  }

  const token = generateAdminToken();
  res.json({
    success: true,
    token,
    message: 'Authentication successful. Curator session established.',
  });
});

// GET /api/admin/verify — verify active curator session
router.get('/verify', (req: Request, res: Response) => {
  const token = extractBearerToken(req);

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({
      valid: false,
      error: 'Session invalid or expired. Please re-authenticate.',
    });
  }

  res.json({
    success: true,
    valid: true,
  });
});

// POST /api/admin/logout — invalidate session on client
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Signed out successfully.' });
});

export default router;


import { Router } from 'express';
import { getAllTunes } from '../controllers/tuneController';

const router = Router();
router.get('/', getAllTunes);

export default router;
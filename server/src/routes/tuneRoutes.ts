import { Router } from 'express';
import { getAllTunes, getMezmursByTune } from '../controllers/tuneController';

const router = Router();
router.get('/', getAllTunes);
router.get('/:id/mezmurs', getMezmursByTune);

export default router;
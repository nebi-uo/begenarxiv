import { Router } from 'express';
import { getAllTuningProfiles, getTuningProfileById } from '../controllers/tuningController';

const router = Router();
router.get('/', getAllTuningProfiles);
router.get('/:id', getTuningProfileById);

export default router;
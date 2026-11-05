import { Router } from 'express';
import {
  getAllMezmurs,
  getMezmurById,
  createMezmur,
  getPendingMezmurs,
  approveMezmur,
  rejectMezmur,
} from '../controllers/mezmurController';

const router = Router();

router.get('/', getAllMezmurs);
router.get('/pending', getPendingMezmurs);
router.get('/:id', getMezmurById);
router.post('/', createMezmur);
router.post('/:id/approve', approveMezmur);
router.post('/:id/reject', rejectMezmur);

export default router;

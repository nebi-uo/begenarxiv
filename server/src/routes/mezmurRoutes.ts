import { Router } from 'express';
import {
  getAllMezmurs,
  getAllMezmursAdmin,
  getMezmurById,
  createMezmur,
  updateMezmur,
  deleteMezmur,
  getPendingMezmurs,
  approveMezmur,
  rejectMezmur,
} from '../controllers/mezmurController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getAllMezmurs);
router.get('/pending', requireAdmin, getPendingMezmurs);
router.get('/admin/all', requireAdmin, getAllMezmursAdmin);
router.get('/:id', getMezmurById);
router.post('/', createMezmur);
router.put('/:id', requireAdmin, updateMezmur);
router.delete('/:id', requireAdmin, deleteMezmur);
router.post('/:id/approve', requireAdmin, approveMezmur);
router.post('/:id/reject', requireAdmin, rejectMezmur);

export default router;

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

const router = Router();

router.get('/', getAllMezmurs);
router.get('/pending', getPendingMezmurs);
router.get('/admin/all', getAllMezmursAdmin);
router.get('/:id', getMezmurById);
router.post('/', createMezmur);
router.put('/:id', updateMezmur);
router.delete('/:id', deleteMezmur);
router.post('/:id/approve', approveMezmur);
router.post('/:id/reject', rejectMezmur);

export default router;

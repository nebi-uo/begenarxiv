import { Router } from 'express';
import { getAllRequests, createRequest, updateRequestStatus } from '../controllers/requestController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getAllRequests);
router.post('/', createRequest);
router.patch('/:id', requireAdmin, updateRequestStatus);

export default router;


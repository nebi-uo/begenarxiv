import { Router } from 'express';
import { getAllRequests, createRequest, updateRequestStatus } from '../controllers/requestController';

const router = Router();

router.get('/', getAllRequests);
router.post('/', createRequest);
router.patch('/:id', updateRequestStatus);

export default router;


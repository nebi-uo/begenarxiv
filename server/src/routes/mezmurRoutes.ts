import { Router } from 'express';
import { getAllMezmurs, getMezmurById, createMezmur } from '../controllers/mezmurController';

const router = Router();

router.get('/', getAllMezmurs);
router.get('/:id', getMezmurById);
router.post('/', createMezmur);

export default router;

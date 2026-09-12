import { Router } from 'express';
import { getAllMezmurs, getMezmurById } from '../controllers/mezmurController';

const router = Router();

router.get('/', getAllMezmurs);
router.get('/:id', getMezmurById);

export default router;
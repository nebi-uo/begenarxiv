import { Router } from 'express';
import { getAllArtists } from '../controllers/artistController';

const router = Router();
router.get('/', getAllArtists);

export default router;
import { Router } from 'express';
import { getAllArtists, getMezmursByArtist } from '../controllers/artistController';

const router = Router();
router.get('/', getAllArtists);
router.get('/:id/mezmurs', getMezmursByArtist);

export default router;
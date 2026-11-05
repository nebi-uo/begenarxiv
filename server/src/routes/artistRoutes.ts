import { Router } from 'express';
import { getAllArtists, getMezmursByArtist, createArtist } from '../controllers/artistController';

const router = Router();
router.get('/', getAllArtists);
router.post('/', createArtist);
router.get('/:id/mezmurs', getMezmursByArtist);

export default router;

import { Router } from 'express';
import { findSimilar } from '../controllers/similar.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/:id/similar', findSimilar);

export default router;

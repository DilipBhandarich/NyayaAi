import { Router } from 'express';
import { listByCaseId } from '../controllers/prediction.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/:id/predictions', listByCaseId);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as bailController from '../controllers/bail.controller.js';

const router = Router();

router.post('/:id/bail-assessment', protect, bailController.generate);
router.get('/:id/bail-assessments', protect, bailController.list);

export default router;

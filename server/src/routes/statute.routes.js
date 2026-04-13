import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as statuteController from '../controllers/statute.controller.js';

const router = Router();

router.get('/', protect, statuteController.search);
router.get('/categories', protect, statuteController.categories);
router.get('/lookup/:section', protect, statuteController.lookup);

export default router;

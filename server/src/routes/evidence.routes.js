import { Router } from 'express';
import { listByCaseId, create } from '../controllers/evidence.controller.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createEvidenceSchema } from '../validators/evidence.validator.js';

const router = Router();

router.use(protect);

router.get('/:id/evidence', listByCaseId);
router.post('/:id/evidence', validate(createEvidenceSchema), create);

export default router;

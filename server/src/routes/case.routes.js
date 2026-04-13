import { Router } from 'express';
import { list, create, getById, update, remove, triggerAnalysis } from '../controllers/case.controller.js';
import { exportPdf } from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import validate from '../middleware/validate.js';
import { createCaseSchema, updateCaseSchema } from '../validators/case.validator.js';

const router = Router();

router.use(protect);

router.get('/', list);
router.post('/', validate(createCaseSchema), create);
router.get('/:id', getById);
router.put('/:id', validate(updateCaseSchema), update);
router.delete('/:id', requireRole('admin', 'judge'), remove);
router.post('/:id/analyze', triggerAnalysis);
router.get('/:id/export-pdf', exportPdf);

export default router;

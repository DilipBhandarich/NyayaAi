import { Router } from 'express';
import { uploadDocument, listByCaseId, getById } from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect);

// Nested under /api/cases/:id/documents
router.post('/cases/:id/documents', upload.single('file'), uploadDocument);
router.get('/cases/:id/documents', listByCaseId);

// Direct document access
router.get('/documents/:docId', getById);

export default router;

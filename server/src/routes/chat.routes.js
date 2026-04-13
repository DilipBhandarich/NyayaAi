import { Router } from 'express';
import { sendMessage, getHistory } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { chatMessageSchema } from '../validators/evidence.validator.js';

const router = Router();

router.use(protect);

router.post('/:id/chat', validate(chatMessageSchema), sendMessage);
router.get('/:id/chat', getHistory);

export default router;

// === AI Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireNotBlocked } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

// Chat
router.post(
  '/chat',
  authenticate,
  requireNotBlocked,
  [body('message').trim().notEmpty().withMessage('Сообщение обязательно')],
  handleValidationErrors,
  aiController.chat
);

// Clear history
router.delete('/chat/history', authenticate, requireNotBlocked, aiController.clearHistory);

export default router;
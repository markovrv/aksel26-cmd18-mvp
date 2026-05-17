// === Widget Routes (no auth required) ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as widgetController from '../controllers/chatWidgetController.js';

const router = express.Router();

// Chat widget — authenticate опционально, если нет токена — req.user будет undefined
router.post(
  '/chat',
  (req, res, next) => {
    // Пробуем аутентификацию, но не блокируем если нет токена
    const token = req.cookies.token;
    if (token) {
      return authenticate(req, res, next);
    }
    next();
  },
  [body('message').trim().notEmpty().withMessage('Сообщение обязательно')],
  handleValidationErrors,
  widgetController.widgetChat
);

export default router;
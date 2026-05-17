// === Widget Routes (no auth required) ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/config.js';
import * as widgetController from '../controllers/chatWidgetController.js';

const router = express.Router();

// Chat widget — опциональная аутентификация без блокировки
router.post(
  '/chat',
  (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (token) {
        req.user = jwt.verify(token, getJwtSecret());
      }
    } catch {
      // токен невалидный — просто игнорируем
    }
    next();
  },
  [body('message').trim().notEmpty().withMessage('Сообщение обязательно')],
  handleValidationErrors,
  widgetController.widgetChat
);

export default router;
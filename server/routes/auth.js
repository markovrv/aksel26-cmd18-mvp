// === Auth Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
    body('name').trim().isLength({ min: 2 }).withMessage('Имя минимум 2 символа'),
    body('role').optional().isIn(['user', 'enterprise']).withMessage('Недопустимая роль')
  ],
  handleValidationErrors,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
  ],
  handleValidationErrors,
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// Confirm email
router.get('/confirm/:token', authController.confirmEmail);

// Get current user
router.get('/me', authenticate, authController.getMe);

export default router;
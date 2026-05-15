// === Admin Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireRole, requireNotBlocked } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Get all users
router.get('/users', authenticate, requireRole('admin'), adminController.getUsers);

// Block/unblock user
router.put(
  '/users/:id/block',
  authenticate,
  requireRole('admin'),
  [
    body('is_blocked').isBoolean().withMessage('Некорректное значение')
  ],
  handleValidationErrors,
  adminController.blockUser
);

// Get stats
router.get('/stats', authenticate, requireRole('admin'), adminController.getStats);

// Get enterprise users available for assignment
router.get('/enterprise-users-available', authenticate, requireRole('admin'), adminController.getAvailableEnterpriseUsers);

export default router;

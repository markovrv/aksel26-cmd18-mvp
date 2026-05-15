// === QR Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireRole, requireNotBlocked } from '../middleware/auth.js';
import * as qrController from '../controllers/qrController.js';

const router = express.Router();

// Scan QR (user scans after visiting)
router.post(
  '/scan',
  authenticate,
  requireNotBlocked,
  [body('token').notEmpty().withMessage('Токен обязателен')],
  handleValidationErrors,
  qrController.scanQR
);

// Generate QR codes for enterprise
router.get('/generate/:enterpriseId', authenticate, requireRole('enterprise', 'admin'), qrController.generateQR);

export default router;
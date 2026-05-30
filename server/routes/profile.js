// === Profile Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireNotBlocked } from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';
import * as vacanciesController from '../controllers/vacanciesController.js';

const router = express.Router();

// Get profile
router.get('/', authenticate, requireNotBlocked, profileController.getProfile);

// Update profile
router.put(
  '/',
  authenticate,
  requireNotBlocked,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Имя минимум 2 символа'),
    body('phone').optional(),
    body('city').optional(),
    body('avatar_url').optional()
  ],
  handleValidationErrors,
  profileController.updateProfile
);

// Get visited enterprises
router.get('/visited', authenticate, requireNotBlocked, profileController.getVisitedEnterprises);

// Get my applications
router.get('/applications', authenticate, requireNotBlocked, profileController.getApplications);

// Cancel my application
router.delete('/applications/:applicationId', authenticate, requireNotBlocked, vacanciesController.cancelApplication);

export default router;

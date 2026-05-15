// === Professions Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as professionsController from '../controllers/professionsController.js';

const router = express.Router();

// Get all professions
router.get('/', professionsController.getProfessions);

// Get single profession
router.get('/:id', professionsController.getProfession);

// Get enterprises by profession
router.get('/:id/enterprises', professionsController.getProfessionEnterprises);

// Create profession (admin)
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [
    body('title').trim().notEmpty().withMessage('Название обязательно'),
    body('description').optional(),
    body('industry').trim().notEmpty().withMessage('Отрасль обязательна')
  ],
  handleValidationErrors,
  professionsController.createProfession
);

// Update profession (admin)
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  handleValidationErrors,
  professionsController.updateProfession
);

// Delete profession (admin)
router.delete('/:id', authenticate, requireRole('admin'), professionsController.deleteProfession);

export default router;
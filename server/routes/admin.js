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

// Get AI credentials
router.get('/ai-creds', authenticate, requireRole('admin'), adminController.getAiCreds);

// Update AI credentials
router.put('/ai-creds', authenticate, requireRole('admin'), adminController.updateAiCreds);

// === Educational Institutions ===

// Get all educational institutions
router.get('/educational-institutions', authenticate, requireRole('admin'), adminController.getEducationalInstitutions);

// Create educational institution
router.post(
  '/educational-institutions',
  authenticate,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Название обязательно'),
    body('type').trim().isIn(['вуз', 'колледж', 'техникум']).withMessage('Тип должен быть: вуз, колледж, техникум'),
    body('website').optional()
  ],
  handleValidationErrors,
  adminController.createEducationalInstitution
);

// Delete educational institution
router.delete('/educational-institutions/:id', authenticate, requireRole('admin'), adminController.deleteEducationalInstitution);

// Link institution to profession
router.post('/professions/:id/institutions', authenticate, requireRole('admin'), [
  body('institution_id').isInt().withMessage('ID заведения обязателен')
], handleValidationErrors, (req, res) => {
  req.params.instId = req.body.institution_id;
  adminController.linkInstitutionToProfession(req, res);
});

// Unlink institution from profession
router.delete('/professions/:id/institutions/:instId', authenticate, requireRole('admin'), adminController.unlinkInstitutionFromProfession);

// === Applications ===

// Get all applications
router.get('/applications', authenticate, requireRole('admin'), adminController.getAllApplications);

// === VK Credentials ===

// Get VK credentials
router.get('/vk-creds', authenticate, requireRole('admin'), adminController.getVkCreds);

// Update VK credentials
router.put('/vk-creds', authenticate, requireRole('admin'), adminController.updateVkCreds);

export default router;

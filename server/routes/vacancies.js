// === Vacancies Routes ===
import express from 'express';
import { authenticate, requireRole, requireNotBlocked } from '../middleware/auth.js';
import * as vacanciesController from '../controllers/vacanciesController.js';

const router = express.Router();

// Apply to vacancy (auth required)
router.post('/:vacancyId/apply', authenticate, requireNotBlocked, vacanciesController.applyToVacancy);

// Delete vacancy (enterprise or admin)
router.delete('/:vacancyId', authenticate, requireRole('enterprise', 'admin'), requireNotBlocked, vacanciesController.deleteVacancy);

export default router;
// === Enterprises Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireRole, requireNotBlocked } from '../middleware/auth.js';
import * as enterprisesController from '../controllers/enterprisesController.js';
import * as vacanciesController from '../controllers/vacanciesController.js';

const router = express.Router();

// Get all enterprises
router.get('/', enterprisesController.getEnterprises);

// Get geo enterprises (for map)
router.get('/geo', enterprisesController.getEnterprisesGeo);

// Get single enterprise
router.get('/:id', enterprisesController.getEnterprise);

// Get enterprise slots
router.get('/:id/slots', enterprisesController.getEnterpriseSlots);

// Get enterprise vacancies
router.get('/:id/vacancies', vacanciesController.getEnterpriseVacancies);

// Get enterprise bookings (enterprise owner or admin)
router.get('/:id/bookings', authenticate, requireNotBlocked, enterprisesController.getEnterpriseBookings);

// Get enterprise applications (enterprise owner or admin)
router.get('/:id/applications', authenticate, requireRole('enterprise', 'admin'), requireNotBlocked, vacanciesController.getEnterpriseApplications);

// Create enterprise
router.post(
  '/',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  [
    body('name').trim().notEmpty().withMessage('Название обязательно'),
    body('industry').trim().notEmpty().withMessage('Отрасль обязательна'),
    body('city').trim().notEmpty().withMessage('Город обязателен')
  ],
  handleValidationErrors,
  enterprisesController.createEnterprise
);

// Update enterprise
router.put(
  '/:id',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  handleValidationErrors,
  enterprisesController.updateEnterprise
);

// Delete enterprise (admin)
router.delete('/:id', authenticate, requireRole('admin'), enterprisesController.deleteEnterprise);

// Create slot for enterprise
router.post(
  '/:id/slots',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  [
    body('date').notEmpty().withMessage('Дата обязательна'),
    body('time').notEmpty().withMessage('Время обязательно'),
    body('max_participants').optional().isInt({ min: 1 }).withMessage('Макс. участников должно быть числом')
  ],
  handleValidationErrors,
  enterprisesController.createSlot
);

// Link profession to enterprise
router.post(
  '/:id/professions',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  [
    body('profession_id').isInt().withMessage('ID профессии обязателен')
  ],
  handleValidationErrors,
  enterprisesController.linkProfession
);

// Unlink profession from enterprise
router.delete(
  '/:id/professions/:professionId',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  enterprisesController.unlinkProfession
);

// Create vacancy for enterprise
router.post(
  '/:id/vacancies',
  authenticate,
  requireRole('enterprise', 'admin'),
  requireNotBlocked,
  [
    body('profession_id').isInt().withMessage('ID профессии обязателен'),
    body('available_slots').optional().isInt({ min: 1 }).withMessage('Количество мест должно быть числом')
  ],
  handleValidationErrors,
  vacanciesController.createVacancy
);

export default router;
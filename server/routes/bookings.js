// === Bookings Routes ===
import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { authenticate, requireNotBlocked } from '../middleware/auth.js';
import * as bookingsController from '../controllers/bookingsController.js';

const router = express.Router();

// Create booking
router.post(
  '/',
  authenticate,
  requireNotBlocked,
  [
    body('slot_id').isInt().withMessage('ID слота обязателен'),
    body('enterprise_id').isInt().withMessage('ID предприятия обязателен')
  ],
  handleValidationErrors,
  bookingsController.createBooking
);

// Get my bookings
router.get('/my', authenticate, requireNotBlocked, bookingsController.getMyBookings);

// Delete booking
router.delete('/:id', authenticate, bookingsController.deleteBooking);

export default router;
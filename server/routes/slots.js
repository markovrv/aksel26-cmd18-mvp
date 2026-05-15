// === Slots Routes ===
import express from 'express';
import { authenticate, requireRole, requireNotBlocked } from '../middleware/auth.js';
import * as slotsController from '../controllers/slotsController.js';

const router = express.Router();

// Delete slot
router.delete('/:slotId', authenticate, requireRole('enterprise', 'admin'), requireNotBlocked, slotsController.deleteSlot);

export default router;
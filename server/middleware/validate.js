// === Validation Middleware ===
import { validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() });
  }
  next();
}
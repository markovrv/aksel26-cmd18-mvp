// === JWT Authentication Middleware ===
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { getJwtSecret } from '../utils/config.js';

export function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
  };
}

export function requireNotBlocked(req, res, next) {
  if (req.user && req.user.is_blocked) {
    return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
  }
  next();
}

export async function getUserById(id) {
  return db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
}
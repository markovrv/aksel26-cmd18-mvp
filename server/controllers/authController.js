// === Auth Controller ===
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db/index.js';
import { getJwtSecret } from '../utils/config.js';

const saltRounds = 12;

// === Register ===
export async function register(req, res) {
  try {
    const { email, password, name, role = 'user' } = req.body;

    const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email уже зарегистрирован' });
    }

    const password_hash = await bcrypt.hash(password, saltRounds);
    const confirm_token = crypto.randomBytes(32).toString('hex');

    const result = await db.runAsync(
      'INSERT INTO users (email, password_hash, name, role, confirm_token) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, name, role, confirm_token]
    );

    // In production, send confirmation email here
    const token = jwt.sign(
      { id: result.lastID, email, name, role, is_blocked: 0 },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.status(201).json({
      message: 'Регистрация успешна',
      user: { id: result.lastID, email, name, role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
}

// === Login ===
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, is_blocked: user.is_blocked },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      message: 'Вход выполнен',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
}

// === Logout ===
export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Выход выполнен' });
}

// === Confirm Email ===
export async function confirmEmail(req, res) {
  try {
    const { token } = req.params;

    const user = await db.getAsync('SELECT * FROM users WHERE confirm_token = ?', [token]);
    if (!user) {
      return res.status(404).json({ message: 'Неверный токен подтверждения' });
    }

    await db.runAsync(
      'UPDATE users SET is_confirmed = 1, confirm_token = NULL WHERE id = ?',
      [user.id]
    );

    res.json({ message: 'Email подтверждён' });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ message: 'Ошибка при подтверждении email' });
  }
}

// === Get Current User ===
export async function getMe(req, res) {
  try {
    const user = await db.getAsync(
      'SELECT id, email, name, role, phone, city, avatar_url, is_blocked, is_confirmed, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Ошибка при получении данных' });
  }
}
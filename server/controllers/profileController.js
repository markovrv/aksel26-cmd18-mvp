// === Profile Controller ===
import db from '../db/index.js';

// === Get Profile ===
export async function getProfile(req, res) {
  try {
    const user = await db.getAsync(
      'SELECT id, email, name, role, phone, city, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({ user });
  } catch (err) {
    console.error('GetProfile error:', err);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
}

// === Update Profile ===
export async function updateProfile(req, res) {
  try {
    const { name, phone, city, avatar_url } = req.body;

    await db.runAsync(
      'UPDATE users SET name = ?, phone = ?, city = ?, avatar_url = ? WHERE id = ?',
      [name, phone, city, avatar_url, req.user.id]
    );

    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
}

// === Get Visited Enterprises ===
export async function getVisitedEnterprises(req, res) {
  try {
    const visited = await db.allAsync(
      `SELECT DISTINCT e.*, b.created_at as visited_at
       FROM bookings b
       INNER JOIN enterprises e ON b.enterprise_id = e.id
       WHERE b.user_id = ? AND b.status = 'visited'
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ data: visited });
  } catch (err) {
    console.error('GetVisitedEnterprises error:', err);
    res.status(500).json({ message: 'Ошибка при получении истории посещений' });
  }
}
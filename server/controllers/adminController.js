// === Admin Controller ===
import db from '../db/index.js';

// === Get Users ===
export async function getUsers(req, res) {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const users = await db.allAsync(
      'SELECT id, name, email, role, is_blocked, created_at FROM users ORDER BY name LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );

    res.json({ data: users });
  } catch (err) {
    console.error('GetUsers error:', err);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
}

// === Block / Unblock User ===
export async function blockUser(req, res) {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;

    await db.runAsync('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked ? 1 : 0, id]);
    res.json({ message: is_blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован' });
  } catch (err) {
    console.error('BlockUser error:', err);
    res.status(500).json({ message: 'Ошибка при блокировке пользователя' });
  }
}

// === Get Stats ===
export async function getStats(req, res) {
  try {
    const [users, enterprises, professions, bookings, visited, activeSlots] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM users'),
      db.getAsync('SELECT COUNT(*) as count FROM enterprises'),
      db.getAsync('SELECT COUNT(*) as count FROM professions'),
      db.getAsync('SELECT COUNT(*) as count FROM bookings'),
      db.getAsync("SELECT COUNT(*) as count FROM bookings WHERE status = 'visited'"),
      db.getAsync("SELECT COUNT(*) as count FROM slots WHERE date >= date('now')")
    ]);

    res.json({
      stats: {
        users: users.count,
        enterprises: enterprises.count,
        professions: professions.count,
        bookings: bookings.count,
        visited: visited.count,
        activeSlots: activeSlots.count
      }
    });
  } catch (err) {
    console.error('GetStats error:', err);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
}

// === Get Enterprise Users Available for Assignment ===
export async function getAvailableEnterpriseUsers(req, res) {
  try {
    const { exclude_enterprise_id } = req.query;

    let sql = "SELECT u.id, u.name, u.email FROM users u WHERE u.role = 'enterprise' AND NOT EXISTS (SELECT 1 FROM enterprises e WHERE e.user_id = u.id";
    const params = [];

    if (exclude_enterprise_id) {
      sql += ' AND e.id != ?';
      params.push(Number(exclude_enterprise_id));
    }

    sql += ') ORDER BY u.name';

    const users = await db.allAsync(sql, params);
    res.json({ data: users });
  } catch (err) {
    console.error('GetAvailableEnterpriseUsers error:', err);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
}
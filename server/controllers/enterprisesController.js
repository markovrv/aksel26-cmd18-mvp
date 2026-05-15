// === Enterprises Controller ===
import db from '../db/index.js';

// === Get All Enterprises ===
export async function getEnterprises(req, res) {
  try {
    const { industry, city, hasSlots, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (industry) {
      whereClause += ' AND e.industry = ?';
      params.push(industry);
    }
    if (city) {
      whereClause += ' AND e.city = ?';
      params.push(city);
    }
    if (hasSlots === 'true') {
      whereClause += ' AND EXISTS (SELECT 1 FROM slots s WHERE s.enterprise_id = e.id AND s.date >= date("now"))';
    }

    const total = await db.getAsync(
      `SELECT COUNT(*) as count FROM enterprises e WHERE ${whereClause}`,
      params
    );

    const enterprises = await db.allAsync(
      `SELECT e.*,
        (SELECT COUNT(*) FROM slots s WHERE s.enterprise_id = e.id AND s.date >= date('now')) as slot_count
       FROM enterprises e WHERE ${whereClause} ORDER BY e.name LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      data: enterprises,
      total: total.count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error('GetEnterprises error:', err);
    res.status(500).json({ message: 'Ошибка при получении предприятий' });
  }
}

// === Get Geo Enterprises (for map) ===
export async function getEnterprisesGeo(req, res) {
  try {
    const enterprises = await db.allAsync(
      `SELECT id, name, city, address, latitude, longitude FROM enterprises
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL`
    );
    res.json(enterprises);
  } catch (err) {
    console.error('GetEnterprisesGeo error:', err);
    res.status(500).json({ message: 'Ошибка при получении данных для карты' });
  }
}

// === Get Single Enterprise ===
export async function getEnterprise(req, res) {
  try {
    const { id } = req.params;

    const enterprise = await db.getAsync('SELECT * FROM enterprises WHERE id = ?', [id]);
    if (!enterprise) {
      return res.status(404).json({ message: 'Предприятие не найдено' });
    }

    // Get professions for this enterprise
    const professions = await db.allAsync(
      `SELECT p.* FROM professions p
       INNER JOIN enterprise_professions ep ON p.id = ep.profession_id
       WHERE ep.enterprise_id = ?`,
      [id]
    );

    // Get slots count
    const slotsCount = await db.getAsync(
      `SELECT COUNT(*) as count FROM slots WHERE enterprise_id = ? AND date >= date('now')`,
      [id]
    );

    res.json({
      enterprise,
      professions,
      slotsCount: slotsCount.count
    });
  } catch (err) {
    console.error('GetEnterprise error:', err);
    res.status(500).json({ message: 'Ошибка при получении предприятия' });
  }
}

// === Create Enterprise ===
export async function createEnterprise(req, res) {
  try {
    const { name, description, industry, city, address, phone, website, photo_url, latitude, longitude, user_id } = req.body;
    // Если админ передал user_id — используем его, иначе привязываем к текущему пользователю
    const ownerId = (req.user.role === 'admin' && user_id) ? user_id : req.user.id;

    const result = await db.runAsync(
      `INSERT INTO enterprises (name, description, industry, city, address, phone, website, photo_url, latitude, longitude, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, industry, city, address, phone, website, photo_url, latitude, longitude, ownerId]
    );

    res.status(201).json({
      message: 'Предприятие создано',
      enterprise: { id: result.lastID, name, city }
    });
  } catch (err) {
    console.error('CreateEnterprise error:', err);
    res.status(500).json({ message: 'Ошибка при создании предприятия' });
  }
}

// === Update Enterprise ===
export async function updateEnterprise(req, res) {
  try {
    const { id } = req.params;
    const { name, description, industry, city, address, phone, website, photo_url, latitude, longitude, user_id } = req.body;

    // Check permission: admin or the enterprise owner
    if (req.user.role !== 'admin') {
      const enterprise = await db.getAsync('SELECT user_id FROM enterprises WHERE id = ?', [id]);
      if (!enterprise || enterprise.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Нет прав на редактирование' });
      }
    }

    // Для админа можно менять user_id, для enterprise-пользователя — не трогаем
    if (req.user.role === 'admin') {
      const ownerId = user_id || null;
      await db.runAsync(
        `UPDATE enterprises SET name = ?, description = ?, industry = ?, city = ?, address = ?,
         phone = ?, website = ?, photo_url = ?, latitude = ?, longitude = ?, user_id = ? WHERE id = ?`,
        [name, description, industry, city, address, phone, website, photo_url, latitude, longitude, ownerId, id]
      );
    } else {
      await db.runAsync(
        `UPDATE enterprises SET name = ?, description = ?, industry = ?, city = ?, address = ?,
         phone = ?, website = ?, photo_url = ?, latitude = ?, longitude = ? WHERE id = ?`,
        [name, description, industry, city, address, phone, website, photo_url, latitude, longitude, id]
      );
    }

    res.json({ message: 'Предприятие обновлено' });
  } catch (err) {
    console.error('UpdateEnterprise error:', err);
    res.status(500).json({ message: 'Ошибка при обновлении предприятия' });
  }
}

// === Delete Enterprise (Admin) ===
export async function deleteEnterprise(req, res) {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM enterprises WHERE id = ?', [id]);
    res.json({ message: 'Предприятие удалено' });
  } catch (err) {
    console.error('DeleteEnterprise error:', err);
    res.status(500).json({ message: 'Ошибка при удалении предприятия' });
  }
}

// === Get Enterprise Slots ===
export async function getEnterpriseSlots(req, res) {
  try {
    const { id } = req.params;

    const slots = await db.allAsync(
      `SELECT * FROM slots WHERE enterprise_id = ? AND date >= date('now') ORDER BY date, time`,
      [id]
    );

    res.json({ data: slots });
  } catch (err) {
    console.error('GetEnterpriseSlots error:', err);
    res.status(500).json({ message: 'Ошибка при получении слотов' });
  }
}

// === Create Slot ===
export async function createSlot(req, res) {
  try {
    const { id } = req.params;
    const { date, time, max_participants } = req.body;

    const result = await db.runAsync(
      'INSERT INTO slots (enterprise_id, date, time, max_participants) VALUES (?, ?, ?, ?)',
      [id, date, time, max_participants || 10]
    );

    res.status(201).json({
      message: 'Слот создан',
      slot: { id: result.lastID, date, time }
    });
  } catch (err) {
    console.error('CreateSlot error:', err);
    res.status(500).json({ message: 'Ошибка при создании слота' });
  }
}

// === Get Enterprise Bookings ===
export async function getEnterpriseBookings(req, res) {
  try {
    const { id } = req.params;

    const bookings = await db.allAsync(
      `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.city as user_city, s.date, s.time
       FROM bookings b
       INNER JOIN users u ON b.user_id = u.id
       INNER JOIN slots s ON b.slot_id = s.id
       WHERE b.enterprise_id = ?
       ORDER BY s.date DESC, s.time DESC`,
      [id]
    );

    res.json({ data: bookings });
  } catch (err) {
    console.error('GetEnterpriseBookings error:', err);
    res.status(500).json({ message: 'Ошибка при получении записей' });
  }
} 
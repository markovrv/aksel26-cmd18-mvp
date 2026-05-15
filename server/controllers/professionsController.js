// === Professions Controller ===
import db from '../db/index.js';

// === Get All Professions ===
export async function getProfessions(req, res) {
  try {
    const { search, industry, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (industry) {
      whereClause += ' AND industry = ?';
      params.push(industry);
    }

    const total = await db.getAsync(
      `SELECT COUNT(*) as count FROM professions WHERE ${whereClause}`,
      params
    );

    const professions = await db.allAsync(
      `SELECT * FROM professions WHERE ${whereClause} ORDER BY title LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      data: professions,
      total: total.count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error('GetProfessions error:', err);
    res.status(500).json({ message: 'Ошибка при получении профессий' });
  }
}

// === Get Single Profession ===
export async function getProfession(req, res) {
  try {
    const { id } = req.params;

    const profession = await db.getAsync('SELECT * FROM professions WHERE id = ?', [id]);
    if (!profession) {
      return res.status(404).json({ message: 'Профессия не найдена' });
    }

    res.json({ profession });
  } catch (err) {
    console.error('GetProfession error:', err);
    res.status(500).json({ message: 'Ошибка при получении профессии' });
  }
}

// === Get Enterprises by Profession ===
export async function getProfessionEnterprises(req, res) {
  try {
    const { id } = req.params;

    const enterprises = await db.allAsync(
      `SELECT e.* FROM enterprises e
       INNER JOIN enterprise_professions ep ON e.id = ep.enterprise_id
       WHERE ep.profession_id = ?
       ORDER BY e.name`,
      [id]
    );

    res.json({ data: enterprises });
  } catch (err) {
    console.error('GetProfessionEnterprises error:', err);
    res.status(500).json({ message: 'Ошибка при получении предприятий' });
  }
}

// === Create Profession (Admin) ===
export async function createProfession(req, res) {
  try {
    const { title, description, industry, video_url, image_url } = req.body;

    const result = await db.runAsync(
      'INSERT INTO professions (title, description, industry, video_url, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, industry, video_url, image_url]
    );

    res.status(201).json({
      message: 'Профессия создана',
      profession: { id: result.lastID, title, description, industry }
    });
  } catch (err) {
    console.error('CreateProfession error:', err);
    res.status(500).json({ message: 'Ошибка при создании профессии' });
  }
}

// === Update Profession (Admin) ===
export async function updateProfession(req, res) {
  try {
    const { id } = req.params;
    const { title, description, industry, video_url, image_url } = req.body;

    await db.runAsync(
      'UPDATE professions SET title = ?, description = ?, industry = ?, video_url = ?, image_url = ? WHERE id = ?',
      [title, description, industry, video_url, image_url, id]
    );

    res.json({ message: 'Профессия обновлена' });
  } catch (err) {
    console.error('UpdateProfession error:', err);
    res.status(500).json({ message: 'Ошибка при обновлении профессии' });
  }
}

// === Delete Profession (Admin) ===
export async function deleteProfession(req, res) {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM professions WHERE id = ?', [id]);
    res.json({ message: 'Профессия удалена' });
  } catch (err) {
    console.error('DeleteProfession error:', err);
    res.status(500).json({ message: 'Ошибка при удалении профессии' });
  }
}
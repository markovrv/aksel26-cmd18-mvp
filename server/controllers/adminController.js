// === Admin Controller ===
import db from '../db/index.js';
import { loadAiCreds, saveAiCreds } from '../utils/aiCreds.js';
import { loadVkCreds, saveVkCreds } from '../utils/vkCreds.js';

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
    const [users, enterprises, professions, bookings, visited, activeSlots, vacanciesCount, applicationsCount] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM users'),
      db.getAsync('SELECT COUNT(*) as count FROM enterprises'),
      db.getAsync('SELECT COUNT(*) as count FROM professions'),
      db.getAsync('SELECT COUNT(*) as count FROM bookings'),
      db.getAsync("SELECT COUNT(*) as count FROM bookings WHERE status = 'visited'"),
      db.getAsync("SELECT COUNT(*) as count FROM slots WHERE date >= date('now')"),
      db.getAsync('SELECT COUNT(*) as count FROM vacancies'),
      db.getAsync('SELECT COUNT(*) as count FROM vacancy_applications')
    ]);

    res.json({
      stats: {
        users: users.count,
        enterprises: enterprises.count,
        professions: professions.count,
        bookings: bookings.count,
        visited: visited.count,
        activeSlots: activeSlots.count,
        vacancies: vacanciesCount.count,
        applications: applicationsCount.count
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

// === Get AI Credentials ===
export async function getAiCreds(req, res) {
  try {
    const creds = loadAiCreds();
    const maskedKey = creds.AI_API_KEY
      ? creds.AI_API_KEY.slice(0, 4) + '…' + creds.AI_API_KEY.slice(-4)
      : '';
    res.json({
      AI_API_URL: creds.AI_API_URL,
      AI_API_KEY: maskedKey,
      AI_API_MODEL: creds.AI_API_MODEL,
      AI_SYSTEM_PROMPT: creds.AI_SYSTEM_PROMPT
    });
  } catch (err) {
    console.error('GetAiCreds error:', err);
    res.status(500).json({ message: 'Ошибка при получении настроек AI' });
  }
}

// === Update AI Credentials ===
export async function updateAiCreds(req, res) {
  try {
    const { AI_API_URL, AI_API_KEY, AI_API_MODEL, AI_SYSTEM_PROMPT } = req.body;
    const current = loadAiCreds();

    const updated = {
      AI_API_URL: AI_API_URL || current.AI_API_URL,
      AI_API_KEY: AI_API_KEY !== undefined && AI_API_KEY.trim() !== '' ? AI_API_KEY : current.AI_API_KEY,
      AI_API_MODEL: AI_API_MODEL || current.AI_API_MODEL,
      AI_SYSTEM_PROMPT: AI_SYSTEM_PROMPT !== undefined ? AI_SYSTEM_PROMPT : current.AI_SYSTEM_PROMPT
    };

    saveAiCreds(updated);
    res.json({ message: 'Настройки AI сохранены' });
  } catch (err) {
    console.error('UpdateAiCreds error:', err);
    res.status(500).json({ message: 'Ошибка при сохранении настроек AI' });
  }
}

// === Educational Institutions CRUD ===
export async function getEducationalInstitutions(req, res) {
  try {
    const institutions = await db.allAsync(
      `SELECT ei.*,
        (SELECT COUNT(*) FROM profession_educational_institutions WHERE institution_id = ei.id) as profession_count
       FROM educational_institutions ei ORDER BY ei.name`
    );
    res.json({ data: institutions });
  } catch (err) {
    console.error('GetEducationalInstitutions error:', err);
    res.status(500).json({ message: 'Ошибка при получении учебных заведений' });
  }
}

export async function createEducationalInstitution(req, res) {
  try {
    const { name, type, website } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Название и тип обязательны' });
    }

    if (!['вуз', 'колледж', 'техникум'].includes(type)) {
      return res.status(400).json({ message: 'Тип должен быть: вуз, колледж или техникум' });
    }

    const result = await db.runAsync(
      'INSERT INTO educational_institutions (name, type, website) VALUES (?, ?, ?)',
      [name, type, website || null]
    );

    res.status(201).json({
      message: 'Учебное заведение создано',
      institution: { id: result.lastID, name, type }
    });
  } catch (err) {
    console.error('CreateEducationalInstitution error:', err);
    res.status(500).json({ message: 'Ошибка при создании учебного заведения' });
  }
}

export async function deleteEducationalInstitution(req, res) {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM educational_institutions WHERE id = ?', [id]);
    res.json({ message: 'Учебное заведение удалено' });
  } catch (err) {
    console.error('DeleteEducationalInstitution error:', err);
    res.status(500).json({ message: 'Ошибка при удалении учебного заведения' });
  }
}

// === Link / Unlink Institution to Profession ===
export async function linkInstitutionToProfession(req, res) {
  try {
    const { id, instId } = req.params;
    await db.runAsync(
      'INSERT OR IGNORE INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)',
      [id, instId]
    );
    res.json({ message: 'Учебное заведение привязано к профессии' });
  } catch (err) {
    console.error('LinkInstitutionToProfession error:', err);
    res.status(500).json({ message: 'Ошибка при привязке заведения' });
  }
}

export async function unlinkInstitutionFromProfession(req, res) {
  try {
    const { id, instId } = req.params;
    await db.runAsync(
      'DELETE FROM profession_educational_institutions WHERE profession_id = ? AND institution_id = ?',
      [id, instId]
    );
    res.json({ message: 'Учебное заведение отвязано от профессии' });
  } catch (err) {
    console.error('UnlinkInstitutionFromProfession error:', err);
    res.status(500).json({ message: 'Ошибка при отвязке заведения' });
  }
}

// === Get All Applications (Admin) ===
export async function getAllApplications(req, res) {
  try {
    const { enterprise_id, profession_id } = req.query;

    let sql = `SELECT va.id, u.name, u.email, e.name AS enterprise, p.title AS profession, va.created_at
               FROM vacancy_applications va
               JOIN users u ON va.user_id = u.id
               JOIN enterprises e ON va.enterprise_id = e.id
               JOIN professions p ON va.profession_id = p.id`;
    const params = [];
    const conditions = [];

    if (enterprise_id) {
      conditions.push('va.enterprise_id = ?');
      params.push(Number(enterprise_id));
    }
    if (profession_id) {
      conditions.push('va.profession_id = ?');
      params.push(Number(profession_id));
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY va.created_at DESC';

    const applications = await db.allAsync(sql, params);
    res.json({ data: applications });
  } catch (err) {
    console.error('GetAllApplications error:', err);
    res.status(500).json({ message: 'Ошибка при получении откликов' });
  }
}

// === VK Credentials ===
export async function getVkCreds(req, res) {
  try {
    const creds = loadVkCreds();
    const maskedToken = creds.VK_TOKEN
      ? creds.VK_TOKEN.slice(0, 6) + '…' + creds.VK_TOKEN.slice(-4)
      : '';
    res.json({
      VK_ADMIN_ID: creds.VK_ADMIN_ID,
      VK_TOKEN: maskedToken,
      notify_on_new_application: creds.notify_on_new_application,
      notify_on_new_user: creds.notify_on_new_user,
      notify_on_new_booking: creds.notify_on_new_booking
    });
  } catch (err) {
    console.error('GetVkCreds error:', err);
    res.status(500).json({ message: 'Ошибка при получении настроек VK' });
  }
}

export async function updateVkCreds(req, res) {
  try {
    const { VK_ADMIN_ID, VK_TOKEN, notify_on_new_application, notify_on_new_user, notify_on_new_booking } = req.body;
    const current = loadVkCreds();

    const updated = {
      VK_ADMIN_ID: VK_ADMIN_ID !== undefined ? VK_ADMIN_ID : current.VK_ADMIN_ID,
      VK_TOKEN: VK_TOKEN !== undefined && VK_TOKEN.trim() !== '' ? VK_TOKEN : current.VK_TOKEN,
      notify_on_new_application: notify_on_new_application !== undefined ? notify_on_new_application : current.notify_on_new_application,
      notify_on_new_user: notify_on_new_user !== undefined ? notify_on_new_user : current.notify_on_new_user,
      notify_on_new_booking: notify_on_new_booking !== undefined ? notify_on_new_booking : current.notify_on_new_booking
    };

    saveVkCreds(updated);
    res.json({ message: 'Настройки VK сохранены' });
  } catch (err) {
    console.error('UpdateVkCreds error:', err);
    res.status(500).json({ message: 'Ошибка при сохранении настроек VK' });
  }
}

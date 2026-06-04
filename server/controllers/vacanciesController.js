// === Vacancies Controller ===
import db from '../db/index.js';
import { sendVkNotification } from '../utils/vkNotify.js';

// === Get Enterprise Vacancies ===
export async function getEnterpriseVacancies(req, res) {
  try {
    const { id } = req.params;

    const vacancies = await db.allAsync(
      `SELECT v.id, v.profession_id, p.title AS profession_title, v.available_slots, v.created_at
       FROM vacancies v
       JOIN professions p ON v.profession_id = p.id
       WHERE v.enterprise_id = ?
       ORDER BY v.created_at DESC`,
      [id]
    );

    res.json({ data: vacancies });
  } catch (err) {
    console.error('GetEnterpriseVacancies error:', err);
    res.status(500).json({ message: 'Ошибка при получении вакансий' });
  }
}

// === Create Vacancy ===
export async function createVacancy(req, res) {
  try {
    const { id } = req.params;
    const { profession_id, available_slots } = req.body;

    if (!profession_id) {
      return res.status(400).json({ message: 'ID профессии обязателен' });
    }

    const result = await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [id, profession_id, available_slots || 1]
    );

    res.status(201).json({
      message: 'Вакансия создана',
      vacancy: { id: result.lastID }
    });
  } catch (err) {
    console.error('CreateVacancy error:', err);
    res.status(500).json({ message: 'Ошибка при создании вакансии' });
  }
}

// === Upsert Vacancy (создать или обновить количество мест) ===
export async function upsertVacancy(req, res) {
  try {
    const { id } = req.params;
    const { profession_id, available_slots } = req.body;

    if (!profession_id) {
      return res.status(400).json({ message: 'ID профессии обязателен' });
    }

    if (available_slots == null || available_slots < 0 || available_slots > 100) {
      return res.status(400).json({ message: 'Количество мест должно быть от 0 до 100' });
    }

    // Проверяем, существует ли уже вакансия для этой пары
    const existing = await db.getAsync(
      'SELECT id FROM vacancies WHERE enterprise_id = ? AND profession_id = ?',
      [id, profession_id]
    );

    if (available_slots === 0) {
      // Если 0 — удаляем вакансию (мест нет)
      if (existing) {
        await db.runAsync('DELETE FROM vacancies WHERE id = ?', [existing.id]);
        // Удаляем все отклики на эту вакансию
        await db.runAsync(
          'DELETE FROM vacancy_applications WHERE enterprise_id = ? AND profession_id = ?',
          [id, profession_id]
        );
      }
      return res.json({ message: 'Вакансия удалена (мест нет)' });
    }

    if (existing) {
      // Обновляем существующую
      await db.runAsync(
        'UPDATE vacancies SET available_slots = ? WHERE id = ?',
        [available_slots, existing.id]
      );
    } else {
      // Создаём новую
      await db.runAsync(
        'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
        [id, profession_id, available_slots]
      );
    }

    res.json({ message: 'Вакансия сохранена' });
  } catch (err) {
    console.error('UpsertVacancy error:', err);
    res.status(500).json({ message: 'Ошибка при сохранении вакансии' });
  }
}

// === Delete Vacancy ===
export async function deleteVacancy(req, res) {
  try {
    const { vacancyId } = req.params;

    // Check permission: admin or enterprise owner
    if (req.user.role !== 'admin') {
      const vacancy = await db.getAsync(
        `SELECT v.id FROM vacancies v
         JOIN enterprises e ON v.enterprise_id = e.id
         WHERE v.id = ? AND e.user_id = ?`,
        [vacancyId, req.user.id]
      );
      if (!vacancy) {
        return res.status(403).json({ message: 'Нет прав на удаление вакансии' });
      }
    }

    await db.runAsync('DELETE FROM vacancies WHERE id = ?', [vacancyId]);
    res.json({ message: 'Вакансия удалена' });
  } catch (err) {
    console.error('DeleteVacancy error:', err);
    res.status(500).json({ message: 'Ошибка при удалении вакансии' });
  }
}

// === Get Enterprise Applications (for enterprise panel) ===
export async function getEnterpriseApplications(req, res) {
  try {
    const { id } = req.params;

    const applications = await db.allAsync(
      `SELECT va.id, u.name AS user_name, u.email, p.title AS profession_title, va.created_at
       FROM vacancy_applications va
       JOIN users u ON va.user_id = u.id
       JOIN professions p ON va.profession_id = p.id
       WHERE va.enterprise_id = ?
       ORDER BY va.created_at DESC`,
      [id]
    );

    res.json({ data: applications });
  } catch (err) {
    console.error('GetEnterpriseApplications error:', err);
    res.status(500).json({ message: 'Ошибка при получении откликов' });
  }
}

// === Apply to Vacancy ===
export async function applyToVacancy(req, res) {
  try {
    const { vacancyId } = req.params;
    const user_id = req.user.id;

    // Find vacancy with enterprise and profession info
    const vacancy = await db.getAsync(
      `SELECT v.*, e.name AS enterprise_name, p.title AS profession_title
       FROM vacancies v
       JOIN enterprises e ON v.enterprise_id = e.id
       JOIN professions p ON v.profession_id = p.id
       WHERE v.id = ?`,
      [vacancyId]
    );

    if (!vacancy) {
      return res.status(404).json({ message: 'Вакансия не найдена' });
    }

    // Check for duplicate
    const existing = await db.getAsync(
      'SELECT id FROM vacancy_applications WHERE user_id = ? AND enterprise_id = ? AND profession_id = ?',
      [user_id, vacancy.enterprise_id, vacancy.profession_id]
    );

    if (existing) {
      return res.status(409).json({ error: 'Вы уже откликались на эту вакансию' });
    }

    // Create application
    const result = await db.runAsync(
      'INSERT INTO vacancy_applications (user_id, enterprise_id, profession_id) VALUES (?, ?, ?)',
      [user_id, vacancy.enterprise_id, vacancy.profession_id]
    );

    // Send VK notification (non-blocking)
    sendVkNotification('new_application', {
      userName: req.user.name,
      enterpriseName: vacancy.enterprise_name,
      professionTitle: vacancy.profession_title,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Отклик отправлен' });
  } catch (err) {
    console.error('ApplyToVacancy error:', err);
    res.status(500).json({ message: 'Ошибка при отклике на вакансию' });
  }
}

// === Cancel Application (user) ===
export async function cancelApplication(req, res) {
  try {
    const { applicationId } = req.params;
    const user_id = req.user.id;

    const application = await db.getAsync(
      'SELECT * FROM vacancy_applications WHERE id = ?',
      [applicationId]
    );

    if (!application) {
      return res.status(404).json({ message: 'Отклик не найден' });
    }

    // Only the owner or admin can cancel
    if (req.user.role !== 'admin' && application.user_id !== user_id) {
      return res.status(403).json({ message: 'Нет прав на отмену отклика' });
    }

    await db.runAsync('DELETE FROM vacancy_applications WHERE id = ?', [applicationId]);
    res.json({ message: 'Отклик отменён' });
  } catch (err) {
    console.error('CancelApplication error:', err);
    res.status(500).json({ message: 'Ошибка при отмене отклика' });
  }
}

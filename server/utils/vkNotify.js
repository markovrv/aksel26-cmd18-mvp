// === VK Notification Utility ===
import logger from './logger.js';
import { loadVkCreds } from './vkCreds.js';

/**
 * Отправить уведомление в ВК.
 * @param {string} eventType - тип события: 'new_application' | 'new_user' | 'new_booking'
 * @param {object} data - данные для сообщения { userName, enterpriseName, professionTitle, email, date, time }
 */
export async function sendVkNotification(eventType, data = {}) {
  try {
    const creds = loadVkCreds();
    const VK_ADMIN_ID = creds.VK_ADMIN_ID;
    const VK_TOKEN = creds.VK_TOKEN;

    if (!VK_ADMIN_ID || !VK_TOKEN) {
      logger.warn('VK_ADMIN_ID or VK_TOKEN not configured in vk-cred.json, skipping VK notification');
      return;
    }

    // Проверяем, включено ли оповещение для этого события
    const notifyFlag = `notify_on_${eventType}`;
    if (creds[notifyFlag] === false) {
      logger.info(`VK notification for ${eventType} is disabled, skipping`);
      return;
    }

    let message = '';

    switch (eventType) {
      case 'new_application':
        message = [
          '📩 Новый отклик на вакансию!',
          `👤 ФИО: ${data.userName || 'не указан'}`,
          `🏭 Предприятие: ${data.enterpriseName || 'не указано'}`,
          `💼 Профессия: ${data.professionTitle || 'не указана'}`,
          `🕒 Дата: ${data.createdAt || new Date().toISOString()}`
        ].join('\n');
        break;

      case 'new_user':
        message = [
          '👤 Новый пользователь на портале!',
          `📧 Email: ${data.email || 'не указан'}`,
          `👤 Имя: ${data.userName || 'не указано'}`,
          `🕒 Дата регистрации: ${data.createdAt || new Date().toISOString()}`
        ].join('\n');
        break;

      case 'new_booking':
        message = [
          '📅 Новая запись на экскурсию!',
          `👤 Пользователь: ${data.userName || 'не указан'}`,
          `🏭 Предприятие: ${data.enterpriseName || 'не указано'}`,
          `📆 Дата: ${data.date || 'не указана'}`,
          `⏰ Время: ${data.time || 'не указано'}`
        ].join('\n');
        break;

      default:
        logger.warn(`Unknown VK event type: ${eventType}`);
        return;
    }

    const params = new URLSearchParams({
      access_token: VK_TOKEN,
      v: '5.199',
      user_id: VK_ADMIN_ID,
      message: message,
      random_id: Math.floor(Math.random() * 1000000)
    });

    const response = await fetch(`https://api.vk.com/method/messages.send?${params}`, {
      method: 'POST'
    });

    const result = await response.json();

    if (result.error) {
      logger.warn('VK API error:', result.error);
    } else {
      logger.info(`VK notification sent successfully (${eventType})`);
    }
  } catch (err) {
    logger.warn('Failed to send VK notification:', err.message);
  }
}
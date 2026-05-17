// === Shared AI Chat Logic ===
import fetch from 'node-fetch';
import db from '../db/index.js';
import { loadAiCreds } from './aiCreds.js';

const fallbackResponses = [
  'Я пока учусь понимать ваши вопросы. Попробуйте спросить о профессиях или предприятиях Кировской области!',
  'Интересный вопрос! Пока я изучаю возможности портала. Могу помочь с выбором профессии или записью на экскурсию.',
  'Спасибо за обращение! Я готов помочь вам узнать больше о профессиях и предприятиях нашего региона.'
];

/**
 * Собрать контекстную информацию о профессиях, предприятиях и пользователе.
 * @param {number|null} userId - ID пользователя (может быть null)
 * @returns {Promise<string>} - текстовая информация
 */
async function buildContextInfo(userId) {
  const parts = [];

  // Профессии (первые 30)
  try {
    const professions = await db.allAsync(
      'SELECT title, description, industry FROM professions ORDER BY title LIMIT 30'
    );
    if (professions.length > 0) {
      parts.push('=== Профессии на портале ===');
      for (const p of professions) {
        parts.push(`- ${p.title} (${p.industry}): ${p.description || 'нет описания'}`);
      }
    }
  } catch (err) {
    console.error('Failed to load professions for AI context:', err.message);
  }

  // Предприятия (первые 30)
  try {
    const enterprises = await db.allAsync(
      'SELECT name, description, industry, city FROM enterprises ORDER BY name LIMIT 30'
    );
    if (enterprises.length > 0) {
      parts.push('\n=== Предприятия на портале ===');
      for (const e of enterprises) {
        parts.push(`- ${e.name} (${e.industry}, ${e.city}): ${e.description || 'нет описания'}`);
      }
    }
  } catch (err) {
    console.error('Failed to load enterprises for AI context:', err.message);
  }

  // Информация о текущем пользователе
  if (userId) {
    try {
      const user = await db.getAsync('SELECT name, email, role, city FROM users WHERE id = ?', [userId]);
      if (user) {
        parts.push(`\n=== Текущий пользователь ===`);
        parts.push(`Имя: ${user.name}`);
        parts.push(`Email: ${user.email}`);
        parts.push(`Роль: ${user.role}`);
        if (user.city) parts.push(`Город: ${user.city}`);

        // Бронирования пользователя
        const bookings = await db.allAsync(
          `SELECT b.status, s.date, s.time, e.name as enterprise_name
           FROM bookings b
           JOIN slots s ON b.slot_id = s.id
           JOIN enterprises e ON b.enterprise_id = e.id
           WHERE b.user_id = ?
           ORDER BY s.date DESC LIMIT 10`,
          [userId]
        );

        if (bookings.length > 0) {
          parts.push(`\nБронирования пользователя:`);
          for (const b of bookings) {
            parts.push(`- ${b.enterprise_name}: ${b.date} в ${b.time} (${b.status === 'confirmed' ? 'подтверждено' : b.status === 'visited' ? 'посещено' : 'отменено'})`);
          }
        } else {
          parts.push(`\nБронирования: нет`);
        }
      }
    } catch (err) {
      console.error('Failed to load user info for AI context:', err.message);
    }
  }

  return parts.join('\n');
}

/**
 * Вызвать AI API и получить ответ ассистента.
 * @param {Array} history - массив сообщений {role, content}
 * @param {number|null} userId - ID пользователя (для контекста)
 * @returns {Promise<string|null>} - ответ ассистента или null, если AI недоступен
 */
export async function callAiApi(history, userId) {
  const aiCreds = loadAiCreds();
  const AI_API_URL = aiCreds.AI_API_URL;
  const AI_API_KEY = aiCreds.AI_API_KEY;
  const AI_API_MODEL = aiCreds.AI_API_MODEL;

  if (!AI_API_KEY || AI_API_KEY === 'your_key') {
    return null;
  }

  // Собираем контекст и добавляем к системному промпту
  const contextInfo = await buildContextInfo(userId);
  let systemPromptContent = aiCreds.AI_SYSTEM_PROMPT || '';
  if (contextInfo) {
    systemPromptContent += '\n\n## Контекстная информация о портале\n' + contextInfo;
  }

  console.log(systemPromptContent) 
  const systemPrompt = { role: 'system', content: systemPromptContent };
  const messages = [systemPrompt, ...history];

  const aiResponse = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_API_MODEL,
      messages,
      max_tokens: 500
    })
  });

  if (!aiResponse.ok) {
    return null;
  }

  const aiData = await aiResponse.json();
  return aiData.choices?.[0]?.message?.content || null;
}

/**
 * Получить случайный fallback-ответ.
 * @returns {string}
 */
export function getFallbackResponse() {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}
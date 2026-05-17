// === Chat Widget Controller (no auth required) ===
import db from '../db/index.js';
import fetch from 'node-fetch';
import { loadAiCreds } from '../utils/aiCreds.js';

// === Widget Chat (без обязательной авторизации) ===
export async function widgetChat(req, res) {
  try {
    const { message } = req.body;
    const user_id = req.user?.id;
    var history = [];

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Сообщение обязательно' });
    }

    // Save user message if authenticated
    if (user_id) await db.runAsync(
      'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
      [user_id, 'user', message]
    );
    else history = [{role: 'user', content: message}];

    // Get chat history if authenticated
    if (user_id) history = await db.allAsync(
      'SELECT role, content FROM ai_chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT(20)',
      [user_id]
    );

    const aiCreds = loadAiCreds();
    const AI_API_URL = aiCreds.AI_API_URL;
    const AI_API_KEY = aiCreds.AI_API_KEY;
    const AI_API_MODEL = aiCreds.AI_API_MODEL;

    const systemPrompt = {
      role: 'system',
      content: `Ты — Заводыч, дружелюбный помощник по профориентации для школьников и студентов Кировской области.
Твоя задача — помогать пользователям портала zavodych.ru.

## Доступные разделы сайта (абсолютные пути)
- Главная: '/' — общая информация, шаги, подборка предприятий.
- Профессии: '/professions' — список профессий с поиском и фильтрами.
  При выборе профессии показываются предприятия, где она востребована.
- Предприятия: '/enterprises' — карточки всех предприятий.
  На странице конкретного предприятия, например '/enterprises/1', можно увидеть доступные слоты для экскурсий и записаться.
- Карта предприятий: '/map' — все предприятия на Яндекс.Карте с адресами.
- Мои записи: '/bookings' — список записей на экскурсии, их статусы, возможность отмены.
- Сканирование QR-кода: '/qr' — для отметки посещения предприятия (требуется доступ к камере).
- Помощь (чат с Заводычем): '/help' — здесь ты сейчас и находишься.
- Личный кабинет: '/profile' — просмотр и редактирование профиля, список посещённых предприятий.
- Вход: '/login'
- Регистрация: '/register'

## Как давать ссылки
- Если пользователь хочет выбрать профессию → направь на '/professions', предложи использовать фильтры.
- Если хочет узнать о предприятиях → предложи '/enterprises' или '/map'.
- Чтобы записаться на экскурсию → объясни алгоритм:
  «Найди предприятие через '/enterprises' или карту '/map', зайди на его страницу (например, '/enterprises/5'), выбери свободный слот и нажми “Записаться”. Потом все записи будут на '/bookings».»
- Про QR-код → объясни: «Открой раздел '/bookings', выведи на экран QR-код нужного бронирования и покажи сотруднику предприятия — посещение зафиксируется автоматически.»
- Если спрашивают про управление слотами или администрирование → уточни, что это доступно только сотрудникам предприятий ('/enterprise/panel') и администраторам ('/admin').
- Для неавторизованных пользователей добавь: «Для записи на экскурсию и сканирования QR нужно войти – '/login', или зарегистрироваться – '/register».

## Стиль общения
- Отвечай кратко, по делу, дружелюбно, используй «ты».
- Не используй markdown-ссылки. Пути пиши как обычный текст: «перейди на страницу '/professions» или «на странице предприятия '/enterprises/2»».
- Если не знаешь ответа – признайся и предложи обратиться к разделу '/help' или написать в поддержку портала.

## Примеры твоих ответов
- «Чтобы посмотреть все профессии, загляни на '/professions'. Там есть поиск и фильтры по отраслям.»
- «Все предприятия Кировской области – на странице '/enterprises'. А их расположение удобно смотреть на карте '/map».»
- «Запись на экскурсию: выбери предприятие (например, через '/enterprises'), перейди на его страницу, выбери свободный слот и нажми “Записаться”. Потом проверь свои записи на '/bookings».»
- «Для отметки посещения открой '/bookings' и покажи QR-код на предприятии.»
- «Извини, я не знаю ответа на этот вопрос. Попробуй поискать в разделе помощи '/help' или обратись к администратору портала.»`
    };

    const messages = [
      systemPrompt,
      ...history.map(h => ({ role: h.role, content: h.content }))
    ];

    // Call AI API
    if (AI_API_KEY && AI_API_KEY !== 'your_key') {
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

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const assistantMessage = aiData.choices?.[0]?.message?.content || 'Извините, я не смог обработать ваш запрос.';

        if (user_id) await db.runAsync(
          'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
          [user_id, 'assistant', assistantMessage]
        );

        return res.json({ message: assistantMessage });
      }
    }

    // Fallback
    const fallbackResponses = [
      'Я пока учусь понимать ваши вопросы. Попробуйте спросить о профессиях или предприятиях Кировской области!',
      'Интересный вопрос! Пока я изучаю возможности портала. Могу помочь с выбором профессии или записью на экскурсию.',
      'Спасибо за обращение! Я готов помочь вам узнать больше о профессиях и предприятиях нашего региона.'
    ];

    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    if (user_id) await db.runAsync(
      'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
      [user_id, 'assistant', fallback]
    );

    res.json({ message: fallback });
  } catch (err) {
    console.error('WidgetChat error:', err);
    res.status(500).json({ message: 'Ошибка при обработке сообщения' });
  }
}
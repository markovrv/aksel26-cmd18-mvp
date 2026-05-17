// === AI Chat Controller ===
import db from '../db/index.js';
import { callAiApi, getFallbackResponse } from '../utils/aiChat.js';

// === Chat ===
export async function chat(req, res) {
  try {
    const { message } = req.body;
    const user_id = req.user?.id;
    var history = [];

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Сообщение обязательно' });
    }

    // Save user message
    if (user_id) await db.runAsync(
      'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
      [user_id, 'user', message]
    );
    else history = [{role: 'user', content: message}];

    // Get chat history
    if (user_id) history = await db.allAsync(
      'SELECT role, content FROM ai_chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT(20)',
      [user_id]
    );

    // Call AI API with user context
    const assistantMessage = await callAiApi(history, user_id);

    if (assistantMessage) {
      // Save assistant response
      if (user_id) await db.runAsync(
        'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
        [user_id, 'assistant', assistantMessage]
      );

      return res.json({ message: assistantMessage });
    }

    // Fallback response without AI
    const fallback = getFallbackResponse();

    if (user_id) await db.runAsync(
      'INSERT INTO ai_chat_history (user_id, role, content) VALUES (?, ?, ?)',
      [user_id, 'assistant', fallback]
    );

    res.json({ message: fallback });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Ошибка при обработке сообщения' });
  }
}

// === Clear Chat History ===
export async function clearHistory(req, res) {
  try {
    await db.runAsync('DELETE FROM ai_chat_history WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'История чата очищена' });
  } catch (err) {
    console.error('ClearHistory error:', err);
    res.status(500).json({ message: 'Ошибка при очистке истории' });
  }
}
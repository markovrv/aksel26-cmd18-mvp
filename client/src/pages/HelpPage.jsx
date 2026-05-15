// === Help Page (AI Chat) ===
import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export function HelpPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: 1,
      role: 'assistant',
      text: 'Здравствуйте! Меня зовут Заводыч! Я готов помочь вам разобраться в нашем портале. Что вас интересует?'
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.post('/ai/chat', { message: input });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.message
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Извините, произошла ошибка. Попробуйте ещё раз.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Parse assistant messages: convert '/path' into <a href='/path'>path</a>
  function renderMessage(text) {
    const parts = text.split(/'(\/[^']+)'/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const path = part;
        const label = path.replace(/^\//, '').replace(/-/g, ' ');
        return <a key={i} href={path} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{label}</a>;
      }
      return part;
    });
  }

  const handleClear = async () => {
    try {
      await api.delete('/ai/chat/history');
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        text: 'История чата очищена! Чем ещё могу помочь?'
      }]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, height: 'calc(100vh - 100px)' }}>
      {/* Chat Area */}
      <div className="section" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>ИИ-помощник Заводыч</h2>
          <button className="btn secondary small" onClick={handleClear}>
            <Trash2 size={14} />
            Очистить
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 12,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start'
              }}
            >
              {msg.role === 'assistant' && (
                <img
                  src="/assets/person.png"
                  alt="Заводыч"
                  className="botAvatar"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface2)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  lineHeight: 1.5
                }}
              >
                {msg.role === 'assistant' ? renderMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 16, width: 'fit-content' }}>
              Печатает...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Введите вопрос..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 14,
              fontSize: 15
            }}
          />
          <button className="btn primary" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar Help */}
      <div>
        <div className="section">
          <h3>Что я умею</h3>
          <ul style={{ paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.8 }}>
            <li>Подсказать интересные профессии</li>
            <li>Рассказать о предприятиях региона</li>
            <li>Помочь с записью на экскурсию</li>
            <li>Объяснить, как работает QR-код</li>
            <li>Ответить на вопросы о портале</li>
          </ul>
        </div>

        <div className="section" style={{ marginTop: 16 }}>
          <h3>Быстрые вопросы</h3>
          <div className="chips">
            <button className="chip" onClick={() => setInput('Какие профессии самые востребованные?')}>
              Востребованные
            </button>
            <button className="chip" onClick={() => setInput('Как записаться на экскурсию?')}>
              Запись
            </button>
            <button className="chip" onClick={() => setInput('Что такое QR-код?')}>
              QR-код
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
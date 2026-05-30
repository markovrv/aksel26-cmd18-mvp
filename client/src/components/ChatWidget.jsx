// === Floating Chat Widget ===
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { api } from '../api/client';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        role: 'assistant',
        text: 'Здравствуйте! Я Заводыч. Чем могу помочь?'
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Блокируем скролл страницы при открытом чате на мобильных
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.post('/widget/chat', { message: input });
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

  function renderMessage(text) {
    const parts = text.split(/'(\/[^']+)'/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        const label = part.replace(/^\//, '').replace(/-/g, ' ');
        return <a key={i} href={part} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{label}</a>;
      }
      return part;
    });
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-fab ${isOpen ? 'chat-fab-open' : ''}`}
        aria-label="Чат с помощником"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <img
                src="/assets/person.png"
                alt=""
                className="chat-avatar"
                onError={e => { e.target.style.display = 'none' }}
              />
              Заводыч — помощник
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть чат"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src="/assets/person.png"
                    alt=""
                    className="chat-msg-avatar"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
                  {msg.role === 'assistant' ? renderMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-assistant" style={{ width: 'fit-content' }}>
                Печатает...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Введите вопрос..."
              className="chat-input"
            />
            <button
              className="btn primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ padding: '10px 14px', fontSize: 14, borderRadius: 12, flexShrink: 0 }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
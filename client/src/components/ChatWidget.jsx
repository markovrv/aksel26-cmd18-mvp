// === Floating Chat Widget ===
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
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
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(27,107,176,0.4)',
          zIndex: 999,
          transition: 'transform 200ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Чат с помощником"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: 380,
            height: 520,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <img
              src="/assets/person.png"
              alt=""
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none' }}
            />
            Заводыч — помощник
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                {msg.role === 'assistant' && (
                  <img
                    src="/assets/person.png"
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface2)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text)',
                    lineHeight: 1.5,
                    fontSize: 14
                  }}
                >
                  {msg.role === 'assistant' ? renderMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 14, width: 'fit-content', fontSize: 14 }}>
                Печатает...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              background: '#fff'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Введите вопрос..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button
              className="btn primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ padding: '10px 14px', fontSize: 14, borderRadius: 12 }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
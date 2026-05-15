// === Login Page ===
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const { error: showError } = useToastStore();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      showError(err.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 24,
        padding: 40,
        maxWidth: 420,
        width: '100%',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/assets/logo.jpg"
            alt="Заводыч"
            width="72"
            height="72"
            style={{ borderRadius: '50%', marginBottom: 12 }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 24, margin: 0 }}>
            Заводыч
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>Вход в систему</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            className="btn primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
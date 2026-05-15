// === Profile Page ===
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { success, error } = useToastStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      success('Профиль обновлён');
    } catch (err) {
      error(err.message || 'Ошибка при обновлении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Мой профиль</h1>

      <div className="section" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 72, height: 72 }}>
            <User size={32} color="var(--muted)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{user?.name}</h3>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>
              {user?.role === 'user' ? 'Участник' : user?.role === 'enterprise' ? 'Предприятие' : 'Администратор'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ваше имя"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email} disabled style={{ background: 'var(--surface2)' }} />
          </div>

          <div className="form-group">
            <label>Телефон</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 (xxx) xxx-xx-xx"
            />
          </div>

          <div className="form-group">
            <label>Город</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Киров"
            />
          </div>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
}
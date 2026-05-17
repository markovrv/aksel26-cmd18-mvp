// === Admin Page ===
import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, Calendar, Shield, Plus, Edit3, Trash2, X, Bot } from 'lucide-react';
import { api } from '../api/client';
import YandexMapSelector from '../components/YandexMapSelector';
import { useToastStore } from '../store/useToastStore';

const TABS = [
  { key: 'stats', label: 'Статистика', icon: Shield },
  { key: 'users', label: 'Пользователи', icon: Users },
  { key: 'professions', label: 'Профессии', icon: Briefcase },
  { key: 'enterprises', label: 'Предприятия', icon: Building2 },
  { key: 'ai', label: 'AI Ассистент', icon: Bot },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToastStore();

  // Modal state for profession CRUD
  const [showProfModal, setShowProfModal] = useState(false);
  const [editingProf, setEditingProf] = useState(null);
  const [profForm, setProfForm] = useState({ title: '', description: '', industry: '', video_url: '', image_url: '' });

  // Modal state for enterprise CRUD
  const [showEntModal, setShowEntModal] = useState(false);
  const [editingEnt, setEditingEnt] = useState(null);
  const [entForm, setEntForm] = useState({
    name: '', description: '', industry: '', city: '', address: '',
    phone: '', website: '', photo_url: '', latitude: '', longitude: '', user_id: ''
  });
  const [enterpriseUsers, setEnterpriseUsers] = useState([]);

  // AI credentials state
  const [aiCreds, setAiCreds] = useState({ AI_API_URL: '', AI_API_KEY: '', AI_API_MODEL: '' });
  const [aiCredsForm, setAiCredsForm] = useState({ AI_API_URL: '', AI_API_KEY: '', AI_API_MODEL: '' });
  const [aiCredsSaving, setAiCredsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'ai') {
      loadAiCreds();
    }
  }, [activeTab]);

  const loadAiCreds = async () => {
    try {
      const data = await api.get('/admin/ai-creds');
      setAiCreds(data);
      setAiCredsForm({
        AI_API_URL: data.AI_API_URL || '',
        AI_API_KEY: '',
        AI_API_MODEL: data.AI_API_MODEL || ''
      });
    } catch (err) {
      console.error('Failed to load AI creds:', err);
    }
  };

  const handleAiCredsSave = async (e) => {
    e.preventDefault();
    setAiCredsSaving(true);
    try {
      await api.put('/admin/ai-creds', aiCredsForm);
      success('Настройки AI сохранены');
      loadAiCreds();
    } catch (err) {
      error(err.message || 'Ошибка при сохранении настроек AI');
    } finally {
      setAiCredsSaving(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, profsData, entsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=100'),
        api.get('/professions?limit=500'),
        api.get('/enterprises?limit=500')
      ]);
      setStats(statsData.stats);
      setUsers(usersData.data);
      setProfessions(profsData.data);
      setEnterprises(entsData.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await api.put(`/admin/users/${userId}/block`, { is_blocked: !isBlocked });
      success(isBlocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка');
    }
  };

  // Profession CRUD
  const openProfModal = (prof = null) => {
    if (prof) {
      setEditingProf(prof);
      setProfForm({
        title: prof.title || '',
        description: prof.description || '',
        industry: prof.industry || '',
        video_url: prof.video_url || '',
        image_url: prof.image_url || ''
      });
    } else {
      setEditingProf(null);
      setProfForm({ title: '', description: '', industry: '', video_url: '', image_url: '' });
    }
    setShowProfModal(true);
  };

  const handleProfSubmit = async (e) => {
    e.preventDefault();

    // Валидация Видео ВК
    if (profForm.video_url) {
      const videoUrl = profForm.video_url.trim();
      if (!videoUrl.startsWith('https://vkvideo.ru/video_ext.php?')) {
        error('Видео ВК: ссылка должна начинаться с https://vkvideo.ru/video_ext.php?');
        return;
      }
    }

    // Валидация Ссылок на изображения (формат: "ключ":"url","ключ":"url")
    if (profForm.image_url) {
      const imagesStr = profForm.image_url.trim();
      // Проверяем, что строка похожа на валидное JSON-представление объекта
      try {
        const parsed = JSON.parse(`{${imagesStr}}`);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Неверный формат');
        }
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof key !== 'string' || !key) throw new Error('Название не может быть пустым');
          if (typeof val !== 'string' || !val.startsWith('http')) throw new Error(`Значение для "${key}" должно быть URL, начинающимся с http`);
        }
      } catch (validationErr) {
        error(`Ссылки на изображения: неверный формат. Ожидается "название":"url","название":"url". Ошибка: ${validationErr.message}`);
        return;
      }
    }

    try {
      if (editingProf) {
        await api.put(`/professions/${editingProf.id}`, profForm);
        success('Профессия обновлена');
      } else {
        await api.post('/professions', profForm);
        success('Профессия создана');
      }
      setShowProfModal(false);
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при сохранении профессии');
    }
  };

  const handleProfDelete = async (id) => {
    if (!window.confirm('Удалить профессию? Это действие необратимо.')) return;
    try {
      await api.delete(`/professions/${id}`);
      success('Профессия удалена');
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при удалении профессии');
    }
  };

  // Enterprise CRUD
  const loadEnterpriseUsers = async (excludeId = null) => {
    try {
      const params = excludeId ? `?exclude_enterprise_id=${excludeId}` : '';
      const data = await api.get(`/admin/enterprise-users-available${params}`);
      setEnterpriseUsers(data.data);
    } catch (err) {
      console.error('Failed to load enterprise users:', err);
      setEnterpriseUsers([]);
    }
  };

  const openEntModal = async (ent = null) => {
    if (ent) {
      setEditingEnt(ent);
      setEntForm({
        name: ent.name || '',
        description: ent.description || '',
        industry: ent.industry || '',
        city: ent.city || '',
        address: ent.address || '',
        phone: ent.phone || '',
        website: ent.website || '',
        photo_url: ent.photo_url || '',
        latitude: ent.latitude != null ? String(ent.latitude) : '',
        longitude: ent.longitude != null ? String(ent.longitude) : '',
        user_id: ent.user_id != null ? String(ent.user_id) : ''
      });
      // при редактировании передаём exclude_enterprise_id, чтобы при необходимости
      // можно было назначить другого enterprise-пользователя (если текущий уже не подходит)
      await loadEnterpriseUsers(ent.id);
    } else {
      setEditingEnt(null);
      setEntForm({
        name: '', description: '', industry: '', city: '', address: '',
        phone: '', website: '', photo_url: '', latitude: '', longitude: '', user_id: ''
      });
      await loadEnterpriseUsers();
    }
    setShowEntModal(true);
  };

  const handleEntSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...entForm };
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;
      if (!payload.user_id) delete payload.user_id;

      if (editingEnt) {
        await api.put(`/enterprises/${editingEnt.id}`, payload);
        success('Предприятие обновлено');
      } else {
        await api.post('/enterprises', payload);
        success('Предприятие создано');
      }
      setShowEntModal(false);
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при сохранении предприятия');
    }
  };

  const handleEntDelete = async (id) => {
    if (!window.confirm('Удалить предприятие? Это действие необратимо.')) return;
    try {
      await api.delete(`/enterprises/${id}`);
      success('Предприятие удалено');
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при удалении предприятия');
    }
  };

  return (
    <div>
      <h1>Администрирование</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'primary' : 'secondary'} small`}
            onClick={() => setActiveTab(tab.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {/* === Tab: Stats === */}
          {activeTab === 'stats' && (
            <div className="grid-3" style={{ marginBottom: 24 }}>
              <div className="feature">
                <div className="icon"><Users size={22} /></div>
                <h4>{stats?.users || 0}</h4>
                <p>Пользователей</p>
              </div>
              <div className="feature">
                <div className="icon"><Building2 size={22} /></div>
                <h4>{stats?.enterprises || 0}</h4>
                <p>Предприятий</p>
              </div>
              <div className="feature">
                <div className="icon"><Briefcase size={22} /></div>
                <h4>{stats?.professions || 0}</h4>
                <p>Профессий</p>
              </div>
              <div className="feature">
                <div className="icon"><Calendar size={22} /></div>
                <h4>{stats?.bookings || 0}</h4>
                <p>Записей</p>
              </div>
              <div className="feature">
                <div className="icon"><Calendar size={22} /></div>
                <h4>{stats?.visited || 0}</h4>
                <p>Посещено</p>
              </div>
              <div className="feature">
                <div className="icon"><Calendar size={22} /></div>
                <h4>{stats?.activeSlots || 0}</h4>
                <p>Активных слотов</p>
              </div>
            </div>
          )}

          {/* === Tab: Users === */}
          {activeTab === 'users' && (
            <div className="section">
              <h2>Пользователи</h2>
              {users.length === 0 ? (
                <div className="empty-state"><p>Нет пользователей</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 16,
                        background: user.is_blocked ? '#FEE' : 'var(--surface2)',
                        borderRadius: 14
                      }}
                    >
                      <div>
                        <strong>{user.name}</strong>
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{user.email}</span>
                        <div style={{ marginTop: 4 }}>
                          <span className="chip" style={{ fontSize: 12, padding: '4px 8px' }}>
                            {user.role}
                          </span>
                          {user.is_blocked && (
                            <span className="chip" style={{ fontSize: 12, padding: '4px 8px', marginLeft: 4, background: '#F00', color: '#FFF' }}>
                              Заблокирован
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`btn ${user.is_blocked ? 'primary' : 'secondary'} small`}
                        onClick={() => handleBlockUser(user.id, user.is_blocked)}
                      >
                        <Shield size={14} />
                        {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === Tab: Professions === */}
          {activeTab === 'professions' && (
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Профессии</h2>
                <button className="btn primary small" onClick={() => openProfModal(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {professions.length === 0 ? (
                <div className="empty-state"><p>Нет профессий</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {professions.map((prof) => (
                    <div
                      key={prof.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--surface2)',
                        borderRadius: 12,
                        gap: 12
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{prof.title}</strong>
                        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>{prof.industry}</span>
                        {prof.description && (
                          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prof.description}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="btn secondary small" onClick={() => openProfModal(prof)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Edit3 size={14} />
                          Изменить
                        </button>
                        <button className="btn secondary small" onClick={() => handleProfDelete(prof.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C0392B' }}>
                          <Trash2 size={14} />
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === Tab: Enterprises === */}
          {activeTab === 'enterprises' && (
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Предприятия</h2>
                <button className="btn primary small" onClick={() => openEntModal(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {enterprises.length === 0 ? (
                <div className="empty-state"><p>Нет предприятий</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {enterprises.map((ent) => (
                    <div
                      key={ent.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'var(--surface2)',
                        borderRadius: 12,
                        gap: 12
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{ent.name}</strong>
                        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>{ent.industry}</span>
                        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>{ent.city}</span>
                        {ent.user_id && (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--primary)' }}>
                            ID пользователя: {ent.user_id}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button className="btn secondary small" onClick={() => openEntModal(ent)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Edit3 size={14} />
                          Изменить
                        </button>
                        <button className="btn secondary small" onClick={() => handleEntDelete(ent.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C0392B' }}>
                          <Trash2 size={14} />
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === Tab: AI === */}
          {activeTab === 'ai' && (
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Настройки AI ассистента</h2>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: 'var(--surface2)', borderRadius: 14 }}>
                <h4 style={{ marginBottom: 8 }}>Текущие настройки</h4>
                <p style={{ fontSize: 14, margin: '4px 0' }}>
                  <strong>URL:</strong> {aiCreds.AI_API_URL}
                </p>
                <p style={{ fontSize: 14, margin: '4px 0' }}>
                  <strong>Модель:</strong> {aiCreds.AI_API_MODEL}
                </p>
                <p style={{ fontSize: 14, margin: '4px 0' }}>
                  <strong>Ключ:</strong> {aiCreds.AI_API_KEY || 'не указан'}
                </p>
              </div>

              <form onSubmit={handleAiCredsSave}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>API URL</label>
                  <input
                    className="input"
                    value={aiCredsForm.AI_API_URL}
                    onChange={e => setAiCredsForm(prev => ({ ...prev, AI_API_URL: e.target.value }))}
                    placeholder="https://api.openai.com/v1/chat/completions"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>
                    API Ключ {aiCreds.AI_API_KEY ? '(оставьте пустым, чтобы не менять)' : ''}
                  </label>
                  <input
                    className="input"
                    value={aiCredsForm.AI_API_KEY}
                    onChange={e => setAiCredsForm(prev => ({ ...prev, AI_API_KEY: e.target.value }))}
                    placeholder="sk-..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Модель</label>
                  <input
                    className="input"
                    value={aiCredsForm.AI_API_MODEL}
                    onChange={e => setAiCredsForm(prev => ({ ...prev, AI_API_MODEL: e.target.value }))}
                    placeholder="gpt-3.5-turbo"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn primary" disabled={aiCredsSaving}>
                    {aiCredsSaving ? 'Сохранение...' : 'Сохранить настройки'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Modal: Create / Edit Profession */}
      {showProfModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowProfModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 24, padding: 32,
              maxWidth: 480, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {editingProf ? 'Редактировать профессию' : 'Новая профессия'}
              </h3>
              <button
                onClick={() => setShowProfModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Название *</label>
                <input
                  className="input"
                  value={profForm.title}
                  onChange={e => setProfForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Отрасль *</label>
                <input
                  className="input"
                  value={profForm.industry}
                  onChange={e => setProfForm(prev => ({ ...prev, industry: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Описание</label>
                <textarea
                  className="input"
                  value={profForm.description}
                  onChange={e => setProfForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Видео ВК</label>
                <input
                  className="input"
                  value={profForm.video_url}
                  onChange={e => {
                    const raw = e.target.value;
                    // Если вставлен iframe — извлекаем src
                    const match = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                    const value = match ? match[1] : raw;
                    setProfForm(prev => ({ ...prev, video_url: value }));
                  }}
                  placeholder="https://vkvideo.ru/video_ext.php?oid=..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Ссылки на изображения</label>
                <textarea
                  className="input"
                  value={profForm.image_url}
                  onChange={e => setProfForm(prev => ({ ...prev, image_url: e.target.value }))}
                  rows={3}
                  placeholder='"название":"url","название":"url"'
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondary" onClick={() => setShowProfModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary">
                  {editingProf ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Enterprise */}
      {showEntModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowEntModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 24, padding: 32,
              maxWidth: 650, width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {editingEnt ? 'Редактировать предприятие' : 'Новое предприятие'}
              </h3>
              <button
                onClick={() => setShowEntModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEntSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Название *</label>
                <input
                  className="input"
                  value={entForm.name}
                  onChange={e => setEntForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Отрасль *</label>
                <input
                  className="input"
                  value={entForm.industry}
                  onChange={e => setEntForm(prev => ({ ...prev, industry: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Город *</label>
                <input
                  className="input"
                  value={entForm.city}
                  onChange={e => setEntForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Адрес</label>
                <input
                  className="input"
                  value={entForm.address}
                  onChange={e => setEntForm(prev => ({ ...prev, address: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Широта</label>
                  <input
                    className="input"
                    value={entForm.latitude}
                    onChange={e => setEntForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="55.751244"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Долгота</label>
                  <input
                    className="input"
                    value={entForm.longitude}
                    onChange={e => setEntForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="37.618423"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Карта для выбора координат */}
              <YandexMapSelector
                latitude={entForm.latitude ? Number(entForm.latitude) : null}
                longitude={entForm.longitude ? Number(entForm.longitude) : null}
                onCoordsChange={(lat, lng) => setEntForm(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))}
              />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Телефон</label>
                <input
                  className="input"
                  value={entForm.phone}
                  onChange={e => setEntForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Сайт</label>
                <input
                  className="input"
                  value={entForm.website}
                  onChange={e => setEntForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Описание</label>
                <textarea
                  className="input"
                  value={entForm.description}
                  onChange={e => setEntForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Ссылка на фото</label>
                <input
                  className="input"
                  value={entForm.photo_url}
                  onChange={e => setEntForm(prev => ({ ...prev, photo_url: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              {/* Привязка к enterprise-пользователю */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>
                  Ответственный пользователь (enterprise)
                </label>
                <select
                  value={entForm.user_id}
                  onChange={e => setEntForm(prev => ({ ...prev, user_id: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, background: '#fff' }}
                >
                  <option value="">— Не выбран —</option>
                  {enterpriseUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>
                  Выберите пользователя с ролью enterprise, к которому ещё не привязано предприятие.
                  Если таких нет, создайте пользователя с ролью enterprise на вкладке "Пользователи".
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondary" onClick={() => setShowEntModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary">
                  {editingEnt ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// === Admin Page ===
import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, Calendar, Shield, Plus, Edit3, Trash2, X, Bot, GraduationCap, Download, MessageSquare, Link2, Unlink } from 'lucide-react';
import { api } from '../api/client';
import YandexMapSelector from '../components/YandexMapSelector';
import { useToastStore } from '../store/useToastStore';

const TABS = [
  { key: 'stats', label: 'Статистика', icon: Shield },
  { key: 'users', label: 'Пользователи', icon: Users },
  { key: 'professions', label: 'Профессии', icon: Briefcase },
  { key: 'enterprises', label: 'Предприятия', icon: Building2 },
  { key: 'institutions', label: 'Учебные заведения', icon: GraduationCap },
  { key: 'applications', label: 'Отклики', icon: Briefcase },
  { key: 'vk', label: 'Оповещения ВК', icon: MessageSquare },
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

  // Institutions state
  const [institutions, setInstitutions] = useState([]);
  // Enterprise profession linking state
  const [enterpriseProfessionsLink, setEnterpriseProfessionsLink] = useState({ enterprise_id: '', profession_id: '' });
  const [enterpriseProfessionsMap, setEnterpriseProfessionsMap] = useState({});
  // Institution profession linking state
  const [institutionProfessionsMap, setInstitutionProfessionsMap] = useState({});
  const [showInstModal, setShowInstModal] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', type: 'колледж', website: '' });
  const [linkProfessionId, setLinkProfessionId] = useState('');
  const [linkInstitutionId, setLinkInstitutionId] = useState('');

  // Vacancy modal state
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [vacancyData, setVacancyData] = useState({ enterpriseId: '', enterpriseName: '', professionId: '', professionTitle: '', availableSlots: '' });

  // Applications state
  const [allApplications, setAllApplications] = useState([]);
  const [appFilterEnterprise, setAppFilterEnterprise] = useState('');
  const [appFilterProfession, setAppFilterProfession] = useState('');

  // VK credentials state
  const [vkCreds, setVkCreds] = useState({ VK_ADMIN_ID: '', VK_TOKEN: '' });
  const [vkCredsForm, setVkCredsForm] = useState({ VK_ADMIN_ID: '', VK_TOKEN: '' });
  const [vkCredsSaving, setVkCredsSaving] = useState(false);

  // AI credentials state
  const [aiCreds, setAiCreds] = useState({ AI_API_URL: '', AI_API_KEY: '', AI_API_MODEL: '', AI_SYSTEM_PROMPT: '' });
  const [aiCredsForm, setAiCredsForm] = useState({ AI_API_URL: '', AI_API_KEY: '', AI_API_MODEL: '', AI_SYSTEM_PROMPT: '' });
  const [aiCredsSaving, setAiCredsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'ai') {
      loadAiCreds();
    }
    if (activeTab === 'vk') {
      loadVkCreds();
    }
    if (activeTab === 'institutions') {
      loadInstitutionsData();
    }
    if (activeTab === 'applications') {
      loadApplications();
    }
    if (activeTab === 'enterprises') {
      loadEnterpriseProfessionsMap();
    }
  }, [activeTab]);

  const loadEnterpriseProfessionsMap = async () => {
    try {
      const data = await api.get('/admin/enterprises-professions-map');
      setEnterpriseProfessionsMap(data.data || {});
    } catch (err) {
      console.error('Failed to load enterprise professions map:', err);
      setEnterpriseProfessionsMap({});
    }
  };

  const handleLinkEnterpriseProfession = async () => {
    const { enterprise_id, profession_id } = enterpriseProfessionsLink;
    if (!enterprise_id || !profession_id) {
      error('Выберите предприятие и профессию');
      return;
    }
    try {
      await api.post(`/enterprises/${enterprise_id}/professions`, {
        profession_id: parseInt(profession_id)
      });
      success('Профессия привязана к предприятию');
      setEnterpriseProfessionsLink({ enterprise_id: '', profession_id: '' });
      loadEnterpriseProfessionsMap();
    } catch (err) {
      error(err.message || 'Ошибка при привязке');
    }
  };

  const loadInstitutionProfessionsMap = async () => {
    try {
      const data = await api.get('/admin/institutions-professions-map');
      setInstitutionProfessionsMap(data.data || {});
    } catch (err) {
      console.error('Failed to load institution professions map:', err);
      setInstitutionProfessionsMap({});
    }
  };

  const handleUnlinkInstProfession = async (instId, profId, profTitle) => {
    if (!window.confirm(`Отвязать профессию "${profTitle}" от учебного заведения?`)) return;
    try {
      await api.delete(`/admin/professions/${profId}/institutions/${instId}`);
      success('Профессия отвязана');
      loadInstitutionsData();
    } catch (err) {
      error(err.message || 'Ошибка при отвязке');
    }
  };

  const handleUnlinkEnterpriseProfession = async (entId, profId, profTitle) => {
    if (!window.confirm(`Отвязать профессию "${profTitle}" от предприятия?`)) return;
    try {
      await api.delete(`/enterprises/${entId}/professions/${profId}`);
      success('Профессия отвязана');
      loadEnterpriseProfessionsMap();
    } catch (err) {
      error(err.message || 'Ошибка при отвязке');
    }
  };

  const loadAiCreds = async () => {
    try {
      const data = await api.get('/admin/ai-creds');
      setAiCreds(data);
      setAiCredsForm({
        AI_API_URL: data.AI_API_URL || '',
        AI_API_KEY: '',
        AI_API_MODEL: data.AI_API_MODEL || '',
        AI_SYSTEM_PROMPT: data.AI_SYSTEM_PROMPT || ''
      });
    } catch (err) {
      console.error('Failed to load AI creds:', err);
    }
  };

  const loadVkCreds = async () => {
    try {
      const data = await api.get('/admin/vk-creds');
      setVkCreds(data);
      setVkCredsForm({
        VK_ADMIN_ID: data.VK_ADMIN_ID || '',
        VK_TOKEN: '',
        notify_on_new_application: data.notify_on_new_application !== false,
        notify_on_new_user: data.notify_on_new_user !== false,
        notify_on_new_booking: data.notify_on_new_booking !== false
      });
    } catch (err) {
      console.error('Failed to load VK creds:', err);
    }
  };

  const handleVkCredsSave = async (e) => {
    e.preventDefault();
    setVkCredsSaving(true);
    try {
      await api.put('/admin/vk-creds', vkCredsForm);
      success('Настройки VK сохранены');
      loadVkCreds();
    } catch (err) {
      error(err.message || 'Ошибка при сохранении настроек VK');
    } finally {
      setVkCredsSaving(false);
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

  const loadInstitutionsData = async () => {
    try {
      const [instData, mapData] = await Promise.all([
        api.get('/admin/educational-institutions'),
        api.get('/admin/institutions-professions-map')
      ]);
      setInstitutions(instData.data);
      setInstitutionProfessionsMap(mapData.data || {});
    } catch (err) {
      console.error('Failed to load institutions:', err);
    }
  };

  const loadInstitutions = async () => {
    try {
      const data = await api.get('/admin/educational-institutions');
      setInstitutions(data.data);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    }
  };

  const loadApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (appFilterEnterprise) params.append('enterprise_id', appFilterEnterprise);
      if (appFilterProfession) params.append('profession_id', appFilterProfession);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await api.get(`/admin/applications${query}`);
      setAllApplications(data.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
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

  // Institution CRUD
  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/educational-institutions', instForm);
      success('Учебное заведение создано');
      setShowInstModal(false);
      setInstForm({ name: '', type: 'колледж', website: '' });
      loadInstitutionsData();
    } catch (err) {
      error(err.message || 'Ошибка при создании');
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm('Удалить учебное заведение?')) return;
    try {
      await api.delete(`/admin/educational-institutions/${id}`);
      success('Удалено');
      loadInstitutions();
    } catch (err) {
      error(err.message || 'Ошибка при удалении');
    }
  };

  const handleVacancyClick = async () => {
    const { enterprise_id, profession_id } = enterpriseProfessionsLink;
    if (!enterprise_id || !profession_id) {
      error('Выберите предприятие и профессию');
      return;
    }
    const ent = enterprises.find(e => String(e.id) === enterprise_id);
    const prof = professions.find(p => String(p.id) === profession_id);

    // Если профессия ещё не привязана к предприятию — привязываем автоматически
    const linkedProfs = enterpriseProfessionsMap[enterprise_id] || [];
    const alreadyLinked = linkedProfs.some(p => String(p.id) === profession_id);
    if (!alreadyLinked) {
      try {
        await api.post(`/enterprises/${enterprise_id}/professions`, {
          profession_id: parseInt(profession_id)
        });
        await loadEnterpriseProfessionsMap();
      } catch (err) {
        error(err.message || 'Ошибка при привязке профессии');
        return;
      }
    }

    setVacancyData({
      enterpriseId: enterprise_id,
      enterpriseName: ent?.name || '',
      professionId: profession_id,
      professionTitle: prof?.title || '',
      availableSlots: ''
    });
    setShowVacancyModal(true);
  };

  const handleVacancySave = async () => {
    const slots = parseInt(vacancyData.availableSlots, 10);
    if (isNaN(slots) || slots < 0 || slots > 100) {
      error('Количество мест должно быть от 0 до 100');
      return;
    }
    try {
      await api.put(`/enterprises/${vacancyData.enterpriseId}/vacancies`, {
        profession_id: parseInt(vacancyData.professionId),
        available_slots: slots
      });
      success(slots === 0 ? 'Вакансия удалена (мест нет)' : 'Вакансия сохранена');
      setShowVacancyModal(false);
    } catch (err) {
      error(err.message || 'Ошибка при сохранении вакансии');
    }
  };

  const handleLinkInstitution = async () => {
    if (!linkProfessionId || !linkInstitutionId) {
      error('Выберите профессию и заведение');
      return;
    }
    try {
      await api.post(`/admin/professions/${linkProfessionId}/institutions`, {
        institution_id: parseInt(linkInstitutionId)
      });
      success('Заведение привязано к профессии');
      loadInstitutionsData();
    } catch (err) {
      error(err.message || 'Ошибка при привязке');
    }
  };

  // Applications filter and CSV export
  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    }
  }, [appFilterEnterprise, appFilterProfession]);

  const exportCSV = () => {
    const headers = ['ID', 'ФИО', 'Email', 'Предприятие', 'Профессия', 'Дата'];
    const rows = allApplications.map(a => [
      a.id, a.name, a.email, a.enterprise, a.profession,
      new Date(a.created_at).toLocaleDateString('ru-RU')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'otkliky.csv';
    a.click();
    URL.revokeObjectURL(url);
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

    if (profForm.video_url) {
      const videoUrl = profForm.video_url.trim();
      if (!videoUrl.startsWith('https://vkvideo.ru/video_ext.php?')) {
        error('Видео ВК: ссылка должна начинаться с https://vkvideo.ru/video_ext.php?');
        return;
      }
    }

    if (profForm.image_url) {
      const imagesStr = profForm.image_url.trim();
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
        error(`Ссылки на изображения: неверный формат. Ошибка: ${validationErr.message}`);
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
              <div className="feature">
                <div className="icon"><Briefcase size={22} /></div>
                <h4>{stats?.vacancies || 0}</h4>
                <p>Вакансий</p>
              </div>
              <div className="feature">
                <div className="icon"><Briefcase size={22} /></div>
                <h4>{stats?.applications || 0}</h4>
                <p>Откликов</p>
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

              {/* Link profession to enterprise */}
              <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Предприятие</label>
                  <select
                    value={enterpriseProfessionsLink.enterprise_id}
                    onChange={e => setEnterpriseProfessionsLink(prev => ({ ...prev, enterprise_id: e.target.value }))}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">— Выберите —</option>
                    {enterprises.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Профессия</label>
                  <select
                    value={enterpriseProfessionsLink.profession_id}
                    onChange={e => setEnterpriseProfessionsLink(prev => ({ ...prev, profession_id: e.target.value }))}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">— Выберите —</option>
                    {professions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" onClick={handleLinkEnterpriseProfession}>
                    <Link2 size={16} style={{ marginRight: 6 }} />
                    Привязать
                  </button>
                  <button className="btn secondary" onClick={handleVacancyClick} title="Указать вакансии">
                    <Briefcase size={16} style={{ marginRight: 6 }} />
                    Вакансии
                  </button>
                </div>
              </div>

              {enterprises.length === 0 ? (
                <div className="empty-state"><p>Нет предприятий</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {enterprises.map((ent) => {
                    const entProfs = enterpriseProfessionsMap[ent.id] || [];
                    return (
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
                          {/* Привязанные профессии */}
                          {entProfs.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {entProfs.map(p => (
                                <span
                                  key={p.id}
                                  className="chip"
                                  style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                  onClick={() => handleUnlinkEnterpriseProfession(ent.id, p.id, p.title)}
                                  title={`Отвязать "${p.title}"`}
                                >
                                  {p.title}
                                  <Unlink size={10} />
                                </span>
                              ))}
                            </div>
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
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* === Tab: Institutions === */}
          {activeTab === 'institutions' && (
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Учебные заведения</h2>
                <button className="btn primary small" onClick={() => setShowInstModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {/* Link institution to profession */}
              <div style={{ padding: 16, background: 'var(--surface2)', borderRadius: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Профессия</label>
                  <select
                    value={linkProfessionId}
                    onChange={e => setLinkProfessionId(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">— Выберите —</option>
                    {professions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Учебное заведение</label>
                  <select
                    value={linkInstitutionId}
                    onChange={e => setLinkInstitutionId(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">— Выберите —</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <button className="btn primary" onClick={handleLinkInstitution}>Привязать</button>
              </div>

              {institutions.length === 0 ? (
                <div className="empty-state"><p>Нет учебных заведений</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {institutions.map(inst => {
                    const instProfs = institutionProfessionsMap[inst.id] || [];
                    return (
                      <div
                        key={inst.id}
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
                          <strong>{inst.name}</strong>
                          <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>{inst.type}</span>
                          {inst.website && (
                            <span style={{ marginLeft: 8, color: 'var(--primary)', fontSize: 13 }}>{inst.website}</span>
                          )}
                          {/* Привязанные профессии */}
                          {instProfs.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {instProfs.map(p => (
                                <span
                                  key={p.id}
                                  className="chip"
                                  style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                  onClick={() => handleUnlinkInstProfession(inst.id, p.id, p.title)}
                                  title={`Отвязать "${p.title}"`}
                                >
                                  {p.title}
                                  <Unlink size={10} />
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                              Не привязано к профессиям
                            </p>
                          )}
                        </div>
                        <button
                          className="btn secondary small"
                          onClick={() => handleDeleteInstitution(inst.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C0392B' }}
                        >
                          <Trash2 size={14} />
                          Удалить
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* === Tab: Applications === */}
          {activeTab === 'applications' && (
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Отклики на вакансии</h2>
                <button className="btn secondary small" onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Download size={16} />
                  Скачать CSV
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Предприятие</label>
                  <select
                    value={appFilterEnterprise}
                    onChange={e => setAppFilterEnterprise(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">Все</option>
                    {enterprises.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Профессия</label>
                  <select
                    value={appFilterProfession}
                    onChange={e => setAppFilterProfession(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="">Все</option>
                    {professions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {allApplications.length === 0 ? (
                <div className="empty-state"><p>Нет откликов</p></div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {allApplications.map(app => (
                    <div
                      key={app.id}
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
                        <strong>{app.name}</strong>
                        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>{app.email}</span>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                          🏭 {app.enterprise} — 💼 {app.profession}
                        </p>
                      </div>
                      <span style={{ color: 'var(--muted)', fontSize: 12, flexShrink: 0 }}>
                        {new Date(app.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === Tab: VK === */}
          {activeTab === 'vk' && (
            <div className="section">
              <h2>Настройки оповещений ВКонтакте</h2>

              <div style={{ marginBottom: 20, padding: 16, background: 'var(--surface2)', borderRadius: 14 }}>
                <h4 style={{ marginBottom: 8 }}>Текущие настройки</h4>
                <p style={{ fontSize: 14, margin: '4px 0' }}>
                  <strong>ID администратора:</strong> {vkCreds.VK_ADMIN_ID || 'не указан'}
                </p>
                <p style={{ fontSize: 14, margin: '4px 0' }}>
                  <strong>Токен группы:</strong> {vkCreds.VK_TOKEN || 'не указан'}
                </p>
              </div>

              <form onSubmit={handleVkCredsSave}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>ID администратора ВК</label>
                  <input
                    className="input"
                    value={vkCredsForm.VK_ADMIN_ID}
                    onChange={e => setVkCredsForm(prev => ({ ...prev, VK_ADMIN_ID: e.target.value }))}
                    placeholder="123456789"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>
                    Токен сообщества {vkCreds.VK_TOKEN ? '(оставьте пустым, чтобы не менять)' : ''}
                  </label>
                  <input
                    className="input"
                    value={vkCredsForm.VK_TOKEN}
                    onChange={e => setVkCredsForm(prev => ({ ...prev, VK_TOKEN: e.target.value }))}
                    placeholder="vk1.a.xxxxx"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ marginBottom: 12 }}>События для оповещений</h4>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={vkCredsForm.notify_on_new_application}
                        onChange={e => setVkCredsForm(prev => ({ ...prev, notify_on_new_application: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      Новый отклик на вакансию
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={vkCredsForm.notify_on_new_user}
                        onChange={e => setVkCredsForm(prev => ({ ...prev, notify_on_new_user: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      Новый пользователь
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={vkCredsForm.notify_on_new_booking}
                        onChange={e => setVkCredsForm(prev => ({ ...prev, notify_on_new_booking: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      Новая запись на экскурсию
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn primary" disabled={vkCredsSaving}>
                    {vkCredsSaving ? 'Сохранение...' : 'Сохранить настройки'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* === Tab: AI === */}
          {activeTab === 'ai' && (
            <div className="section">
              <h2>Настройки AI ассистента</h2>

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

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Модель</label>
                  <input
                    className="input"
                    value={aiCredsForm.AI_API_MODEL}
                    onChange={e => setAiCredsForm(prev => ({ ...prev, AI_API_MODEL: e.target.value }))}
                    placeholder="gpt-3.5-turbo"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>
                    Системный промпт
                    <span style={{ fontWeight: 400, color: '#888' }}> (инструкция для ассистента)</span>
                  </label>
                  <textarea
                    className="input"
                    value={aiCredsForm.AI_SYSTEM_PROMPT}
                    onChange={e => setAiCredsForm(prev => ({ ...prev, AI_SYSTEM_PROMPT: e.target.value }))}
                    rows={10}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, fontFamily: 'monospace', resize: 'vertical' }}
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

      {/* Modal: Vacancy */}
      {showVacancyModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowVacancyModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 24, padding: 32,
              maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#333' }}>Вакансия</h3>
              <button onClick={() => setShowVacancyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 15, color: '#555', marginBottom: 20 }}>
              Укажите количество вакантных мест на предприятии <strong>{vacancyData.enterpriseName}</strong> в профессии <strong>{vacancyData.professionTitle}</strong>
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Количество мест (0 — мест нет)</label>
              <input
                type="number"
                className="input"
                value={vacancyData.availableSlots}
                onChange={e => setVacancyData(prev => ({ ...prev, availableSlots: e.target.value }))}
                min={0}
                max={100}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn secondary" onClick={() => setShowVacancyModal(false)}>
                Отмена
              </button>
              <button type="button" className="btn primary" onClick={handleVacancySave}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Institution */}
      {showInstModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowInstModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 24, padding: 32,
              maxWidth: 480, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#333' }}>Новое учебное заведение</h3>
              <button onClick={() => setShowInstModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Название *</label>
                <input
                  className="input"
                  value={instForm.name}
                  onChange={e => setInstForm({ ...instForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Тип *</label>
                <select
                  value={instForm.type}
                  onChange={e => setInstForm({ ...instForm, type: e.target.value })}
                  className="select"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, background: '#fff' }}
                >
                  <option value="вуз">ВУЗ</option>
                  <option value="колледж">Колледж</option>
                  <option value="техникум">Техникум</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Сайт (опционально)</label>
                <input
                  className="input"
                  value={instForm.website}
                  onChange={e => setInstForm({ ...instForm, website: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondary" onClick={() => setShowInstModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary">
                  Создать
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
              <button onClick={() => setShowEntModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEntSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Название *</label>
                <input className="input" value={entForm.name} onChange={e => setEntForm(prev => ({ ...prev, name: e.target.value }))} required style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Отрасль *</label>
                <input className="input" value={entForm.industry} onChange={e => setEntForm(prev => ({ ...prev, industry: e.target.value }))} required style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Город *</label>
                <input className="input" value={entForm.city} onChange={e => setEntForm(prev => ({ ...prev, city: e.target.value }))} required style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Адрес</label>
                <input className="input" value={entForm.address} onChange={e => setEntForm(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Широта</label>
                  <input className="input" value={entForm.latitude} onChange={e => setEntForm(prev => ({ ...prev, latitude: e.target.value }))} placeholder="55.751244" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Долгота</label>
                  <input className="input" value={entForm.longitude} onChange={e => setEntForm(prev => ({ ...prev, longitude: e.target.value }))} placeholder="37.618423" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
                </div>
              </div>

              <YandexMapSelector
                latitude={entForm.latitude ? Number(entForm.latitude) : null}
                longitude={entForm.longitude ? Number(entForm.longitude) : null}
                onCoordsChange={(lat, lng) => setEntForm(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))}
              />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Телефон</label>
                <input className="input" value={entForm.phone} onChange={e => setEntForm(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Сайт</label>
                <input className="input" value={entForm.website} onChange={e => setEntForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Описание</label>
                <textarea className="input" value={entForm.description} onChange={e => setEntForm(prev => ({ ...prev, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Ссылка на фото</label>
                <input className="input" value={entForm.photo_url} onChange={e => setEntForm(prev => ({ ...prev, photo_url: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Ответственный пользователь (enterprise)</label>
                <select value={entForm.user_id} onChange={e => setEntForm(prev => ({ ...prev, user_id: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, background: '#fff' }}>
                  <option value="">— Не выбран —</option>
                  {enterpriseUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondary" onClick={() => setShowEntModal(false)}>Отмена</button>
                <button type="submit" className="btn primary">{editingEnt ? 'Сохранить' : 'Создать'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
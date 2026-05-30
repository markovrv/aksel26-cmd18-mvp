// === Enterprise Panel Page ===
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Building2, Edit3, X, Briefcase, List } from 'lucide-react';
import { api } from '../api/client';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';
import YandexMapSelector from '../components/YandexMapSelector';

const TABS = [
  { key: 'slots', label: 'Расписание экскурсий', icon: Calendar },
  { key: 'bookings', label: 'Записи на экскурсии', icon: Users },
  { key: 'vacancies', label: 'Вакансии', icon: Briefcase },
  { key: 'applications', label: 'Отклики', icon: List },
];

export function EnterprisePanelPage() {
  const { user } = useAuthStore();
  const { success, error } = useToastStore();
  const [activeTab, setActiveTab] = useState('slots');
  const [enterprise, setEnterprise] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [linkedProfessions, setLinkedProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', max_participants: 10 });
  const [showAddVacancy, setShowAddVacancy] = useState(false);
  const [newVacancy, setNewVacancy] = useState({ profession_id: '', available_slots: 1 });

  // Modal state for editing enterprise
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', description: '', industry: '', city: '', address: '',
    phone: '', website: '', photo_url: '', latitude: '', longitude: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get enterprise owned by this user
      const enterprises = await api.get('/enterprises?limit=100');
      const myEnterprise = enterprises.data.find(e => e.user_id === user?.id);
      if (myEnterprise) {
        setEnterprise(myEnterprise);
        const [slotsData, bookingsData, vacanciesData, applicationsData] = await Promise.all([
          api.get(`/enterprises/${myEnterprise.id}/slots`),
          api.get(`/enterprises/${myEnterprise.id}/bookings`),
          api.get(`/enterprises/${myEnterprise.id}/vacancies`),
          api.get(`/enterprises/${myEnterprise.id}/applications`)
        ]);
        setSlots(slotsData.data);
        setBookings(bookingsData.data);
        setVacancies(vacanciesData.data);
        setApplications(applicationsData.data);

        // Load professions linked to this enterprise
        const entDetail = await api.get(`/enterprises/${myEnterprise.id}`);
        setLinkedProfessions(entDetail.professions || []);
      }
    } catch (err) {
      console.error('Failed to load enterprise data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.time) {
      error('Заполните дату и время');
      return;
    }

    try {
      await api.post(`/enterprises/${enterprise.id}/slots`, newSlot);
      success('Слот добавлен');
      setShowAddSlot(false);
      setNewSlot({ date: '', time: '', max_participants: 10 });
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при добавлении слота');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      success('Слот удалён');
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при удалении');
    }
  };

  const handleAddVacancy = async () => {
    if (!newVacancy.profession_id) {
      error('Выберите профессию');
      return;
    }

    try {
      await api.post(`/enterprises/${enterprise.id}/vacancies`, newVacancy);
      success('Вакансия добавлена');
      setShowAddVacancy(false);
      setNewVacancy({ profession_id: '', available_slots: 1 });
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при добавлении вакансии');
    }
  };

  const handleDeleteVacancy = async (vacancyId) => {
    if (!window.confirm('Удалить вакансию?')) return;
    try {
      await api.delete(`/vacancies/${vacancyId}`);
      success('Вакансия удалена');
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при удалении');
    }
  };

  // Edit enterprise
  const openEditModal = () => {
    if (!enterprise) return;
    setEditForm({
      name: enterprise.name || '',
      description: enterprise.description || '',
      industry: enterprise.industry || '',
      city: enterprise.city || '',
      address: enterprise.address || '',
      phone: enterprise.phone || '',
      website: enterprise.website || '',
      photo_url: enterprise.photo_url || '',
      latitude: enterprise.latitude != null ? String(enterprise.latitude) : '',
      longitude: enterprise.longitude != null ? String(enterprise.longitude) : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;

      await api.put(`/enterprises/${enterprise.id}`, payload);
      success('Профиль предприятия обновлён');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      error(err.message || 'Ошибка при сохранении');
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (!enterprise) {
    return (
      <div className="empty-state">
        <Building2 size={64} />
        <h3>Предприятие не найдено</h3>
        <p>Свяжитесь с администратором для настройки</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Панель управления</h1>
      <p className="sub" style={{ marginBottom: 24 }}>{enterprise.name}</p>

      {/* Tabs + Edit button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', alignItems: 'center' }}>
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
        <div style={{ flex: 1 }} />
        <button
          className="btn secondary small"
          onClick={openEditModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Edit3 size={16} />
          Изменить профиль
        </button>
      </div>

      {/* === Tab: Slots === */}
      {activeTab === 'slots' && (
        <div className="section" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Расписание экскурсий</h2>
            <button className="btn primary small" onClick={() => setShowAddSlot(!showAddSlot)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} />
              Добавить слот
            </button>
          </div>

          {showAddSlot && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              padding: 16,
              background: 'var(--surface2)',
              borderRadius: 14,
              marginBottom: 16
            }}>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                className="select"
              />
              <input
                type="time"
                value={newSlot.time}
                onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                className="select"
              />
              <input
                type="number"
                value={newSlot.max_participants}
                onChange={(e) => setNewSlot({ ...newSlot, max_participants: parseInt(e.target.value) || 10 })}
                min={1}
                max={50}
                className="select"
                placeholder="Макс. участников"
              />
              <button className="btn primary" onClick={handleAddSlot}>Добавить</button>
            </div>
          )}

          {slots.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Нет запланированных экскурсий</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--surface2)',
                    borderRadius: 14
                  }}
                >
                  <div>
                    <strong>{slot.date}</strong> в {slot.time}
                    <span style={{ color: 'var(--muted)', marginLeft: 16, fontSize: 13 }}>
                      <Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      {slot.booked_count}/{slot.max_participants}
                    </span>
                  </div>
                  <button
                    className="btn secondary small"
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === Tab: Bookings === */}
      {activeTab === 'bookings' && (
        <div className="section">
          <h2>Записи на экскурсии</h2>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>Пока нет записей</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 16,
                        background: 'var(--surface2)',
                        borderRadius: 14
                      }}
                    >
                      <div>
                        <strong>{booking.user_name}</strong>
                        <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{booking.user_email}</span>
                        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>
                          <span>📞 {booking.user_phone || 'не указан'}</span>
                          <span> · </span>
                          <span>📍 {booking.user_city || 'не указан'}</span>
                        </div>
                      </div>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {booking.date} {booking.time}
                      </span>
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}

      {/* === Tab: Vacancies === */}
      {activeTab === 'vacancies' && (
        <div className="section" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Вакансии предприятия</h2>
            <button className="btn primary small" onClick={() => setShowAddVacancy(!showAddVacancy)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} />
              Добавить вакансию
            </button>
          </div>

          {showAddVacancy && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr auto',
              gap: 12,
              padding: 16,
              background: 'var(--surface2)',
              borderRadius: 14,
              marginBottom: 16,
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Профессия</label>
                <select
                  value={newVacancy.profession_id}
                  onChange={(e) => setNewVacancy({ ...newVacancy, profession_id: e.target.value })}
                  className="select"
                  style={{ width: '100%' }}
                >
                  <option value="">— Выберите —</option>
                  {linkedProfessions.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--muted)' }}>Количество мест</label>
                <input
                  type="number"
                  value={newVacancy.available_slots}
                  onChange={(e) => setNewVacancy({ ...newVacancy, available_slots: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="select"
                  style={{ width: '100%' }}
                />
              </div>
              <button className="btn primary" onClick={handleAddVacancy} style={{ alignSelf: 'end' }}>Добавить</button>
            </div>
          )}

          {vacancies.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} />
              <p>Нет открытых вакансий</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {vacancies.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--surface2)',
                    borderRadius: 14
                  }}
                >
                  <div>
                    <strong>{v.profession_title}</strong>
                    <span style={{ color: 'var(--muted)', marginLeft: 16, fontSize: 13 }}>
                      {v.available_slots} мест
                    </span>
                    <span style={{ color: 'var(--muted)', marginLeft: 12, fontSize: 12 }}>
                      от {new Date(v.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <button
                    className="btn secondary small"
                    onClick={() => handleDeleteVacancy(v.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === Tab: Applications (отклики) === */}
      {activeTab === 'applications' && (
        <div className="section">
          <h2>Отклики на вакансии</h2>

          {applications.length === 0 ? (
            <div className="empty-state">
              <List size={48} />
              <p>Пока нет откликов</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--surface2)',
                    borderRadius: 14
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff' }}>{app.user_name}</strong>
                    <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{app.email}</span>
                    <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>
                      💼 {app.profession_title}
                    </div>
                  </div>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {new Date(app.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Edit Enterprise Profile */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowEditModal(false)}
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
                Редактировать профиль предприятия
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Название *</label>
                <input
                  className="input"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Отрасль *</label>
                <input
                  className="input"
                  value={editForm.industry}
                  onChange={e => setEditForm(prev => ({ ...prev, industry: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Город *</label>
                <input
                  className="input"
                  value={editForm.city}
                  onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Адрес</label>
                <input
                  className="input"
                  value={editForm.address}
                  onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Широта</label>
                  <input
                    className="input"
                    value={editForm.latitude}
                    onChange={e => setEditForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="55.751244"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Долгота</label>
                  <input
                    className="input"
                    value={editForm.longitude}
                    onChange={e => setEditForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="37.618423"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                  />
                </div>
              </div>

              <YandexMapSelector
                latitude={editForm.latitude ? Number(editForm.latitude) : null}
                longitude={editForm.longitude ? Number(editForm.longitude) : null}
                onCoordsChange={(lat, lng) => setEditForm(prev => ({ ...prev, latitude: String(lat), longitude: String(lng) }))}
              />

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Телефон</label>
                <input
                  className="input"
                  value={editForm.phone}
                  onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Сайт</label>
                <input
                  className="input"
                  value={editForm.website}
                  onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Описание</label>
                <textarea
                  className="input"
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14, resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>Ссылка на фото</label>
                <input
                  className="input"
                  value={editForm.photo_url}
                  onChange={e => setEditForm(prev => ({ ...prev, photo_url: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn secondary" onClick={() => setShowEditModal(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn primary">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
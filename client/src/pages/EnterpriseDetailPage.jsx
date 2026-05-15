// === Enterprise Detail Page ===
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, Calendar, Users } from 'lucide-react';
import { api } from '../api/client';
import { useToastStore } from '../store/useToastStore';
import { useAuthStore } from '../store/useAuthStore';

export function EnterpriseDetailPage() {
  const { id } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [professions, setProfessions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  const { success, error } = useToastStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await api.get(`/enterprises/${id}`);
      setEnterprise(data.enterprise);
      setProfessions(data.professions || []);
      setSlots(data.slotsCount > 0 ? [] : []); // We don't load all slots on detail page
    } catch (err) {
      console.error('Failed to load enterprise:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      const data = await api.get(`/enterprises/${id}/slots`);
      setSlots(data.data);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    if (user) {
      loadMyBookings();
    }
  }, [user]);

  const loadMyBookings = async () => {
    try {
      const data = await api.get('/bookings/my');
      setUserBookings(data.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const handleBooking = async (slotId) => {
    if (!user) {
      error('Для записи необходимо авторизоваться');
      return;
    }

    setBookingInProgress(slotId);
    try {
      await api.post('/bookings', { slot_id: slotId, enterprise_id: parseInt(id) });
      success('Вы успешно записались на экскурсию!');
      loadSlots();
      loadMyBookings();
    } catch (err) {
      error(err.message || 'Ошибка при записи');
    } finally {
      setBookingInProgress(null);
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (!enterprise) {
    return <div className="empty-state"><h3>Предприятие не найдено</h3></div>;
  }

  return (
    <div>
      <Link to="/enterprises" className="btn secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} />
        Назад к предприятиям
      </Link>

      <div className="section" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 20 }}>
          <div>
            <span className="badge" style={{ marginBottom: 12 }}>{enterprise.industry}</span>
            <h1>{enterprise.name}</h1>
            <p className="meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} />
              {enterprise.city}, {enterprise.address}
            </p>
            <p className="lead" style={{ marginTop: 12 }}>{enterprise.description}</p>

            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {enterprise.phone && (
                <a href={`tel:${enterprise.phone}`} className="btn secondary small">
                  <Phone size={14} />
                  {enterprise.phone}
                </a>
              )}
              {enterprise.website && (
                <a href={enterprise.website} target="_blank" rel="noopener noreferrer" className="btn secondary small">
                  <Globe size={14} />
                  Сайт
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professions */}
      {professions.length > 0 && (
        <div className="section" style={{ marginBottom: 24 }}>
          <h3>Профессии на предприятии</h3>
          <div className="chips" style={{ marginTop: 12 }}>
            {professions.map((p) => (
              <Link key={p.id} to={`/professions/${p.id}`} className="chip">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Slots */}
      <div className="section">
        <h2>Доступные экскурсии</h2>
        <p className="sub" style={{ marginBottom: 16 }}>Запишитесь на бесплатную экскурсию</p>

        <button onClick={loadSlots} className="btn secondary" style={{ marginBottom: 16 }}>
          <Calendar size={16} />
          Показать расписание
        </button>

        {slots.length === 0 ? (
          <div className="empty-state">
            <p>Нажмите кнопку выше, чтобы загрузить расписание</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {slots.map((slot) => {
              const isFull = slot.booked_count >= slot.max_participants;
              const isBooked = userBookings.some(b => b.slot_id === slot.id);

              return (
                <div
                  key={slot.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: 'var(--surface2)',
                    borderRadius: 14,
                    gap: 16
                  }}
                >
                  <div>
                    <strong>{slot.date}</strong> в {slot.time}
                    <span style={{ color: 'var(--muted)', marginLeft: 12, fontSize: 13 }}>
                      <Users size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      {slot.booked_count}/{slot.max_participants}
                    </span>
                  </div>

                  {isFull ? (
                    <button className="btn no-slots" disabled>Нет мест</button>
                  ) : isBooked ? (
                    <button className="btn booked">Вы записаны</button>
                  ) : (
                    <button
                      className="btn primary"
                      onClick={() => handleBooking(slot.id)}
                      disabled={bookingInProgress === slot.id}
                    >
                      {bookingInProgress === slot.id ? 'Запись...' : 'Записаться'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
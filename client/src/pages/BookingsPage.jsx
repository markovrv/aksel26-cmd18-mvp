// === Bookings Page ===
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, QrCode, CheckCircle, XCircle } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import { api } from '../api/client';
import { useToastStore } from '../store/useToastStore';

export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQr, setExpandedQr] = useState(null);
  const { success, error } = useToastStore();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.get('/bookings/my');
      setBookings(data.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      success('Запись отменена');
      loadBookings();
    } catch (err) {
      error(err.message || 'Ошибка при отмене');
    }
  };

  const getStatusBadge = (status, isScanned) => {
    if (status === 'visited') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--success)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 12
        }}>
          <CheckCircle size={12} />
          Посещено
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: '#C0392B', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 12
        }}>
          <XCircle size={12} />
          Отменено
        </span>
      );
    }
    if (isScanned) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 12
        }}>
          <QrCode size={12} />
          QR отсканирован
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'var(--warning)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 12
      }}>
        <Calendar size={12} />
        Записано
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      success('Токен скопирован');
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      success('Токен скопирован');
    });
  };

  // Текущая booking с раскрытым QR
  const activeBooking = expandedQr ? bookings.find(b => b.id === expandedQr) : null;

  return (
    <div>
      <h1>Мои записи</h1>

      {/* Модальное окно с QR-кодом */}
      {activeBooking && activeBooking.qr_token && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setExpandedQr(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 32,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              maxWidth: 320,
              width: '90%'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: '#333' }}>
              {activeBooking.enterprise_name}
            </h3>
            <QRCode
              value={activeBooking.qr_token}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              qrStyle="squares"
            />
            <p style={{ fontSize: 13, color: '#888', marginTop: 16, marginBottom: 0 }}>
              Покажите этот код на входе
            </p>
            <button
              className="btn secondary"
              style={{ marginTop: 16 }}
              onClick={() => setExpandedQr(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>Нет записей</h3>
          <p>Запишитесь на экскурсию, чтобы увидеть её здесь</p>
        </div>
      ) : (
        <div className="section">
          <div style={{ display: 'grid', gap: 16 }}>
            {bookings.map((booking) => (
              <div key={booking.id}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 16,
                    padding: 20,
                    background: 'var(--surface2)',
                    borderRadius: 16,
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 8px' }}>{booking.enterprise_name}</h3>
                    <p className="meta" style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} />
                      {booking.city}
                    </p>
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                      {booking.date} в {booking.time}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {getStatusBadge(booking.status, booking.is_scanned)}
                    {booking.status === 'confirmed' && (
                      <button
                        className="btn secondary small"
                        onClick={() => handleCancel(booking.id)}
                      >
                        Отменить
                      </button>
                    )}
                    {booking.qr_token && booking.status === 'confirmed' && (
                      <button
                        className="btn secondary small"
                        onClick={() => setExpandedQr(booking.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <QrCode size={16} />
                        QR-код
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
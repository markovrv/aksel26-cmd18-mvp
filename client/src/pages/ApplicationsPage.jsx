// === Applications Page (My Applications) ===
import React, { useState, useEffect } from 'react';
import { Briefcase, X } from 'lucide-react';
import { api } from '../api/client';
import { useToastStore } from '../store/useToastStore';

export function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelInProgress, setCancelInProgress] = useState(null);
  const { success, error } = useToastStore();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.get('/profile/applications');
      setApplications(data.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('Отменить отклик?')) return;
    setCancelInProgress(applicationId);
    try {
      await api.delete(`/profile/applications/${applicationId}`);
      success('Отклик отменён');
      loadApplications();
    } catch (err) {
      error(err.message || 'Ошибка при отмене');
    } finally {
      setCancelInProgress(null);
    }
  };

  return (
    <div>
      <h1>
        <Briefcase size={24} style={{ verticalAlign: 'middle', marginRight: 10 }} />
        Мои отклики
      </h1>

      {loading ? (
        <div className="spinner" />
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={64} />
          <h3>Нет откликов</h3>
          <p>Вы ещё не откликались на вакансии</p>
        </div>
      ) : (
        <div className="section">
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {applications.map(app => (
              <div
                key={app.id}
                style={{
                  padding: 16,
                  background: 'var(--surface2)',
                  borderRadius: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div>
                  <strong>{app.enterprise_name}</strong>
                  <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                    — {app.profession_title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {new Date(app.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <button
                    className="btn secondary small"
                    onClick={() => handleCancelApplication(app.id)}
                    disabled={cancelInProgress === app.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px' }}
                  >
                    <X size={14} />
                    Отменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
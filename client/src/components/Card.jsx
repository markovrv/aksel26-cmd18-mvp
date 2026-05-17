// === Card Component ===
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

export function EnterpriseCard({ enterprise, showVisited = false, isVisited = false }) {
  const imageUrl = enterprise.photo_url || null;

  return (
    <div className="card">
      <div
        className="card-img"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {enterprise.slot_count > 0 && (
          <span className="badge">Есть экскурсии</span>
        )}
        {isVisited && showVisited && (
          <div className="visited-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>
      <div className="card-body">
        <h3>{enterprise.name}</h3>
        <p className="meta">
          <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          {enterprise.city}
        </p>
        <p className="desc">{enterprise.description}</p>
        <div className="card-footer">
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>
            {enterprise.industry}
          </span>
          <Link to={`/enterprises/${enterprise.id}`} className="btn primary small">
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProfessionCard({ profession }) {
  // Извлекаем первое изображение из image_url (формат: "название":"url","название":"url")
  const firstImage = React.useMemo(() => {
    if (!profession?.image_url) return null;
    try {
      const parsed = JSON.parse(`{${profession.image_url}}`);
      const entries = Object.entries(parsed);
      return entries.length > 0 ? entries[0][1] : null;
    } catch {
      return null;
    }
  }, [profession?.image_url]);

  return (
    <div className="card">
      <div
        className="card-img"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: firstImage ? `url(${firstImage}) center / cover no-repeat` : undefined
        }}
      >
        <span className="badge">{profession.industry}</span>
      </div>
      <div className="card-body">
        <h3>{profession.title}</h3>
        <p className="desc">{profession.description}</p>
        <div className="card-footer">
          <Link to={`/professions/${profession.id}`} className="btn primary small">
            Найти предприятия
          </Link>
        </div>
      </div>
    </div>
  );
}
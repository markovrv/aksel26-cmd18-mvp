// === Profession Detail Page ===
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { api } from '../api/client';
import { EnterpriseCard } from '../components/Card';

export function ProfessionDetailPage() {
  const { id } = useParams();
  const [profession, setProfession] = useState(null);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [profData, entData] = await Promise.all([
        api.get(`/professions/${id}`),
        api.get(`/professions/${id}/enterprises`)
      ]);
      setProfession(profData.profession);
      setEnterprises(entData.data);
    } catch (err) {
      console.error('Failed to load profession:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  if (!profession) {
    return <div className="empty-state"><h3>Профессия не найдена</h3></div>;
  }

  return (
    <div>
      <Link to="/professions" className="btn secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} />
        Назад к профессиям
      </Link>

      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span className="badge" style={{ fontSize: 14 }}>{profession.industry}</span>
        </div>
        <h1>{profession.title}</h1>
        <p className="lead">{profession.description}</p>

        {profession.video_url && (
          <a
            href={profession.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
            style={{ marginTop: 16 }}
          >
            <Play size={16} />
            Смотреть видео-визитку
          </a>
        )}
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <h2>Где работают такие специалисты</h2>
        <p className="sub" style={{ marginBottom: 16 }}>Предприятия Кировской области</p>

        {enterprises.length === 0 ? (
          <div className="empty-state">
            <p>Пока нет данных о предприятиях</p>
          </div>
        ) : (
          <div className="cards">
            {enterprises.map((ent) => (
              <EnterpriseCard key={ent.id} enterprise={ent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
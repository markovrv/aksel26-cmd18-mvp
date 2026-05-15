// === Home Page ===
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/client';
import { EnterpriseCard } from '../components/Card';
import { useState, useEffect } from 'react';
import { Rocket, Target, Users, ChevronRight } from 'lucide-react';

export function HomePage() {
  const { user } = useAuthStore();
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    try {
      const data = await api.get('/enterprises?limit=6');
      setEnterprises(data.data);
    } catch (err) {
      console.error('Failed to load enterprises:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">
              <Rocket size={16} />
              Платформа профориентации
            </div>
            <h1>Открой мир профессий в Кировской области</h1>
            <p className="lead1">
              Выбери профессию, найди предприятие и запишись на экскурсию — всё в одном месте
            </p>
            <div className="hero-actions">
              <Link to="/professions" className="btn primary">
                Выбрать профессию
              </Link>
              <Link to="/enterprises" className="btn secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                Смотреть предприятия
              </Link>
            </div>
          </div>
        </div>

        {/* Character */}
        <img
          src="/assets/person.png"
          alt="Заводыч"
          className="hero-character"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Steps Card */}
      <div className="section" style={{ marginBottom: 24 }}>
        <h2>Как это работает</h2>
        <div className="hero-card" style={{ marginTop: 16 }}>
          <div className="step">
            <div className="step-num">1</div>
            <div>
              <b>Выбери профессию</b>
              <span>Просмотри видео-визитки и узнай больше о профессиях</span>
            </div>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <div>
              <b>Найди предприятие</b>
              <span>Посмотри, какие компании работают в твоём регионе</span>
            </div>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <div>
              <b>Запишись на экскурсию</b>
              <span>Выбери удобную дату и время, мы вышлем QR-код</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="section" style={{ marginBottom: 24 }}>
        <h2>Возможности платформы</h2>
        <div className="grid-3" style={{ marginTop: 16 }}>
          <div className="feature">
            <div className="icon">
              <Target size={24} />
            </div>
            <h4>Профориентация</h4>
            <p>Узнай о профессиях будущего и востребованных специальностях в регионе</p>
          </div>
          <div className="feature">
            <div className="icon">
              <Users size={24} />
            </div>
            <h4>Экскурсии</h4>
            <p>Бесплатные экскурсии на реальные предприятия с возможностью попробовать себя в деле</p>
          </div>
          <div className="feature">
            <div className="icon">
              <Rocket size={24} />
            </div>
            <h4>ИИ-помощник</h4>
            <p>Заводыч поможет разобраться в профессиях и подскажет, что выбрать</p>
          </div>
        </div>
      </div>

      {/* Enterprises */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Предприятия региона</h2>
            <p className="sub">Ведущие компании Кировской области</p>
          </div>
          <Link to="/enterprises" className="btn secondary">
            Все предприятия
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="spinner" />
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
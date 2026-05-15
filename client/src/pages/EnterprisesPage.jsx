// === Enterprises Page ===
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import { EnterpriseCard } from '../components/Card';

export function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadEnterprises();
  }, [industry, city]);

  const loadEnterprises = async () => {
    try {
      let url = '/enterprises?limit=50';
      if (industry) url += `&industry=${encodeURIComponent(industry)}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;
      const data = await api.get(url);
      setEnterprises(data.data);
    } catch (err) {
      console.error('Failed to load enterprises:', err);
    } finally {
      setLoading(false);
    }
  };

  const industries = ['Косметика', 'Пластик', 'Машиностроение', 'Пищевая промышленность', 'IT и связь', 'Металлургия'];
  const cities = ['Киров', 'Кирово-Чепецк', 'Слободской'];

  return (
    <div>
      <div className="topbar">
        <div className="search">
          <Search size={20} color="var(--muted)" />
          <input
            type="text"
            placeholder="Поиск предприятий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        <select className="select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">Все отрасли</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
        <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Все города</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Предприятия</h2>
          <p className="sub">Компании Кировской области</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : enterprises.length === 0 ? (
          <div className="empty-state">
            <h3>Ничего не найдено</h3>
            <p>Попробуй изменить параметры поиска</p>
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
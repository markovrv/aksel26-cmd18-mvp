// === Professions Page ===
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import { ProfessionCard } from '../components/Card';

export function ProfessionsPage() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    loadProfessions();
  }, [search, industry]);

  const loadProfessions = async () => {
    try {
      let url = '/professions?limit=50';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (industry) url += `&industry=${encodeURIComponent(industry)}`;
      const data = await api.get(url);
      setProfessions(data.data);
    } catch (err) {
      console.error('Failed to load professions:', err);
    } finally {
      setLoading(false);
    }
  };

  const industries = ['Производство', 'Энергетика', 'Химическая', 'Биотехнологии', 'IT', 'Торговля', 'Маркетинг', 'Финансы', 'Логистика', 'Экология'];

  return (
    <div>
      <div className="topbar">
        <div className="search">
          <Search size={20} color="var(--muted)" />
          <input
            type="text"
            placeholder="Поиск профессий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        <select
          className="select"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="">Все отрасли</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Профессии</h2>
          <p className="sub">Выбери направление для карьеры</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : professions.length === 0 ? (
          <div className="empty-state">
            <h3>Ничего не найдено</h3>
            <p>Попробуй изменить параметры поиска</p>
          </div>
        ) : (
          <div className="cards">
            {professions.map((prof) => (
              <ProfessionCard key={prof.id} profession={prof} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
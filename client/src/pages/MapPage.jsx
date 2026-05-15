// === Map Page ===
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building2 } from 'lucide-react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export function MapPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const ymapsRef = useRef(null);

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    try {
      const data = await api.get('/enterprises/geo');
      setEnterprises(data);
    } catch (err) {
      console.error('Failed to load enterprises geo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ymaps) {
      initMap();
    } else if (!loading && enterprises.length > 0) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU';
      script.onload = () => {
        window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    }
  }, [loading, enterprises]);

  const mapInstanceRef = useRef(null);

  const createMap = () => {
    if (!window.ymaps || !mapRef.current) return null;
    if (mapInstanceRef.current) return mapInstanceRef.current;

    const map = new window.ymaps.Map(mapRef.current, {
      center: [58.6, 49.6], // Киров
      zoom: 10,
      controls: ['zoomControl', 'fullscreenControl']
    });
    mapInstanceRef.current = map;
    return map;
  };

  const addPlacemarks = () => {
    const map = createMap();
    if (!map) return;

    enterprises.forEach((ent) => {
      const placemark = new window.ymaps.Placemark(
        [ent.latitude, ent.longitude],
        {
          balloonContentHeader: ent.name,
          balloonContentBody: `<p>${ent.city}</p><p>${ent.address || ''}</p><a href="/enterprises/${ent.id}">Подробнее</a>`,
          hintContent: ent.name
        },
        {
          preset: 'islands#blueFactoryIcon'
        }
      );
      map.geoObjects.add(placemark);
    });
  };

  const initMap = () => {
    if (!window.ymaps || !mapRef.current) return;
    addPlacemarks();
  };

  return (
    <div>
      <h1>Карта предприятий</h1>
      <p className="sub" style={{ marginBottom: 24 }}>
        Найди предприятия рядом с тобой
      </p>

      <div className="section">
        {loading ? (
          <div className="spinner" />
        ) : enterprises.length === 0 ? (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>Нет данных для карты</h3>
            <p>Добавьте координаты предприятиям в админке</p>
          </div>
        ) : (
          <div ref={mapRef} style={{ width: '100%', height: 500, borderRadius: 16 }} />
        )}
      </div>

      <div className="section" style={{ marginTop: 24 }}>
        <h3>Список предприятий на карте</h3>
        <div className="cards" style={{ marginTop: 16 }}>
          {enterprises.map((ent) => (
            <Link
              key={ent.id}
              to={`/enterprises/${ent.id}`}
              className="card"
              style={{ display: 'block' }}
            >
              <div className="card-body">
                <h3>{ent.name}</h3>
                <p className="meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />
                  {ent.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
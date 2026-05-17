// === Map Selector Component (Yandex Maps) ===
import React, { useLayoutEffect, useRef, useState } from 'react';

const SCRIPT_SRC = 'https://api-maps.yandex.ru/2.1/?apikey=6c100799-f17e-42d6-b637-af2bc111cd32&lang=ru_RU';

export default function YandexMapSelector({ latitude, longitude, onCoordsChange }) {
  const mapContainer = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const lat = latitude || 55.751244;
  const lng = longitude || 37.618423;

  useLayoutEffect(() => {
    let mapInstance = null;
    let placemark = null;
    let timers = [];

    function initMap() {
      try {
        if (!mapContainer.current || mapInstance) return;

        // Проверяем, что контейнер имеет размеры
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.log('YandexMapSelector: container has no size yet, retrying...');
          requestAnimationFrame(initMap);
          return;
        }

        console.log('YandexMapSelector: creating map');
        const map = new window.ymaps.Map(mapContainer.current, {
          center: [lat, lng],
          zoom: 10,
          controls: ['zoomControl']
        });

        const pm = new window.ymaps.Placemark([lat, lng], {}, {
          draggable: true,
          preset: 'islands#redDotIcon'
        });
        map.geoObjects.add(pm);

        pm.events.add('dragend', () => {
          const coords = pm.geometry.getCoordinates();
          onCoordsChange?.(coords[0], coords[1]);
        });

        map.events.add('click', (e) => {
          const coords = e.get('coords');
          pm.geometry.setCoordinates(coords);
          onCoordsChange?.(coords[0], coords[1]);
        });

        mapInstance = map;
        placemark = pm;
        setReady(true);
        console.log('YandexMapSelector: map ready');
      } catch (err) {
        console.error('YandexMapSelector init error:', err);
        setError(true);
      }
    }

    // Синхронизация метки при изменении координат
    const syncTimer = setInterval(() => {
      if (placemark && latitude && longitude) {
        const newCoords = [Number(latitude), Number(longitude)];
        const currentCoords = placemark.geometry.getCoordinates();
        if (Math.abs(currentCoords[0] - newCoords[0]) > 0.0001 || Math.abs(currentCoords[1] - newCoords[1]) > 0.0001) {
          placemark.geometry.setCoordinates(newCoords);
          mapInstance?.setCenter(newCoords, mapInstance.getZoom(), { duration: 300 });
        }
      }
    }, 300);
    timers.push(syncTimer);

    // Загружаем скрипт API (если ещё не загружен)
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      console.log('YandexMapSelector: loading script');
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onerror = () => console.error('YandexMapSelector: script load error');
      document.head.appendChild(script);
    } else {
      console.log('YandexMapSelector: script already loaded');
    }

    // Ждём ymaps
    const waitTimer = setInterval(() => {
      if (typeof window.ymaps !== 'undefined' && window.ymaps) {
        console.log('YandexMapSelector: ymaps available');
        clearInterval(waitTimer);
        window.ymaps.ready(initMap);
      }
    }, 100);
    timers.push(waitTimer);

    return () => {
      console.log('YandexMapSelector: cleanup');
      timers.forEach(t => {
        if (typeof t === 'number') clearTimeout(t);
        else clearInterval(t);
      });
      if (mapInstance) {
        console.log('YandexMapSelector: destroying map');
        mapInstance.destroy();
        mapInstance = null;
        placemark = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{
        width: '100%', height: 300, borderRadius: 12, marginBottom: 16,
        background: '#fff3cd', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#856404', fontSize: 14, textAlign: 'center', padding: 16
      }}>
        Не удалось загрузить карту. Введите координаты вручную.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: 300, borderRadius: 12, marginBottom: 18 }}>
      <div
        ref={mapContainer}
        style={{
          width: '100%', height: 300, borderRadius: 12, overflow: 'hidden',
          background: '#f0f0f0'
        }}
      />
      {!ready && !error && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 14, borderRadius: 12,
          background: '#f0f0f0', zIndex: 1
        }}>
          Загрузка карты...
        </div>
      )}
    </div>
  );
}

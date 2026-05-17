// === Profession Detail Page ===
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { api } from '../api/client';
import { EnterpriseCard } from '../components/Card';

export function ProfessionDetailPage() {
  const { id } = useParams();
  const [profession, setProfession] = useState(null);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoModalSrc, setPhotoModalSrc] = useState('');
  const [photoModalCaption, setPhotoModalCaption] = useState('');
  const galleryTrackRef = useRef(null);

  const images = useMemo(() => {
    if (!profession?.image_url) return [];
    try {
      const parsed = JSON.parse(`{${profession.image_url}}`);
      return Object.entries(parsed).map(([caption, url]) => ({ caption, url }));
    } catch {
      return [];
    }
  }, [profession?.image_url]);

  const openPhotoModal = (src, caption) => {
    setPhotoModalSrc(src);
    setPhotoModalCaption(caption);
    setPhotoModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setPhotoModalSrc('');
    setPhotoModalCaption('');
    document.body.style.overflow = '';
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (videoExpanded) setVideoExpanded(false);
        if (photoModalOpen) closePhotoModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [videoExpanded, photoModalOpen]);

  useEffect(() => {
    document.body.style.overflow = videoExpanded || photoModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [videoExpanded, photoModalOpen]);

  // Горизонтальная прокрутка галереи колёсиком мыши (без вертикального скролла страницы)
  useEffect(() => {
    const el = galleryTrackRef.current;
    if (!el) return;
    const handler = (e) => {
      // Если есть горизонтальное смещение — прокручиваем галерею, не трогаем страницу
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY > 0 ? 300 : -300,
          behavior: 'smooth'
        });
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [images.length, profession?.video_url]);

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

      <div className="section" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span className="badge" style={{ fontSize: 14 }}>{profession.industry}</span>
        </div>
        <h1>{profession.title}</h1>

        {/* Галерея изображений + видео */}
        {(images.length > 0 || profession.video_url) && (
          <div
            className="photo-gallery"
            style={{ margin: '1rem 0', position: 'relative' }}
          >
            <div
              ref={galleryTrackRef}
              className="photo-gallery-track"
              style={{
                display: 'flex', gap: '0.75rem',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border) transparent',
                scrollBehavior: 'smooth'
              }}
            >
              {/* Видео — как элемент галереи, первым */}
              {profession.video_url && (
                <div
                  className="gallery-item"
                  style={{
                    flexShrink: 0,
                    width: 390,
                    height: 220,
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    scrollSnapAlign: 'start',
                    background: '#0c0f18',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => setVideoExpanded(true)}
                >
                  {/* iframe-превью: масштабируем чтобы заполнить квадрат 1:1 без чёрных полос */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '105%', height: '105%'
                    }}
                  >
                    <iframe
                      src={profession.video_url}
                      style={{
                        width: '100%', height: '100%',
                        border: 'none',
                        pointerEvents: 'none',
                        display: 'block'
                      }}
                      title="Видео о профессии"
                    />
                  </div>
                  {/* Плей-оверлей поверх iframe */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0, 0, 0, 0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                  </div>
                </div>
              )}

              {/* Изображения */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="gallery-item"
                  style={{
                    flexShrink: 0,
                    width: 220,
                    height: 220,
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    scrollSnapAlign: 'start',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => openPhotoModal(img.url, img.caption)}
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <div
                    className="gallery-item-caption"
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(15,25,45,0.72))',
                      color: '#fff',
                      fontSize: '0.68rem', fontWeight: 500,
                      padding: '1rem 0.65rem 0.45rem',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                  >
                    {img.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="lead">{profession.description}</p>

        {/* Модальное окно для видео (развёрнутый просмотр) */}
        {videoExpanded && (
          <>
            <div
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 10000
              }}
              onClick={() => setVideoExpanded(false)}
            />
            <div
              style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(980px, 92vw)',
                zIndex: 10001,
                borderRadius: '1.75rem',
                overflow: 'hidden',
                background: '#0b0e14',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 50px rgba(0,0,0,0.5)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.95rem',
                  background: '#10141e',
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600
                }}>
                  🎬 Видео о профессии
                  <span style={{
                    background: '#1f2a3a', color: '#94a3b8',
                    fontSize: '0.62rem', borderRadius: 999,
                    padding: '2px 8px', fontWeight: 500
                  }}>
                    ВК
                  </span>
                </div>
                <button
                  onClick={() => setVideoExpanded(false)}
                  style={{
                    background: 'rgba(255,255,255,0.09)',
                    border: 'none', width: 32, height: 32,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#f1f5f9', fontSize: '1rem',
                    transition: 'background 0.18s, transform 0.18s', lineHeight: 1
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                  aria-label="Закрыть видео"
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '16 / 9',
                overflow: 'hidden', background: 'transparent'
              }}>
                <iframe
                  src={profession.video_url}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block', border: 'none'
                  }}
                  allowFullScreen
                  title="Видео о профессии"
                  frameBorder="0"
                />
              </div>
            </div>
          </>
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

      {/* Модальное окно для фото */}
      {photoModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={e => {
            if (e.target === e.currentTarget) closePhotoModal();
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw', maxHeight: '90vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <button
              onClick={closePhotoModal}
              style={{
                position: 'absolute', top: '-2.5rem', right: 0,
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', background: 'rgba(255,255,255,0.12)',
                color: '#f1f5f9', fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 1, lineHeight: 1
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
            >
              <X size={16} />
            </button>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'
            }}>
              <img
                src={photoModalSrc}
                alt={photoModalCaption}
                style={{
                  maxWidth: '80vw',
                  maxHeight: '70vh',
                  borderRadius: '1.25rem',
                  objectFit: 'contain',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
              />
              {photoModalCaption && (
                <div style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.9rem', fontWeight: 500,
                  textAlign: 'center'
                }}>
                  {photoModalCaption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

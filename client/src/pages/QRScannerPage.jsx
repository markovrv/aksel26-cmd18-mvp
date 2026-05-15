// === QR Scanner Page ===
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useToastStore } from '../store/useToastStore';
import jsQR from 'jsqr';

export function QRScannerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToastStore();

  const scanningRef = useRef(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;  // теперь ref не null
      await videoRef.current.play();
      scanningRef.current = true;
      setScanning(true);
      requestAnimationFrame(tick);
    } catch (err) {
      console.error(err);
      error('Не удалось получить доступ к камере');
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const tick = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        handleScan(code.data);
        return;
      }
    }

    requestAnimationFrame(tick);
  };

  const handleScan = async (token) => {
    stopCamera();
    setLoading(true);

    try {
      await api.post('/qr/scan', { token });
      setResult({ success: true, token });
      success('Посещение подтверждено!');
    } catch (err) {
      setResult({ success: false, message: err.message });
      error(err.message || 'Ошибка при сканировании');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div>
      <h1>QR-сканер</h1>
      <p className="sub" style={{ marginBottom: 24 }}>
        Отсканируйте QR-код после посещения экскурсии
      </p>

      {loading && (
        <div className="section" style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: 16 }}>Обработка QR-кода...</p>
        </div>
      )}

      {result?.success && (
        <div className="section" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 16 }} />
          <h2 style={{ color: 'var(--success)' }}>Посещение подтверждено!</h2>
          <p>Спасибо за экскурсию. Ждём вас снова!</p>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setResult(null)}>
            Сканировать ещё раз
          </button>
        </div>
      )}

      {result?.success === false && (
        <div className="section" style={{ textAlign: 'center', borderColor: '#C0392B' }}>
          <X size={64} color="#C0392B" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#C0392B' }}>Ошибка</h2>
          <p>{result.message}</p>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setResult(null)}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !result && (
        <div className="section">
          <div style={{ textAlign: 'center', padding: 40, display: scanning ? 'block' : 'none' }}>
            <video
              ref={videoRef}
              style={{ maxWidth: '100%' }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          {!scanning ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Camera size={64} color="var(--muted)" style={{ marginBottom: 16 }} />
              <p style={{ marginBottom: 20 }}>Наведите камеру на QR-код</p>
              <button className="btn primary" onClick={startCamera}>
                Начать сканирование
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                className="btn secondary"
                onClick={stopCamera}
                style={{ marginTop: 16 }}
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
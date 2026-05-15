// === QR Controller ===
import db from '../db/index.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

// === Scan QR ===
export async function scanQR(req, res) {
  try {
    const { token } = req.body;

    const qr = await db.getAsync('SELECT * FROM qr_codes WHERE token = ?', [token]);
    if (!qr) {
      return res.status(404).json({ message: 'QR-код не найден' });
    }

    if (qr.is_scanned) {
      return res.status(400).json({ message: 'QR-код уже был отсканирован' });
    }

    // Mark as scanned
    await db.runAsync(
      'UPDATE qr_codes SET is_scanned = 1, scanned_at = datetime("now") WHERE id = ?',
      [qr.id]
    );

    // Update booking status to visited
    await db.runAsync(
      'UPDATE bookings SET status = "visited" WHERE id = ?',
      [qr.booking_id]
    );

    res.json({ message: 'Посещение подтверждено' });
  } catch (err) {
    console.error('ScanQR error:', err);
    res.status(500).json({ message: 'Ошибка при сканировании QR' });
  }
}

// === Generate QR for enterprise bookings ===
export async function generateQR(req, res) {
  try {
    const { enterpriseId } = req.params;
    const user_id = req.user.id;

    // Check permission
    if (req.user.role !== 'admin') {
      const enterprise = await db.getAsync('SELECT user_id FROM enterprises WHERE id = ?', [enterpriseId]);
      if (!enterprise || enterprise.user_id !== user_id) {
        return res.status(403).json({ message: 'Нет прав на генерацию QR' });
      }
    }

    // Get all visited bookings for this enterprise
    const bookings = await db.allAsync(
      `SELECT b.id, q.token FROM bookings b
       INNER JOIN qr_codes q ON b.id = q.booking_id
       WHERE b.enterprise_id = ? AND b.status = 'visited' AND q.is_scanned = 0`,
      [enterpriseId]
    );

    const qrs = [];
    for (const booking of bookings) {
      const qrDataUrl = await QRCode.toDataURL(booking.token);
      qrs.push({ booking_id: booking.id, token: booking.token, qr: qrDataUrl });
    }

    res.json({ data: qrs });
  } catch (err) {
    console.error('GenerateQR error:', err);
    res.status(500).json({ message: 'Ошибка при генерации QR' });
  }
}
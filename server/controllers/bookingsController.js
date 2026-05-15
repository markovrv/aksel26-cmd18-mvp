// === Bookings Controller ===
import db from '../db/index.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

// === Create Booking ===
export async function createBooking(req, res) {
  try {
    const { slot_id, enterprise_id } = req.body;
    const user_id = req.user.id;

    // Check if slot exists and has available places
    const slot = await db.getAsync('SELECT * FROM slots WHERE id = ?', [slot_id]);
    if (!slot) {
      return res.status(404).json({ message: 'Слот не найден' });
    }
    if (slot.booked_count >= slot.max_participants) {
      return res.status(400).json({ message: 'Нет свободных мест' });
    }

    // Check if user already booked this slot
    const existingBooking = await db.getAsync(
      'SELECT id FROM bookings WHERE user_id = ? AND slot_id = ?',
      [user_id, slot_id]
    );
    if (existingBooking) {
      return res.status(400).json({ message: 'Вы уже записаны на этот слот' });
    }

    // Create booking
    const result = await db.runAsync(
      'INSERT INTO bookings (user_id, slot_id, enterprise_id, status) VALUES (?, ?, ?, ?)',
      [user_id, slot_id, enterprise_id, 'confirmed']
    );

    // Update booked count
    await db.runAsync(
      'UPDATE slots SET booked_count = booked_count + 1 WHERE id = ?',
      [slot_id]
    );

    // Create QR code
    const token = crypto.randomBytes(32).toString('hex');
    await db.runAsync(
      'INSERT INTO qr_codes (booking_id, token) VALUES (?, ?)',
      [result.lastID, token]
    );

    res.status(201).json({
      message: 'Запись создана',
      booking: { id: result.lastID, slot_id, enterprise_id },
      qr_token: token
    });
  } catch (err) {
    console.error('CreateBooking error:', err);
    res.status(500).json({ message: 'Ошибка при создании записи' });
  }
}

// === Get My Bookings ===
export async function getMyBookings(req, res) {
  try {
    const user_id = req.user.id;

    const bookings = await db.allAsync(
      `SELECT b.*, e.name as enterprise_name, e.industry, e.city, e.address,
       s.date, s.time, q.token as qr_token, q.is_scanned
       FROM bookings b
       INNER JOIN enterprises e ON b.enterprise_id = e.id
       INNER JOIN slots s ON b.slot_id = s.id
       LEFT JOIN qr_codes q ON b.id = q.booking_id
       WHERE b.user_id = ?
       ORDER BY s.date DESC, s.time DESC`,
      [user_id]
    );

    res.json({ data: bookings });
  } catch (err) {
    console.error('GetMyBookings error:', err);
    res.status(500).json({ message: 'Ошибка при получении записей' });
  }
}

// === Delete Booking ===
export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const booking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    // Check permission: user is owner, enterprise owner, or admin
    if (req.user.role === 'user' && booking.user_id !== user_id) {
      return res.status(403).json({ message: 'Нет прав на удаление записи' });
    }

    // Update slot booked count
    await db.runAsync(
      'UPDATE slots SET booked_count = MAX(0, booked_count - 1) WHERE id = ?',
      [booking.slot_id]
    );

    // Delete booking
    await db.runAsync('DELETE FROM bookings WHERE id = ?', [id]);

    res.json({ message: 'Запись отменена' });
  } catch (err) {
    console.error('DeleteBooking error:', err);
    res.status(500).json({ message: 'Ошибка при отмене записи' });
  }
}
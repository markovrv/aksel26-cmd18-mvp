// === Slots Controller ===
import db from '../db/index.js';

// === Delete Slot ===
export async function deleteSlot(req, res) {
  try {
    const { slotId } = req.params;

    // Check permission: admin or enterprise owner
    if (req.user.role !== 'admin') {
      const slot = await db.getAsync('SELECT enterprise_id FROM slots WHERE id = ?', [slotId]);
      if (!slot) {
        return res.status(404).json({ message: 'Слот не найден' });
      }
      const enterprise = await db.getAsync('SELECT user_id FROM enterprises WHERE id = ?', [slot.enterprise_id]);
      if (!enterprise || enterprise.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Нет прав на удаление слота' });
      }
    }

    await db.runAsync('DELETE FROM slots WHERE id = ?', [slotId]);
    res.json({ message: 'Слот удалён' });
  } catch (err) {
    console.error('DeleteSlot error:', err);
    res.status(500).json({ message: 'Ошибка при удалении слота' });
  }
}
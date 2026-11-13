const pool = require('../config/db');

exports.findByUser = async (userId) =>
  (await pool.query(
    `SELECT t.code,t.status,t.checked_in_at,e.name AS event_name,e.venue,e.starts_at
     FROM tickets t JOIN orders o ON o.id=t.order_id JOIN events e ON e.id=t.event_id
     WHERE o.user_id=? ORDER BY t.id DESC`, [userId]))[0];

exports.findByCode = async (code) =>
  (await pool.query(
    `SELECT t.*,e.name AS event_name FROM tickets t JOIN events e ON e.id=t.event_id
     WHERE t.code=?`, [code]))[0][0];

// Check-in atómico: la condición status='VALID' dentro del UPDATE impide que dos
// escaneos simultáneos del mismo código ambos tengan éxito.
exports.consume = async (code, staffId, eventId) => {
  const ev = eventId ? Number(eventId) : null;
  const [r] = await pool.query(
    `UPDATE tickets SET status='USED', checked_in_at=NOW(), checked_in_by=?
     WHERE code=? AND status='VALID' AND (? IS NULL OR event_id=?)`,
    [staffId, code, ev, ev]);
  return r.affectedRows === 1;
};

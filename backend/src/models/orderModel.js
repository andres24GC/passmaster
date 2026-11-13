// Operaciones transaccionales de pedidos. El bloqueo FOR UPDATE sobre la fila del
// evento serializa las compras concurrentes y evita sobreventa.
const crypto = require('crypto');
const pool = require('../config/db');
const httpError = require('../utils/httpError');

async function tx(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// 1) Reserva cupos y crea el pedido PENDING.
exports.reserve = (userId, eventId, qty) => tx(async (c) => {
  const [[ev]] = await c.query('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]);
  if (!ev) throw httpError(404, 'Evento no encontrado');
  if (ev.sold + qty > ev.capacity) throw httpError(409, 'Cupos insuficientes');
  const total = Number(ev.price) * qty;
  await c.query('UPDATE events SET sold = sold + ? WHERE id=?', [qty, eventId]);
  const [r] = await c.query(
    'INSERT INTO orders (user_id,event_id,quantity,total) VALUES (?,?,?,?)',
    [userId, eventId, qty, total]);
  return { id: r.insertId, eventId, quantity: qty, total, status: 'PENDING' };
});

exports.findOwned = async (id, userId) =>
  (await pool.query(
    `SELECT o.*, e.name AS event_name FROM orders o JOIN events e ON e.id=o.event_id
     WHERE o.id=? AND o.user_id=?`, [id, userId]))[0][0];

// 2a) Pago aprobado: marca PAID y genera un ticket con UUID por boleto.
// Idempotencia: si el pedido ya tiene tickets, no vuelve a generar (evita duplicados).
exports.markPaid = (orderId, paymentRef) => tx(async (c) => {
  const [[o]] = await c.query('SELECT * FROM orders WHERE id=? FOR UPDATE', [orderId]);
  if (o.status !== 'PENDING') throw httpError(409, 'El pedido ya fue procesado');
  const [[existing]] = await c.query('SELECT COUNT(*) AS n FROM tickets WHERE order_id=?', [o.id]);
  if (Number(existing.n) > 0) throw httpError(409, 'Este pedido ya tiene tickets emitidos');
  const rows = Array.from({ length: o.quantity }, () => [crypto.randomUUID(), o.id, o.event_id]);
  await c.query('INSERT INTO tickets (code,order_id,event_id) VALUES ?', [rows]);
  await c.query("UPDATE orders SET status='PAID', payment_ref=? WHERE id=?", [paymentRef, o.id]);
  return rows.map((r) => r[0]);
});

// 2b) Pago rechazado: libera los cupos reservados.
exports.markFailed = (orderId) => tx(async (c) => {
  const [[o]] = await c.query('SELECT * FROM orders WHERE id=? FOR UPDATE', [orderId]);
  if (o.status !== 'PENDING') return;
  await c.query("UPDATE orders SET status='FAILED' WHERE id=?", [o.id]);
  await c.query('UPDATE events SET sold = sold - ? WHERE id=?', [o.quantity, o.event_id]);
});

exports.findByUser = async (userId) =>
  (await pool.query(
    `SELECT o.*, e.name AS event_name FROM orders o JOIN events e ON e.id=o.event_id
     WHERE o.user_id=? ORDER BY o.id DESC`, [userId]))[0];

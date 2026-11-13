const pool = require('../config/db');

exports.findAll = async () =>
  (await pool.query(
    `SELECT id,name,description,venue,starts_at,capacity,sold,price,
            (capacity - sold) AS available
     FROM events WHERE starts_at >= NOW() - INTERVAL 1 DAY ORDER BY starts_at`))[0];

exports.findById = async (id) =>
  (await pool.query('SELECT *, (capacity - sold) AS available FROM events WHERE id=?', [id]))[0][0];

exports.create = async (e, userId) => {
  const [r] = await pool.query(
    `INSERT INTO events (name,description,venue,starts_at,capacity,price,created_by)
     VALUES (?,?,?,?,?,?,?)`,
    [e.name, e.description || null, e.venue, e.starts_at, e.capacity, e.price, userId]);
  return r.insertId;
};

// Aforo en tiempo real: vendidos, ingresados (check-in) y pendientes de ingreso.
exports.dashboard = async () =>
  (await pool.query(
    `SELECT e.id,e.name,e.venue,e.starts_at,e.capacity,e.sold,
            (e.capacity - e.sold) AS available,
            COALESCE(SUM(t.status='USED'),0) AS checked_in,
            COALESCE(SUM(t.status='VALID'),0) AS pending_entry
     FROM events e LEFT JOIN tickets t ON t.event_id = e.id
     GROUP BY e.id ORDER BY e.starts_at`))[0];

const pool = require('../config/db');

exports.findByEmail = async (email) =>
  (await pool.query('SELECT * FROM users WHERE email=?', [email]))[0][0];

exports.findById = async (id) =>
  (await pool.query('SELECT id,name,email,role FROM users WHERE id=?', [id]))[0][0];

exports.create = async ({ name, email, passwordHash, role = 'customer' }) => {
  const [r] = await pool.query(
    'INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',
    [name, email, passwordHash, role]);
  return r.insertId;
};

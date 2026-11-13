// Crea usuarios admin/staff y un evento de ejemplo: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  const users = [
    ['Admin', 'admin@passmaster.test', 'Admin123!', 'admin'],
    ['Staff', 'staff@passmaster.test', 'Staff123!', 'staff'],
  ];
  for (const [name, email, pass, role] of users) {
    await pool.query(
      'INSERT IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',
      [name, email, await bcrypt.hash(pass, 12), role]);
  }
  await pool.query(
    `INSERT INTO events (name,description,venue,starts_at,capacity,price,created_by)
     VALUES ('Concierto de Apertura','Evento de demostración','Teatro Central',
             DATE_ADD(NOW(), INTERVAL 30 DAY),100,50000,1)`);
  console.log('Seed listo. admin@passmaster.test / Admin123!  |  staff@passmaster.test / Staff123!');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });

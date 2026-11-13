// Crea usuarios admin/staff/customer y varios eventos de ejemplo: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  const users = [
    ['Admin', 'admin@passmaster.test', 'Admin123!', 'admin'],
    ['Staff', 'staff@passmaster.test', 'Staff123!', 'staff'],
    ['Cliente', 'cliente@passmaster.test', 'Cliente123!', 'customer'],
    ['Andres', 'andres@passmaster.test', 'andres12345', 'customer'],
  ];
  for (const [name, email, pass, role] of users) {
    await pool.query(
      'INSERT IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',
      [name, email, await bcrypt.hash(pass, 12), role]);
  }

  const eventos = [
    ['Concierto de Apertura','Evento de demostración del sistema PassMaster','Teatro Central', `DATE_ADD(NOW(), INTERVAL 30 DAY)`, 10, 50000, 1],
    ['Festival de Jazz','Noches de jazz en vivo','Auditorio Sur', `DATE_ADD(NOW(), INTERVAL 15 DAY)`, 10, 35000, 1],
    ['Obra de Teatro: La Casa','Drama contemporáneo','Teatro Municipal', `DATE_ADD(NOW(), INTERVAL 45 DAY)`, 10, 25000, 1],
    ['Conferencia Tech 2026','Tecnología e innovación','Centro de Convenciones', `DATE_ADD(NOW(), INTERVAL 60 DAY)`, 10, 80000, 1],
    ['Partido de Fútbol Final','Gran final del torneo','Estadio Norte', `DATE_ADD(NOW(), INTERVAL 10 DAY)`, 10, 120000, 1],
    ['Exposición de Arte Moderno','Arte contemporáneo','Galería Centro', `DATE_ADD(NOW(), INTERVAL 90 DAY)`, 10, 15000, 1],
  ];

  for (const [name, desc, venue, starts_at, capacity, price, created_by] of eventos) {
    await pool.query(
      `INSERT INTO events (name,description,venue,starts_at,capacity,price,created_by)
       VALUES (?,?,?,${starts_at},?,?,?)`,
      [name, desc, venue, capacity, price, created_by]);
  }

  console.log('Seed listo.');
  console.log('Usuarios:');
  console.log('  admin@passmaster.test / Admin123!');
  console.log('  staff@passmaster.test / Staff123!');
  console.log('  cliente@passmaster.test / Cliente123!');
  console.log('  andres@passmaster.test / andres12345');
  console.log('Eventos creados: 6');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });

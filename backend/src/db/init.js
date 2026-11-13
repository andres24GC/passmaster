require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ?? undefined,
      multipleStatements: true,
    });
    await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    console.log('Esquema creado (base de datos passmaster y tablas).');
  } catch (e) {
    console.error('No se pudo inicializar la base de datos.');
    if (e.code === 'ECONNREFUSED') {
      console.error('  -> MySQL no esta corriendo. Inicia el servicio de MySQL (XAMPP o Servicios de Windows).');
    } else if (e.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  -> Usuario o contraseña de MySQL incorrectos en backend/.env.');
    } else {
      console.error('  -> ' + e.message);
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();

// Ejecuta schema.sql contra el servidor MySQL: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, multipleStatements: true,
  });
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log('Esquema creado.');
  await conn.end();
})().catch((e) => { console.error(e); process.exit(1); });

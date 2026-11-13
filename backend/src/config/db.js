// Pool de conexiones MySQL compartido por todos los modelos.
require('dotenv').config();
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? undefined,
  database: process.env.DB_NAME || 'passmaster',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

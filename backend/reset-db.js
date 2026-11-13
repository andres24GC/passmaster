// Script todo-en-uno: crea BD, tablas, usuarios y eventos.
// Ejecutar: node reset-db.js  (desde la carpeta backend)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    // 1) Conectar sin base de datos (para crearla)
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD ?? undefined,
      multipleStatements: true,
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS passmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE passmaster`);
    console.log('Base de datos passmaster lista');

    // 2) Crear tablas
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        venue VARCHAR(150) NOT NULL,
        starts_at DATETIME NOT NULL,
        capacity INT NOT NULL,
        sold INT NOT NULL DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_capacity CHECK (capacity > 0 AND sold >= 0 AND sold <= capacity),
        FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
        payment_ref VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (event_id) REFERENCES events(id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code CHAR(36) NOT NULL,
        order_id INT NOT NULL,
        event_id INT NOT NULL,
        status ENUM('VALID','USED','CANCELLED') NOT NULL DEFAULT 'VALID',
        checked_in_at DATETIME NULL,
        checked_in_by INT NULL,
        UNIQUE KEY uq_ticket_code (code),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (checked_in_by) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);
    console.log('Tablas creadas');

    // 3) Usuarios con contraseñas encriptadas
    const users = [
      ['Admin', 'admin@passmaster.test', 'Admin123!', 'admin'],
      ['Staff', 'staff@passmaster.test', 'Staff123!', 'staff'],
      ['Cliente', 'cliente@passmaster.test', 'Cliente123!', 'customer'],
      ['Andres', 'andres@passmaster.test', 'andres12345', 'customer'],
    ];
    for (const [name, email, pass, role] of users) {
      const hash = await bcrypt.hash(pass, 12);
      await conn.query(
        `INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)`,
        [name, email, hash, role]
      );
    }
    console.log('Usuarios insertados');

    // 4) Eventos de ejemplo (6 eventos)
    const ahora = new Date();
    const sumarDias = (d) => new Date(ahora.getTime() + d * 86400000).toISOString().slice(0, 19).replace('T', ' ');
    const eventos = [
      ['Concierto de Apertura','Evento de demostración','Teatro Central', sumarDias(30), 100, 50000, 1],
      ['Festival de Jazz','Noches de jazz en vivo','Auditorio Sur', sumarDias(15), 200, 35000, 1],
      ['Obra de Teatro: La Casa','Drama contemporáneo','Teatro Municipal', sumarDias(45), 150, 25000, 1],
      ['Conferencia Tech 2026','Tecnología e innovación','Centro de Convenciones', sumarDias(60), 300, 80000, 1],
      ['Partido de Fútbol Final','Gran final del torneo','Estadio Norte', sumarDias(10), 500, 120000, 1],
      ['Exposición de Arte Moderno','Arte contemporáneo','Galería Centro', sumarDias(90), 120, 15000, 1],
    ];
    for (const [name, desc, venue, starts_at, capacity, price, created_by] of eventos) {
      await conn.query(
        `INSERT INTO events (name,description,venue,starts_at,capacity,price,created_by)
         VALUES (?,?,?,?,?,?,?)`,
        [name, desc, venue, starts_at, capacity, price, created_by]
      );
    }
    console.log('6 eventos insertados');

    console.log('\n========================================');
    console.log('CREDENCIALES DE PRUEBA:');
    console.log('  Admin:    admin@passmaster.test / Admin123!');
    console.log('  Staff:    staff@passmaster.test / Staff123!');
    console.log('  Andres:   andres@passmaster.test / andres12345');
    console.log('========================================\n');

  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.code === 'ECONNREFUSED') {
      console.error('\nMySQL no est corriendo. Incialo desde XAMPP o Servicios de Windows.');
    } else if (e.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nRevisa DB_USER y DB_PASSWORD en backend/.env');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();

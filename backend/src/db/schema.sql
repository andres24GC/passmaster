-- PassMaster: esquema MySQL 8+
CREATE DATABASE IF NOT EXISTS passmaster CHARACTER SET utf8mb4;
USE passmaster;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
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
  sold INT NOT NULL DEFAULT 0,            -- cupos vendidos + reservados (pedidos PENDING)
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
  code CHAR(36) NOT NULL,                  -- UUID v4 (identificador único)
  order_id INT NOT NULL,
  event_id INT NOT NULL,
  status ENUM('VALID','USED','CANCELLED') NOT NULL DEFAULT 'VALID',
  checked_in_at DATETIME NULL,
  checked_in_by INT NULL,
  UNIQUE KEY uq_ticket_code (code),        -- garantía de unicidad a nivel de BD
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (checked_in_by) REFERENCES users(id)
) ENGINE=InnoDB;

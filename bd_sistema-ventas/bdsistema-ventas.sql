-- PostgreSQL Dump

-- Drop tables in dependency order
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

-- Table: roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL
);

-- Table: categorias
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  CONSTRAINT uk_categorias_nombre UNIQUE (nombre)
);

-- Table: usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol_id INTEGER,
  activo BOOLEAN DEFAULT true,
  CONSTRAINT uk_usuarios_username UNIQUE (username),
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles (id)
);

-- Table: productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  stock INTEGER NOT NULL,
  precio_venta DECIMAL(10,2) NOT NULL,
  codigo_barras VARCHAR(255),
  descripcion TEXT,
  url_imagen TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  categoria_id INTEGER,
  CONSTRAINT uk_productos_codigo_barras UNIQUE (codigo_barras),
  CONSTRAINT fk_productos_categorias FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

-- Table: ventas
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  tipo_comprobante VARCHAR(20) NOT NULL,
  usuario_id INTEGER,
  CONSTRAINT fk_ventas_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

-- Table: detalle_ventas
CREATE TABLE detalle_ventas (
  id SERIAL PRIMARY KEY,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  venta_id INTEGER,
  producto_id INTEGER,
  CONSTRAINT fk_detalle_ventas_ventas FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_ventas_productos FOREIGN KEY (producto_id) REFERENCES productos (id)
);

-- Data: roles
INSERT INTO roles (id, nombre) VALUES
	(1, 'ADMIN'),
	(2, 'CAJERO'),
	(3, 'ALMACENERO');

-- Data: categorias
-- Note: Manually setting IDs to match foreign key references if necessary
INSERT INTO categorias (id, nombre) OVERRIDING SYSTEM VALUE VALUES
	(17, 'Accesorios'),
	(3, 'Alimentos'),
	(4, 'Bebidas'),
	(8, 'Calzado'),
	(15, 'Deportes'),
	(2, 'Electrónica'),
	(10, 'Ferretería'),
	(6, 'Higiene Personal'),
	(9, 'Hogar'),
	(12, 'Juguetes'),
	(5, 'Limpieza'),
	(13, 'Mascotas'),
	(11, 'Papelería'),
	(7, 'Ropa'),
	(14, 'Salud'),
	(16, 'Tecnología');
-- Reset sequence for categories
SELECT setval(pg_get_serial_sequence('categorias', 'id'), (SELECT MAX(id) FROM categorias));


-- Data: usuarios
INSERT INTO usuarios (id, nombre_completo, username, password, rol_id, activo) OVERRIDING SYSTEM VALUE VALUES
	(1, 'Administrador Global', 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 1, true),
	(2, 'David Quispe Maucaylle', 'david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 2, true),
	(3, 'Fredy Quispe Maucaylle', 'fredy', 'fredy', 3, true);
-- Reset sequence
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT MAX(id) FROM usuarios));

-- Data: productos (Partial recovery)
INSERT INTO productos (id, nombre, precio_venta, stock, url_imagen, fecha_creacion, categoria_id) OVERRIDING SYSTEM VALUE VALUES
	(1, 'Laptop ASUS TUF Gaming A16 16" Windows 11 Home AMD Ryzen 7 7445HS 512GB SSD 16GB RAM FA607NUG-RL116W', 3899.00, 397, 'data:image/webp;base64,...', '2026-01-10 23:27:10', 2),
	(2, 'leche gloria', 6.48, 998, 'data:image/jpeg;base64,...', '2026-01-11 03:59:30', 3),
	(3, 'VINO Viña Vieja Malbec Semi Seco 750 Ml', 18.59, 248, 'data:image/jpeg;base64,...', '2026-01-11 04:02:00', 4);
SELECT setval(pg_get_serial_sequence('productos', 'id'), (SELECT MAX(id) FROM productos));

-- Data: ventas
INSERT INTO ventas (id, fecha_venta, total, usuario_id, tipo_comprobante) OVERRIDING SYSTEM VALUE VALUES
	(1, '2026-01-11 01:49:32', 1200.00, 1, 'FACTURA'),
	(2, '2026-01-11 02:29:23', 1200.00, 1, 'FACTURA'),
	(3, '2026-01-11 02:29:52', 1200.00, 1, 'BOLETA'),
	(4, '2026-01-11 04:00:06', 1206.48, 1, 'BOLETA'),
	(5, '2026-01-11 04:08:27', 3917.59, 1, 'BOLETA'),
	(6, '2026-01-11 05:45:01', 3899.00, 2, 'BOLETA'),
	(7, '2026-01-11 05:48:26', 3904.59, 2, 'BOLETA'),
	(8, '2026-01-11 15:55:02', 16.78, 1, 'BOLETA'),
	(9, '2026-01-11 16:51:05', 34.77, 2, 'BOLETA'),
	(10, '2026-01-11 18:46:21', 21.97, 1, 'BOLETA'),
	(11, '2026-01-11 18:51:43', 3000.57, 1, 'BOLETA'),
	(12, '2026-01-11 18:52:30', 47.66, 1, 'FACTURA'),
	(13, '2026-01-11 20:06:32', 24.18, 2, 'BOLETA'),
	(14, '2026-01-11 20:09:50', 0.20, 2, 'BOLETA'),
	(15, '2026-01-11 20:10:12', 24.18, 2, 'BOLETA'),
	(16, '2026-01-11 20:13:09', 7.49, 2, 'BOLETA');
SELECT setval(pg_get_serial_sequence('ventas', 'id'), (SELECT MAX(id) FROM ventas));

-- Data: detalle_ventas
INSERT INTO detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario, subtotal) OVERRIDING SYSTEM VALUE VALUES
	(1, 1, 1, 1, 1200.00, 1200.00),
	(2, 2, 1, 1, 1200.00, 1200.00),
	(3, 3, 1, 1, 1200.00, 1200.00),
	(4, 4, 1, 1, 1200.00, 1200.00),
	(5, 4, 2, 1, 6.48, 6.48),
	(6, 5, 1, 1, 3899.00, 3899.00),
	(7, 5, 4, 1, 18.59, 18.59),
	(8, 6, 1, 1, 3899.00, 3899.00),
	(9, 7, 1, 1, 3899.00, 3899.00),
	(10, 7, 5, 1, 5.59, 5.59),
	(11, 8, 6, 1, 0.20, 0.20),
	(12, 8, 11, 1, 9.99, 9.99),
	(13, 8, 12, 1, 6.59, 6.59),
	(14, 9, 12, 1, 6.59, 6.59),
	(15, 9, 11, 1, 9.99, 9.99),
	(16, 9, 8, 1, 12.60, 12.60),
	(17, 9, 7, 1, 5.59, 5.59),
	(18, 10, 5, 1, 5.59, 5.59),
	(19, 10, 6, 7, 0.20, 1.40),
	(20, 10, 11, 1, 9.99, 9.99),
	(21, 10, 14, 1, 2.00, 2.00),
	(22, 10, 13, 1, 2.99, 2.99),
	(23, 11, 12, 1, 6.59, 6.59),
	(24, 11, 10, 1, 2989.00, 2989.00),
	(25, 11, 9, 1, 4.98, 4.98),
	(26, 12, 11, 1, 9.99, 9.99),
	(27, 12, 8, 1, 12.60, 12.60),
	(28, 12, 3, 1, 18.59, 18.59),
	(29, 12, 2, 1, 6.48, 6.48),
	(30, 13, 5, 1, 5.59, 5.59),
	(31, 13, 4, 1, 18.59, 18.59),
	(32, 14, 6, 1, 0.20, 0.20),
	(33, 15, 5, 1, 5.59, 5.59),
	(34, 15, 4, 1, 18.59, 18.59),
	(35, 16, 13, 1, 2.99, 2.99),
	(36, 16, 14, 1, 2.00, 2.00),
	(37, 16, 15, 1, 2.50, 2.50);
SELECT setval(pg_get_serial_sequence('detalle_ventas', 'id'), (SELECT MAX(id) FROM detalle_ventas));

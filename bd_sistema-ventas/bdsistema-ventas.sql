-- 1. Limpieza total en orden inverso de jerarquía
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

-- 2. Creación de Tablas con tipos de datos correctos y AUTONUMÉRICOS (SERIAL/IDENTITY)
-- Importante: Usamos SERIAL o BIGSERIAL para que se auto-incrementen los IDs.

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    CONSTRAINT uk_categorias_nombre UNIQUE (nombre)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY, -- Usuario.java usa Integer, SERIAL es Integer compatible
    nombre_completo VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INTEGER,
    activo BOOLEAN DEFAULT true,
    CONSTRAINT uk_usuarios_username UNIQUE (username),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES roles (id)
);

CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY, -- Producto.java usa Long, BIGSERIAL es adecuado
    nombre VARCHAR(255) NOT NULL,
    stock INTEGER NOT NULL,
    precio_venta NUMERIC(10,2) NOT NULL,
    codigo_barras VARCHAR(255),
    descripcion TEXT,
    url_imagen TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria_id INTEGER,
    CONSTRAINT uk_productos_codigo_barras UNIQUE (codigo_barras),
    CONSTRAINT fk_productos_categorias FOREIGN KEY (categoria_id) REFERENCES categorias (id)
);

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY, -- Venta.java usa Integer
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL,
    tipo_comprobante VARCHAR(20) NOT NULL,
    usuario_id INTEGER,
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE detalle_ventas (
    id BIGSERIAL PRIMARY KEY, -- DetalleVenta.java usa Long
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2),
    subtotal NUMERIC(10,2),
    venta_id INTEGER,
    producto_id BIGINT,
    CONSTRAINT fk_detalle_ventas_ventas FOREIGN KEY (venta_id) REFERENCES ventas (id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_ventas_productos FOREIGN KEY (producto_id) REFERENCES productos (id)
);

-- 3. Inserción de Datos Maestros
INSERT INTO roles (id, nombre) VALUES (1, 'ADMIN'), (2, 'CAJERO'), (3, 'ALMACENERO');

INSERT INTO categorias (id, nombre) VALUES 
(2, 'Electrónica'), (3, 'Alimentos'), (4, 'Bebidas'), (5, 'Limpieza'),
(6, 'Higiene Personal'), (7, 'Ropa'), (8, 'Calzado'), (9, 'Hogar'),
(10, 'Ferretería'), (11, 'Papelería'), (12, 'Juguetes'), (13, 'Mascotas'),
(14, 'Salud'), (15, 'Deportes'), (16, 'Tecnología'), (17, 'Accesorios');

INSERT INTO usuarios (id, nombre_completo, username, password, rol_id, activo) VALUES
(1, 'Administrador Global', 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 1, true),
(2, 'David Quispe Maucaylle', 'david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 2, true);

-- Inserción de Productos
INSERT INTO productos (id, nombre, precio_venta, stock, categoria_id) VALUES
(1, 'Laptop ASUS TUF Gaming A16', 3899.00, 397, 2),
(2, 'Leche Gloria', 6.48, 998, 3),
(3, 'VINO Viña Vieja Malbec', 18.59, 248, 4),
(4, 'Gaseosa Inka Cola 2L', 10.50, 100, 4),
(5, 'Arroz Costeño 5kg', 15.00, 50, 3),
(6, 'Caramelo Limon Unitario', 0.20, 1000, 3),
(7, 'Shampoo Head & Shoulders', 12.50, 40, 6),
(8, 'Jabón Dove', 3.50, 80, 6),
(9, 'Aceite Primor 1L', 8.50, 60, 3),
(10, 'Smartphone Samsung A54', 1200.00, 15, 2),
(11, 'Cuaderno Standford 100 hjs', 5.50, 200, 11),
(12, 'Lapicero Faber Castell', 1.50, 500, 11),
(13, 'Detergente Opal 1kg', 7.50, 45, 5),
(14, 'Papel Higiénico Elite 4un', 4.50, 100, 6),
(15, 'Pasta Dental Colgate', 6.50, 90, 6);

-- Inserción de Ventas
INSERT INTO ventas (id, fecha_venta, total, usuario_id, tipo_comprobante) VALUES
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

-- Inserción de Detalles de Venta
INSERT INTO detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 1, 1200.00, 1200.00), (2, 2, 1, 1, 1200.00, 1200.00),
(3, 3, 1, 1, 1200.00, 1200.00), (4, 4, 1, 1, 1200.00, 1200.00),
(5, 4, 2, 1, 6.48, 6.48), (6, 5, 1, 1, 3899.00, 3899.00),
(7, 5, 4, 1, 18.59, 18.59), (8, 6, 1, 1, 3899.00, 3899.00),
(9, 7, 1, 1, 3899.00, 3899.00), (10, 7, 5, 1, 5.59, 5.59),
(11, 8, 6, 1, 0.20, 0.20), (12, 8, 11, 1, 9.99, 9.99),
(13, 8, 12, 1, 6.59, 6.59), (14, 9, 12, 1, 6.59, 6.59),
(15, 9, 11, 1, 9.99, 9.99), (16, 9, 8, 1, 12.60, 12.60),
(17, 9, 7, 1, 5.59, 5.59), (18, 10, 5, 1, 5.59, 5.59),
(19, 10, 6, 7, 0.20, 1.40), (20, 10, 11, 1, 9.99, 9.99),
(21, 10, 14, 1, 2.00, 2.00), (22, 10, 13, 1, 2.99, 2.99),
(23, 11, 12, 1, 6.59, 6.59), (24, 11, 10, 1, 2989.00, 2989.00),
(25, 11, 9, 1, 4.98, 4.98), (26, 12, 11, 1, 9.99, 9.99),
(27, 12, 8, 1, 12.60, 12.60), (28, 12, 3, 1, 18.59, 18.59),
(29, 12, 2, 1, 6.48, 6.48), (30, 13, 5, 1, 5.59, 5.59),
(31, 13, 4, 1, 18.59, 18.59), (32, 14, 6, 1, 0.20, 0.20),
(33, 15, 5, 1, 5.59, 5.59), (34, 15, 4, 1, 18.59, 18.59),
(35, 16, 13, 1, 2.99, 2.99), (36, 16, 14, 1, 2.00, 2.00),
(37, 16, 15, 1, 2.50, 2.50);

-- 4. Resetear secuencias (AHORA SÍ FUNCIONARÁ porque usamos SERIAL/BIGSERIAL)
SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles));
SELECT setval(pg_get_serial_sequence('categorias', 'id'), (SELECT MAX(id) FROM categorias));
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), (SELECT MAX(id) FROM usuarios));
SELECT setval(pg_get_serial_sequence('productos', 'id'), (SELECT MAX(id) FROM productos));
SELECT setval(pg_get_serial_sequence('ventas', 'id'), (SELECT MAX(id) FROM ventas));
SELECT setval(pg_get_serial_sequence('detalle_ventas', 'id'), (SELECT MAX(id) FROM detalle_ventas));

-- 5. Verificar Usuarios
SELECT id, nombre_completo, username, activo FROM usuarios;

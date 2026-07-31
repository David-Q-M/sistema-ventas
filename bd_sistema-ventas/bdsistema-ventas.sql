-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.3.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.18.0.7304
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para sistema_ventas_db
CREATE DATABASE IF NOT EXISTS `sistema_ventas_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `sistema_ventas_db`;

-- Volcando estructura para tabla sistema_ventas_db.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.categorias: ~7 rows (aproximadamente)
INSERT INTO `categorias` (`id`, `nombre`) VALUES
	(1, 'Carnes y embutidos'),
	(2, 'Làcteos'),
	(3, 'Abarrotes'),
	(4, 'Bebidas'),
	(5, 'Limpieza'),
	(6, 'Higiene Personal'),
	(7, 'Snacks y golosinas');

-- Volcando estructura para tabla sistema_ventas_db.compras
CREATE TABLE IF NOT EXISTS `compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `estado_pago` varchar(50) DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `fecha_pedido` date NOT NULL,
  `metodo_pedido` varchar(50) DEFAULT NULL,
  `monto_total` decimal(38,2) NOT NULL,
  `observacion` text DEFAULT NULL,
  `proveedor_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_p0y0t4viw3l9uek522cddegvk` (`codigo`),
  KEY `FKabfd3b61ss0f7ebhao6evn5ec` (`proveedor_id`),
  CONSTRAINT `FKabfd3b61ss0f7ebhao6evn5ec` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.compras: ~2 rows (aproximadamente)
INSERT INTO `compras` (`id`, `codigo`, `estado`, `estado_pago`, `fecha_entrega`, `fecha_pedido`, `metodo_pedido`, `monto_total`, `observacion`, `proveedor_id`) VALUES
	(1, 'CMP-0001', 'RECIBIDO', 'Contado', NULL, '2026-07-16', 'Llamada Telefónica', 112.50, NULL, 2),
	(2, 'CMP-0002', 'RECIBIDO', 'Contado', '2026-07-19', '2026-07-16', 'Llamada Telefónica', 112.50, NULL, 2);

-- Volcando estructura para tabla sistema_ventas_db.detalle_compras
CREATE TABLE IF NOT EXISTS `detalle_compras` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `observacion_item` varchar(255) DEFAULT NULL,
  `precio_costo` decimal(38,2) NOT NULL,
  `subtotal` decimal(38,2) NOT NULL,
  `compra_id` bigint(20) NOT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKs7ksdchwhuo5bv58t28iti0f0` (`compra_id`),
  KEY `FKobinn960qd4nxk1b3b0n6aps1` (`producto_id`),
  CONSTRAINT `FKobinn960qd4nxk1b3b0n6aps1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKs7ksdchwhuo5bv58t28iti0f0` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.detalle_compras: ~2 rows (aproximadamente)
INSERT INTO `detalle_compras` (`id`, `cantidad`, `observacion_item`, `precio_costo`, `subtotal`, `compra_id`, `producto_id`) VALUES
	(1, 10, '5', 11.25, 112.50, 1, 5),
	(2, 10, '5', 11.25, 112.50, 2, 5);

-- Volcando estructura para tabla sistema_ventas_db.detalle_ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(38,2) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `producto_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_detalle_ventas_ventas` (`venta_id`),
  KEY `fk_detalle_ventas_productos` (`producto_id`),
  CONSTRAINT `fk_detalle_ventas_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `fk_detalle_ventas_ventas` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.detalle_ventas: ~25 rows (aproximadamente)
INSERT INTO `detalle_ventas` (`id`, `cantidad`, `precio_unitario`, `subtotal`, `venta_id`, `producto_id`) VALUES
	(5, 1, 6.48, 6.48, 4, 2),
	(7, 1, 10.50, 10.50, 5, 4),
	(10, 1, 15.00, 15.00, 7, 5),
	(11, 1, 0.20, 0.20, 8, 6),
	(16, 1, 3.50, 3.50, 9, 8),
	(17, 1, 12.50, 12.50, 9, 7),
	(18, 1, 15.00, 15.00, 10, 5),
	(19, 7, 0.20, 1.40, 10, 6),
	(21, 1, 4.50, 4.50, 10, 14),
	(22, 1, 7.50, 7.50, 10, 13),
	(25, 1, 8.50, 8.50, 11, 9),
	(27, 1, 3.50, 3.50, 12, 8),
	(28, 1, 18.59, 18.59, 12, 3),
	(29, 1, 6.48, 6.48, 12, 2),
	(30, 1, 15.00, 15.00, 13, 5),
	(31, 1, 10.50, 10.50, 13, 4),
	(32, 1, 0.20, 0.20, 14, 6),
	(33, 1, 15.00, 15.00, 15, 5),
	(34, 1, 10.50, 10.50, 15, 4),
	(35, 1, 7.50, 7.50, 16, 13),
	(36, 1, 4.50, 4.50, 16, 14),
	(37, 1, 6.50, 6.50, 16, 15),
	(39, 1, 6.48, 6.48, 17, 2),
	(40, 1, 18.59, 18.59, 17, 3),
	(41, 1, 15.00, 15.00, 17, 5);

-- Volcando estructura para tabla sistema_ventas_db.movimiento_inventarios
CREATE TABLE IF NOT EXISTS `movimiento_inventarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `motivo` text DEFAULT NULL,
  `stock_anterior` int(11) NOT NULL,
  `stock_final` int(11) NOT NULL,
  `tipo_movimiento` varchar(20) NOT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `producto_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_mov_fecha` (`fecha`),
  KEY `idx_mov_producto` (`producto_id`),
  KEY `idx_mov_tipo` (`tipo_movimiento`),
  CONSTRAINT `FKa9sd6fl88v6ixrt3u15j1091o` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.movimiento_inventarios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla sistema_ventas_db.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `stock` int(11) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `codigo_barras` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `url_imagen` text DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `categoria_id` int(11) DEFAULT NULL,
  `proveedor_id` bigint(20) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `perecible` bit(1) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_productos_codigo_barras` (`codigo_barras`),
  KEY `fk_productos_categorias` (`categoria_id`),
  KEY `FK4s80lxlx2fkci25fcx4r0nbex` (`proveedor_id`),
  CONSTRAINT `FK4s80lxlx2fkci25fcx4r0nbex` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.productos: ~11 rows (aproximadamente)
INSERT INTO `productos` (`id`, `nombre`, `stock`, `precio_venta`, `codigo_barras`, `descripcion`, `url_imagen`, `fecha_creacion`, `categoria_id`, `proveedor_id`, `fecha_vencimiento`, `perecible`, `stock_minimo`) VALUES
	(2, 'Leche Gloria', 997, 6.48, NULL, NULL, 'https://th.bing.com/th/id/OIP.hHWhkRCeY2WK1YEcOBHJhwHaHa?w=165&h=180&c=7&r=0&o=7&pid=1.7&rm=3', '2026-07-16 16:26:32', 3, NULL, NULL, NULL, NULL),
	(3, 'VINO Viña Vieja Malbec', 247, 18.59, NULL, NULL, 'https://tse1.mm.bing.net/th/id/OIP.5r-F0WbvOBFeRr7jBrH5DQAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', '2026-07-16 16:26:32', 4, NULL, NULL, NULL, NULL),
	(4, 'Gaseosa Inka Cola 2L', 100, 10.50, NULL, NULL, 'https://tse1.mm.bing.net/th/id/OIP.wQMXurIaHF67AFIx-dCaEAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', '2026-07-16 16:26:32', 4, NULL, NULL, NULL, NULL),
	(5, 'Arroz Costeño 5kg', 69, 15.00, NULL, NULL, 'https://th.bing.com/th/id/OIP.QT97kievF42g6ZFzF_J-EgHaHa?w=216&h=216&c=7&r=0&o=7&pid=1.7&rm=3', '2026-07-16 16:26:32', 3, 2, NULL, NULL, NULL),
	(6, 'Caramelo Limon Unitario', 1000, 0.20, NULL, NULL, 'data:image/webp;base64,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', '2026-07-16 16:26:32', 3, NULL, NULL, NULL, NULL),
	(7, 'Shampoo Head & Shoulders', 40, 12.50, NULL, NULL, 'https://th.bing.com/th/id/OIP.0fLAlNjmpQFHQx07ciqqzwHaHa?w=216&h=216&c=7&r=0&o=7&pid=1.7&rm=3', '2026-07-16 16:26:32', 6, NULL, NULL, NULL, NULL),
	(8, 'Jabón Dove', 80, 3.50, NULL, NULL, 'https://th.bing.com/th/id/OIP.fPGrmb8fkFrVL-7ssh4WxwHaHa?w=216&h=216&c=7&r=0&o=7&pid=1.7&rm=3', '2026-07-16 16:26:32', 6, NULL, NULL, NULL, NULL),
	(9, 'Aceite Primor 1L', 60, 8.50, NULL, NULL, 'https://tse1.mm.bing.net/th/id/OIP.Ykc_AnQWv0b9Mn0Yko-ycgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', '2026-07-16 16:26:32', 3, NULL, NULL, NULL, NULL),
	(13, 'Detergente Opal 1kg', 45, 7.50, NULL, NULL, 'https://th.bing.com/th/id/OIP.PFrHykQEeeYr5FMnTLebbAHaHa?w=202&h=202&c=7&r=0&o=7&pid=1.7&rm=3', '2026-07-16 16:26:32', 5, NULL, NULL, NULL, NULL),
	(14, 'Papel Higiénico Elite 4un', 100, 4.50, NULL, NULL, NULL, '2026-07-16 16:26:32', 6, NULL, NULL, NULL, NULL),
	(15, 'Pasta Dental Colgate', 90, 6.50, NULL, NULL, NULL, '2026-07-16 16:26:32', 6, NULL, NULL, NULL, NULL);

-- Volcando estructura para tabla sistema_ventas_db.proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `ultima_orden` date DEFAULT NULL,
  `monto_total` decimal(38,2) DEFAULT NULL,
  `dias_pago` int(11) DEFAULT 0,
  `ruc` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.proveedores: ~2 rows (aproximadamente)
INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`, `direccion`, `categoria`, `email`, `activo`, `ultima_orden`, `monto_total`, `dias_pago`, `ruc`) VALUES
	(1, '2233221233s', 'La Vaca Lechera', '966495094', 'das sd', 'Limpieza', 'davidquispemaucaylle75@gmail.com', 1, NULL, 0.00, 0, NULL),
	(2, 'rut', 'rut', '965415151', 'av. canada', 'Bebidas', 'rut@gmail.com', 1, '2026-07-16', 225.00, 0, '202220202020');

-- Volcando estructura para tabla sistema_ventas_db.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.roles: ~3 rows (aproximadamente)
INSERT INTO `roles` (`id`, `nombre`) VALUES
	(1, 'ADMIN'),
	(2, 'CAJERO'),
	(3, 'ALMACENERO');

-- Volcando estructura para tabla sistema_ventas_db.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_username` (`username`),
  KEY `fk_usuarios_roles` (`rol_id`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.usuarios: ~3 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nombre_completo`, `username`, `password`, `rol_id`, `activo`) VALUES
	(1, 'Administrador Global', 'admin', '$2a$10$fVmZG99c9W8hIQlWqSzpu.zyZqyFXAZ2ikSCpLTXEZRu5Ruq8DYFC', 1, 1),
	(2, 'David Quispe Maucaylle', 'david', '$2a$10$FyN52Qwwr7dAZORQ8/riouF9DVawtZrxFzt2pP5zQZFbozvkNS/RC', 2, 1),
	(3, 'Bellido', 'bellido', '$2a$10$5vT8K2aaWWvb1UQ.kzeFIuB5so/dghksfeSGTonPzhaKjZtAaXr0W', 3, 1);

-- Volcando estructura para tabla sistema_ventas_db.ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_venta` timestamp NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `tipo_comprobante` varchar(20) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `codigo_venta` varchar(255) DEFAULT NULL,
  `descuento` decimal(38,2) DEFAULT NULL,
  `estado` varchar(255) NOT NULL,
  `fecha_anulacion` datetime(6) DEFAULT NULL,
  `metodo_pago` varchar(255) DEFAULT NULL,
  `monto_cambio` decimal(38,2) DEFAULT NULL,
  `monto_entregado` decimal(38,2) DEFAULT NULL,
  `motivo_anulacion` text DEFAULT NULL,
  `numero_referencia` varchar(255) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `usuario_anulacion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ventas_usuarios` (`usuario_id`),
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla sistema_ventas_db.ventas: ~17 rows (aproximadamente)
INSERT INTO `ventas` (`id`, `fecha_venta`, `total`, `tipo_comprobante`, `usuario_id`, `codigo_venta`, `descuento`, `estado`, `fecha_anulacion`, `metodo_pago`, `monto_cambio`, `monto_entregado`, `motivo_anulacion`, `numero_referencia`, `subtotal`, `usuario_anulacion`) VALUES
	(1, '2026-01-11 06:49:32', 3899.00, 'FACTURA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2, '2026-01-11 07:29:23', 3899.00, 'FACTURA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(3, '2026-01-11 07:29:52', 3899.00, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(4, '2026-01-11 09:00:06', 3905.48, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(5, '2026-01-11 09:08:27', 3909.50, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(6, '2026-01-11 10:45:01', 3899.00, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(7, '2026-01-11 10:48:26', 3914.00, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(8, '2026-01-11 20:55:02', 7.20, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(9, '2026-01-11 21:51:05', 23.00, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(10, '2026-01-11 23:46:21', 30.69, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(11, '2026-01-11 23:51:43', 1210.00, 'BOLETA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(12, '2026-01-11 23:52:30', 34.07, 'FACTURA', 1, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(13, '2026-01-12 01:06:32', 25.50, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(14, '2026-01-12 01:09:50', 0.20, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(15, '2026-01-12 01:10:12', 25.50, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(16, '2026-01-12 01:13:09', 14.00, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(17, '2026-07-16 17:00:55', 7838.07, 'BOLETA', 2, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

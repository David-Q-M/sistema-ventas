-- Insertar roles de forma segura (verifica si existen antes de insertar)
INSERT INTO roles (nombre) SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');
INSERT INTO roles (nombre) SELECT 'CAJERO' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');
INSERT INTO roles (nombre) SELECT 'ALMACENERO' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ALMACENERO');

-- Borrar usuarios anteriores para evitar duplicados y asegurar la contraseña correcta
DELETE FROM usuarios WHERE username IN ('admin', 'david');

-- Insertar usuarios reseteados
-- Rol ID obtenido dinámicamente para evitar errores si los IDs cambian
INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id) 
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Administrador Principal', true, (SELECT id FROM roles WHERE nombre = 'ADMIN'));

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id) 
VALUES ('david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 'David Cajero', true, (SELECT id FROM roles WHERE nombre = 'CAJERO'));

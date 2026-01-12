-- Insertar roles si no existen
INSERT INTO roles (nombre) VALUES ('ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('CAJERO') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('ALMACENERO') ON CONFLICT DO NOTHING;

-- Borrar usuarios anteriores para evitar duplicados erroneos (opcional, pero util para resetear)
DELETE FROM usuarios WHERE username IN ('admin', 'david');

-- Insertar usuarios con la estructura correcta: nombre_completo en lugar de nombre, y sin email
-- Rol ID 1 asumiendo que es ADMIN
INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id) 
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Administrador Principal', true, (SELECT id FROM roles WHERE nombre = 'ADMIN'));

-- Rol ID 2 asumiendo que es CAJERO
INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id) 
VALUES ('david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 'David Cajero', true, (SELECT id FROM roles WHERE nombre = 'CAJERO'));

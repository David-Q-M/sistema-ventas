-- 1. Insertar ROLES primero (Necesario para la FK de usuarios)
INSERT INTO roles (nombre) VALUES ('ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('CAJERO') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('ALMACENERO') ON CONFLICT DO NOTHING;

-- 2. Insertar USUARIOS con sus Roles
-- Nota: La contraseña 'admin123' encriptada es: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2
-- Asumimos que los IDs de roles son 1=ADMIN, 2=CAJERO, 3=ALMACENERO porque los acabamos de insertar en ese orden
-- o ya existen. Para estar seguros, podríamos usar subselects, pero en arranque inicial IDs serial suelen ser 1,2,3.
-- Usaremos subselects para ser robustos.

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Administrador Principal', true, (SELECT id FROM roles WHERE nombre = 'ADMIN' LIMIT 1))
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 'David Cajero', true, (SELECT id FROM roles WHERE nombre = 'CAJERO' LIMIT 1))
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('fredy', 'fredy', 'Fredy Almacenero', true, (SELECT id FROM roles WHERE nombre = 'ALMACENERO' LIMIT 1))
ON CONFLICT (username) DO NOTHING;

-- Descomentar si se quiere limpiar todo antes (CUIDADO en producción)
-- DELETE FROM usuarios;
-- DELETE FROM roles;
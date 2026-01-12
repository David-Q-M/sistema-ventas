-- Insertar roles (ON CONFLICT para evitar errores si ya existen)
-- Se asume que la tabla roles tiene una restricción UNIQUE en 'nombre' (definida en el esquema)
-- Si no la tiene, el ON CONFLICT (nombre) fallaría. En bdsistema-ventas.sql no definimos UNIQUE explícito en nombre
-- pero podemos usar WHERE NOT EXISTS como fallback seguro si no confiamos en la constraint.
-- Sin embargo, para PostgreSQL es mejor tener la constraint.
-- En el script bdsistema-ventas.sql: CREATE TABLE roles ... nombre VARCHAR(20) NOT NULL ... 
-- No hay UNIQUE en nombre. Vamos a usar WHERE NOT EXISTS que es universal.

INSERT INTO roles (nombre) SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');
INSERT INTO roles (nombre) SELECT 'CAJERO' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');
INSERT INTO roles (nombre) SELECT 'ALMACENERO' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ALMACENERO');

-- Insertar usuarios
-- Usamos ON CONFLICT DO NOTHING si hay constraint unique en username (que sí la hay en la tabla usuarios)

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Administrador Principal', true, (SELECT id FROM roles WHERE nombre = 'ADMIN'))
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 'David Cajero', true, (SELECT id FROM roles WHERE nombre = 'CAJERO'))
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuarios (username, password, nombre_completo, activo, rol_id)
VALUES ('fredy', 'fredy', 'Fredy Almacenero', true, (SELECT id FROM roles WHERE nombre = 'ALMACENERO'))
ON CONFLICT (username) DO NOTHING;

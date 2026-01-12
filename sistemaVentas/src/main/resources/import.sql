-- Borrar para evitar errores de duplicado
DELETE FROM usuarios WHERE username IN ('admin', 'david');

-- Insertar usuarios con contraseñas encriptadas (BCrypt)
-- La clave de admin será: admin123
INSERT INTO usuarios (username, password, nombre, email) VALUES ('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Administrador', 'admin@correo.com');
-- La clave de david será: david
INSERT INTO usuarios (username, password, nombre, email) VALUES ('david', '$2a$10$mCUC7W67O0DAnS6S99vprew0E.70LpC6K637A1p2lG.Hh6FmXyI32', 'David', 'david@correo.com');

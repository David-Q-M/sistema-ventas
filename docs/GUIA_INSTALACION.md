# 🛠️ Guía Completa de Instalación y Despliegue - Minimarket Z

Este manual guía paso a paso en la instalación, configuración e inicio del proyecto **Sistema de Ventas** tanto en entornos de desarrollo local como en servidores.

---

## 📋 Requisitos Previos

Asegúrese de contar con los siguientes elementos instalados en su equipo:

1. **Java Development Kit (JDK) 21**:
   - Descargar de OpenJDK o Eclipse Temurin JDK 21.
   - Verificar instalación ejecutando: `java -version`
2. **Node.js y npm**:
   - Se recomienda Node.js LTS (v18.x o v20.x).
   - Verificar instalación ejecutando: `node -v` y `npm -v`
3. **Gestor de Base de Datos (MariaDB / MySQL Server)**:
   - MariaDB 10.5+ o MySQL 8.0+.
4. **Git**:
   - Para clonar el repositorio.

---

## 🗄️ Paso 1: Configurar la Base de Datos

1. Abra su cliente de base de datos preferido (HeidiSQL, DBeaver, MySQL Workbench o la consola de comandos).
2. Cree la base de datos ejecutando el comando SQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS sistema_ventas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Importe el script SQL ubicado en `bd_sistema-ventas/bdsistema-ventas.sql`:
   ```bash
   mysql -u root -p sistema_ventas_db < bd_sistema-ventas/bdsistema-ventas.sql
   ```

---

## ⚙️ Paso 2: Configuración e Inicio del Backend (Spring Boot)

1. Navegue a la carpeta del backend:
   ```bash
   cd sistemaVentas
   ```
2. Abra el archivo `src/main/resources/application.properties` y ajuste la conexión a la base de datos:
   ```properties
   spring.datasource.url=jdbc:mariadb://localhost:3306/sistema_ventas_db
   spring.datasource.username=root
   spring.datasource.password=SU_CONTRASEÑA
   ```
3. Ejecute la aplicación con Maven Wrapper:
   - **Windows**:
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```
4. El servidor backend iniciará por defecto en el puerto `8080` (`http://localhost:8080`).

---

## 💻 Paso 3: Configuración e Inicio del Frontend (Angular 20)

1. Navegue a la carpeta del frontend:
   ```bash
   cd sistemaventas-frontend
   ```
2. Instale las dependencias de Node.js:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo Angular CLI:
   ```bash
   npm start
   # O directamente: ng serve
   ```
4. Ingrese a la aplicación en su navegador web: `http://localhost:4200`

---

## 🔑 Credenciales de Prueba Iniciales

Al cargar el script SQL `bdsistema-ventas.sql`, dispondrá de los siguientes usuarios por defecto:

| Usuario | Contraseña | Rol | Descripción |
| :--- | :--- | :--- | :--- |
| `admin` | *(Configurada en BD)* | `ROLE_ADMIN` | Administrador general del sistema |
| `david` | *(Configurada en BD)* | `ROLE_ADMIN` | Administrador principal |
| `bellido` | *(Configurada en BD)* | `ROLE_CAJERO` | Acceso a punto de venta (POS) |

---

## ❓ Solución de Problemas Frecuentes

- **Error de Conexión a la Base de Datos**: Verifique que el servicio de MariaDB/MySQL esté iniciado y que las credenciales en `application.properties` sean correctas.
- **Error CORS al realizar peticiones desde el frontend**: Asegúrese de que el backend esté ejecutándose en el puerto `8080` y la configuración de `SecurityConfig` permita peticiones de `http://localhost:4200`.
- **Cámara no detectada en escáner de código de barras**: Asegúrese de otorgar permisos de cámara en el navegador web al usar `@zxing/ngx-scanner`.

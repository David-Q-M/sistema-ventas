# 🛒 Sistema de Ventas e Inventario - Minimarket Z

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.2.4-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Frontend-Angular%2020-red?logo=angular)](https://angular.dev/)
[![MariaDB](https://img.shields.io/badge/Database-MariaDB%20%2F%20MySQL-blue?logo=mariadb)](https://mariadb.org/)
[![Java](https://img.shields.io/badge/JDK-21-orange?logo=openjdk)](https://openjdk.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Tokens-black?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Sistema integral de gestión de ventas, control de inventario, catálogo por proveedor, registro de compras y punto de venta (POS) optimizado para el minimarket **Minimarket Z**.

---

## 📌 Tabla de Contenidos
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📐 Arquitectura del Sistema](#-arquitectura-del-sistema)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Guía de Instalación y Configuración](#-guía-de-instalación-y-configuración)
- [📡 Principales Endpoints de la API](#-principales-endpoints-de-la-api)
- [📚 Documentación Adicional](#-documentación-adicional)

---

## ✨ Características Principales

### 🛒 1. Punto de Venta (POS) & Ventas
- Registro rápido de ventas con interfaz moderna e interactiva.
- Soporte para escaneo de código de barras mediante cámara o lector óptico (`@zxing/ngx-scanner`).
- Múltiples estrategias de pago: **Efectivo**, **Tarjeta (Débito/Crédito)** y **Billeteras Digitales (Yape / Plin)**.
- Descuento automático e instantáneo en el stock de productos.
- Generación e impresión de tickets/comprobantes de pago en PDF y exportación a Excel.

### 🚚 2. Gestión de Proveedores & Catálogo de Compras
- Registro completo de proveedores (RUC, razón social, contacto, categoría, días de crédito).
- **Catálogo dedicado por proveedor**: filtrado estricto que muestra exclusivamente las categorías y productos pertenecientes al proveedor seleccionado.
- Generación de órdenes de compra con cálculo automático de totales y actualización de stock entrante.

### 📦 3. Control de Inventario & Productos
- Catálogo general de productos con precios de compra/venta, cálculo dinámico de márgenes de ganancia e imágenes.
- Semáforo de alerta de stock mínimo y productos próximos a vencer.
- Registro detallado de movimientos de kardex (Entradas por compra, Salidas por venta, Ajustes).

### 🔐 4. Seguridad & Roles
- Autenticación mediante **JSON Web Tokens (JWT)**.
- Control de acceso basado en roles (ADMINISTRADOR, CAJERO, ALMACENERO).
- Encriptación segura de contraseñas con BCrypt.

---

## 🛠️ Tecnologías Utilizadas

### **Backend**
- **Lenguaje**: Java 21
- **Framework**: Spring Boot 3.2.4
- **Persistencia**: Spring Data JPA / Hibernate
- **Seguridad**: Spring Security + JJWT 0.11.5
- **Base de Datos**: MariaDB / MySQL JDBC Driver
- **Reportes & Documentos**: JasperReports 6.20 & Apache POI 5.2.3 (Excel)
- **Utilidades**: Lombok

### **Frontend**
- **Framework**: Angular 20 (Single Page Application)
- **Estilos**: Bootstrap 5.3 + CSS3 personalizado con modo ejecutivo
- **Gráficos**: Chart.js / ng2-charts 8.0
- **Lector Código de Barras**: ZXing Scanner
- **Exportación PDF/Excel**: jsPDF, jsPDF-AutoTable & SheetJS XLSX

---

## 📐 Arquitectura del Sistema

```
                      +-----------------------------+
                      |   Frontend (Angular 20)    |
                      |  Punto de Venta / Dashboards|
                      +--------------+--------------+
                                     |  HTTP / REST (JSON + JWT)
                                     v
                      +-----------------------------+
                      |   Backend (Spring Boot 3)   |
                      |  Controllers / Security /   |
                      |  Services / Repositories    |
                      +--------------+--------------+
                                     |  JPA / JDBC
                                     v
                      +-----------------------------+
                      |  Database (MariaDB / MySQL) |
                      |   bd_sistema-ventas.sql     |
                      +-----------------------------+
```

---

## 📁 Estructura del Proyecto

```
Sistema-Ventas/
├── bd_sistema-ventas/            # Scripts de Base de Datos SQL
│   └── bdsistema-ventas.sql       # Estructura y datos iniciales (Seeders)
├── docs/                          # Documentación técnica detallada
│   ├── ARQUITECTURA.md            # Diagramas y detalles de arquitectura
│   ├── API_ENDPOINTS.md           # Referencia completa de Endpoints REST
│   └── GUIA_INSTALACION.md        # Manual de instalación paso a paso
├── sistemaVentas/                 # Backend Java Spring Boot
│   ├── src/main/java/com/sistemaVentas/
│   │   ├── business/              # Capa de Servicios
│   │   ├── controller/            # Controladores REST API
│   │   ├── dataaccess/            # Repositorios JPA
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── entity/                # Entidades JPA (ORM)
│   │   ├── security/              # Filtros JWT y Configuración de Seguridad
│   │   └── strategy/              # Patrón Strategy para Métodos de Pago
│   └── pom.xml                    # Dependencias Maven
├── sistemaventas-frontend/        # Frontend Angular 20
│   ├── src/app/
│   │   ├── core/                  # Guards, Interceptores JWT y Servicios Base
│   │   └── features/              # Módulos Funcionales
│   │       ├── auth/              # Login y Autenticación
│   │       ├── compras/           # Formulario y Lista de Compras
│   │       ├── inventario/        # Control de Kardex y Movimientos
│   │       ├── productos/         # Mantenimiento de Productos y Categorías
│   │       ├── proveedores/       # Mantenimiento y Catálogo de Proveedores
│   │       └── ventas/            # POS y Registro de Ventas
│   └── package.json               # Dependencias npm
└── README.md                      # Documentación Principal
```

---

## 🚀 Guía de Instalación y Configuración

### 1. Prerrequisitos
- **Java Development Kit (JDK)** 21 o superior.
- **Node.js** v18+ o v20+ y **npm**.
- **MariaDB** o **MySQL Server** 8.0+.
- **Git**.

### 2. Base de Datos
1. Inicie su servidor MariaDB / MySQL.
2. Cree la base de datos `sistema_ventas_db`.
3. Importe el archivo SQL:
   ```bash
   mysql -u root -p sistema_ventas_db < bd_sistema-ventas/bdsistema-ventas.sql
   ```

### 3. Backend (Spring Boot)
1. Ingrese a la carpeta del backend:
   ```bash
   cd sistemaVentas
   ```
2. Configure las credenciales de la BD en `src/main/resources/application.properties`.
3. Compile y ejecute:
   ```bash
   mvnw spring-boot:run
   ```
   El backend estará disponible en: `http://localhost:8080`

### 4. Frontend (Angular)
1. Ingrese a la carpeta del frontend:
   ```bash
   cd sistemaventas-frontend
   ```
2. Instale las dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo:
   ```bash
   ng serve
   ```
4. Ingrese desde su navegador en: `http://localhost:4200`

---

## 📡 Principales Endpoints de la API

| Módulo | Método | Endpoint | Descripción |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Autenticación y obtención de Token JWT |
| **Productos** | `GET` | `/api/productos` | Obtener todos los productos |
| **Productos** | `POST` | `/api/productos` | Registrar nuevo producto |
| **Proveedores** | `GET` | `/api/proveedores` | Listar proveedores activos |
| **Catálogo** | `GET` | `/api/catalogos/proveedor/{id}` | Obtener productos filtrados por proveedor |
| **Compras** | `POST` | `/api/compras` | Registrar orden de compra e incrementar stock |
| **Ventas** | `POST` | `/api/ventas` | Procesar venta (POS) y decrementar stock |
| **Inventario** | `GET` | `/api/inventario/movimientos` | Consultar historial de movimientos (Kardex) |

---

## 📚 Documentación Adicional

Para más información, consulte los siguientes manuales en el directorio `docs/`:
- 📖 [Arquitectura y Patrones de Diseño](docs/ARQUITECTURA.md)
- 🔌 [Especificación Completa de APIs REST](docs/API_ENDPOINTS.md)
- 🛠️ [Guía Detallada de Instalación y Despliegue](docs/GUIA_INSTALACION.md)

---

## 👨‍💻 Desarrollado por
**David Quispe Maucaylle** - [*GitHub @David-Q-M*](https://github.com/David-Q-M)

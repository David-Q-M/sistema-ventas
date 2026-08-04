# 📐 Arquitectura Técnica del Sistema - Minimarket Z

Este documento detalla la estructura arquitectónica, patrones de diseño y decisiones de ingeniería implementadas en el **Sistema de Ventas e Inventario para Minimarket Z**.

---

## 🏛️ Vista General de Arquitectura

El sistema está diseñado siguiendo una arquitectura limpia y desacoplada de 3 capas:

1. **Capa de Presentación (Frontend)**: Aplicación SPA desarrollada en Angular 20, responsable de la experiencia de usuario, interfaz reactiva, escaneo de código de barras e integración con impresoras de tickets.
2. **Capa de Negocio y Servicios (Backend)**: Servicio REST API construido con Spring Boot 3.2.4 en Java 21, encargado de la validación de reglas de negocio, cálculo de costos, procesamiento de ventas y control de stock.
3. **Capa de Almacenamiento (Base de Datos)**: Base de datos relacional MariaDB / MySQL con esquema optimizado y soporte transaccional para evitar inconsistencias en el kardex.

---

## 🧩 Patrones de Diseño Implementados

### 1. Patrón Strategy (Estrategia de Pagos)
Ubicación: `com.sistemaVentas.strategy`

Para procesar los distintos métodos de pago en el módulo de ventas (POS) sin acoplar la lógica con condicionales `if/else`, se implementó el patrón **Strategy**:
- **`MetodoPagoStrategy`**: Interfaz común que define el contrato `procesarPago(PagoInfoDTO)`.
- **`MetodoPagoEfectivo`**: Calcula el cambio/vuelto y confirma el pago en efectivo.
- **`MetodoPagoTarjeta`**: Valida los datos de voucher/transacción con tarjeta de débito o crédito.
- **`MetodoPagoDigital`**: Procesa transacciones por billeteras digitales como Yape y Plin.
- **`MetodoPagoFactory`**: Factoría que resuelve dinámicamente la estrategia adecuada según la opción seleccionada en la caja.

### 2. Patrón DTO (Data Transfer Object)
Ubicación: `com.sistemaVentas.dto`

Separa estrictamente las entidades del modelo persistente de los datos que viajan sobre la red HTTP:
- `CompraRequestDTO` / `CompraResponseDTO`
- `ProveedorRequestDTO` / `ProveedorResponseDTO`
- `VentaDTO` / `DetalleDTO`
- `CalculoVentaDTO` / `AjusteStockDTO`

### 3. Patrón Repository (Spring Data JPA)
Ubicación: `com.sistemaVentas.dataaccess`

Acceso a datos abstraído mediante interfaces JPA como `ProductoRepository`, `CompraRepository`, `VentaRepository`, `ProveedorRepository` con consultas personalizadas `@Query` para filtrados avanzados por proveedor y alertas de stock.

---

## 🔐 Seguridad y Autenticación (JWT)

- **Filtro de Seguridad**: `JwtTokenFilter` intercepta cada petición HTTP entrante, verifica el encabezado `Authorization: Bearer <TOKEN>` y carga las autoridades en el contexto de Spring Security.
- **Utilidad JWT**: `JwtUtil` se encarga de la firma HS256 y expiración del token.
- **Roles**:
  - `ROLE_ADMIN`: Acceso total a ventas, compras, kardex, proveedores, usuarios y reporte general.
  - `ROLE_CAJERO`: Acceso restricto a la pantalla POS de Ventas y emisión de comprobantes.
  - `ROLE_ALMACENERO`: Acceso a gestión de productos, inventarios y recepción de compras.

---

## 🗄️ Modelo de Datos (Diagrama Entidad-Relación)

Las entidades clave de la base de datos relacional son:
- **`usuarios`** & **`roles`**: Autenticación y permisos.
- **`proveedores`**: Datos de proveedores y condiciones comerciales.
- **`categorias`**: Clasificación de productos.
- **`productos`**: Catálogo con precios, stock, alertas y relación a categorías/proveedores.
- **`compras`** & **`detalle_compras`**: Órdenes de compra de reabastecimiento.
- **`ventas`** & **`detalle_ventas`**: Transacciones del punto de venta POS.
- **`movimientos_inventario`**: Registro Kardex (Entradas, Salidas y Ajustes).

# 🔌 Especificación de Endpoints REST API

Esta guía contiene la documentación de los endpoints expuestos por el backend en **Spring Boot 3**.
Todas las rutas (excepto login) requieren la cabecera: `Authorization: Bearer <JWT_TOKEN>`.

---

## 🔑 1. Autenticación (`/api/auth`)

### `POST /api/auth/login`
Autentica a un usuario y retorna el token JWT.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "admin",
    "rol": "ROLE_ADMIN"
  }
  ```

---

## 🏷️ 2. Productos (`/api/productos`)

### `GET /api/productos`
Retorna el catálogo completo de productos con stock, precios y categorías.

### `GET /api/productos/{id}`
Obtiene el detalle de un producto específico por ID.

### `POST /api/productos`
Crea un nuevo producto en el catálogo.
- **Request Body**:
  ```json
  {
    "nombre": "Leche Gloria Entera 1L",
    "precioCompra": 3.80,
    "precioVenta": 4.50,
    "stock": 100,
    "stockMinimo": 10,
    "categoriaId": 1,
    "proveedorId": 2,
    "codigoBarras": "7750001001011"
  }
  ```

### `PUT /api/productos/{id}`
Actualiza la información de un producto existente.

### `DELETE /api/productos/{id}`
Desactiva o elimina un producto del catálogo.

---

## 🚚 3. Proveedores y Catálogo (`/api/proveedores` & `/api/catalogos`)

### `GET /api/proveedores`
Retorna la lista de todos los proveedores registrados.

### `POST /api/proveedores`
Registra un nuevo proveedor (RUC, contacto, teléfono, dirección).

### `GET /api/catalogos/proveedor/{proveedorId}`
Retorna exclusivamente los productos y categorías pertenecientes al proveedor especificado.

---

## 🛒 4. Compras (`/api/compras`)

### `GET /api/compras`
Listado de todas las órdenes de compra realizadas.

### `POST /api/compras`
Registra una nueva compra a un proveedor e incrementa el stock de los productos incluidos.
- **Request Body**:
  ```json
  {
    "proveedorId": 2,
    "detalles": [
      {
        "productoId": 5,
        "cantidad": 50,
        "precioUnitario": 3.50
      }
    ]
  }
  ```

---

## 💰 5. Ventas (POS) (`/api/ventas`)

### `POST /api/ventas`
Procesa una nueva venta realizada en caja, realiza la reducción de stock y registra la transacción.
- **Request Body**:
  ```json
  {
    "metodoPago": "EFECTIVO",
    "montoRecibido": 50.00,
    "detalles": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 4.50
      }
    ]
  }
  ```

### `GET /api/ventas/{id}/pdf`
Genera el comprobante de venta en formato PDF para impresión o descarga.

---

## 📦 6. Inventario & Kardex (`/api/inventario`)

### `GET /api/inventario/movimientos`
Lista el historial completo de entradas, salidas y ajustes de productos.

### `GET /api/inventario/alertas-vencimiento`
Retorna los productos que se encuentran dentro del periodo de alerta de vencimiento.

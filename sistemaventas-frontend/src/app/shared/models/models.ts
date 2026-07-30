export interface Rol {
    id: number;
    nombre: string;
}

export interface Usuario {
    id?: number;
    nombreCompleto: string;
    username: string;
    password?: string; // Optional for updates
    rol: Rol;
    activo: boolean;
}

export interface Categoria {
    id: number;
    nombre: string;
}

export interface Producto {
    id?: number;
    codigoBarras?: string;
    nombre: string;
    descripcion?: string;
    stock: number;
    precioVenta: number;
    urlImagen: string;
    categoria?: Categoria;
    proveedor?: Proveedor;
    fechaCreacion?: string;
}

export interface DetalleVenta {
    id?: number;
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

export interface Venta {
    id?: number;
    codigoVenta?: string;
    usuario: Usuario;
    fechaVenta: string;
    total: number;
    subtotal?: number;
    descuento?: number;
    tipoComprobante: string;
    metodoPago?: 'EFECTIVO' | 'TARJETA' | 'DIGITAL';
    montoEntregado?: number;
    montoCambio?: number;
    numeroReferencia?: string;
    estado?: 'COMPLETADA' | 'ANULADA';
    fechaAnulacion?: string;
    motivoAnulacion?: string;
    usuarioAnulacion?: string;
    detalles: DetalleVenta[];
}

export interface AuthResponse {
    token: string;
    rol: string;
    id: string;
}

export interface UsuarioDTO {
    id?: number;
    nombreCompleto: string;
    username: string;
    password?: string;
    rolNombre: string;
    activo: boolean;
}

export interface DetalleDTO {
    productoId: number;
    cantidad: number;
}

export interface VentaDTO {
    usuarioId: number;
    tipoComprobante: string;
    productos: DetalleDTO[];
    metodoPago?: 'EFECTIVO' | 'TARJETA' | 'DIGITAL';
    montoEntregado?: number;
    numeroReferencia?: string;
    tipoDescuento?: 'PORCENTAJE' | 'MONTO';
    valorDescuento?: number;
    clienteNombre?: string;
    clienteDocumento?: string;
    clienteDireccion?: string;
}

export interface Proveedor {
    id?: number;
    nombre: string;
    ruc?: string;
    contacto?: string;
    telefono?: string;
    direccion?: string;
    categoria?: string;
    email?: string;
    activo: boolean;
    ultimaOrden?: string;
    montoTotal?: number;
    diasPago?: number;
}

export interface DetalleCompra {
    id?: number;
    producto: Producto;
    cantidad: number;
    precioCosto: number;
    subtotal: number;
    observacion?: string;
}

export interface Compra {
    id?: number;
    codigo?: string;
    proveedor: Proveedor;
    fechaPedido: string;
    fechaEntrega?: string;
    metodoPedido?: string;
    estadoPago?: string;
    montoTotal: number;
    estado: 'PENDIENTE' | 'RECIBIDO' | 'CANCELADO';
    observacion?: string;
    detalles: DetalleCompra[];
}

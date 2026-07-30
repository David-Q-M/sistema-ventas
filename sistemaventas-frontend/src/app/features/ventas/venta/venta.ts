import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../../core/services/venta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto, DetalleDTO, VentaDTO, Categoria, Venta } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
    selector: 'app-venta',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './venta.html',
    styleUrls: ['./venta.css']
})
export class VentaComponent implements OnInit {
    // Catalog State
    categories: Categoria[] = [];
    productos: Producto[] = [];
    filteredProductos: Producto[] = [];
    selectedCategory: Categoria | null = null;
    searchTerm: string = '';

    // Cart State
    carrito: { producto: Producto, cantidad: number, subtotal: number }[] = [];
    subtotalGeneral = 0;
    descuentoCalculado = 0;
    total = 0;

    // Checkout / Payment Modal State (RF31 & POS Workflow)
    showCobroModal = false;

    // Payment Strategy Data (RF31)
    metodoPago: 'EFECTIVO' | 'TARJETA' | 'DIGITAL' = 'EFECTIVO';
    montoEntregado: number | null = null;
    montoCambio: number = 0;
    numeroReferencia: string = '';

    // Discounts & Promotions (RF32)
    tipoDescuento: 'NINGUNO' | 'PORCENTAJE' | 'MONTO' = 'NINGUNO';
    valorDescuento: number | null = null;

    // Transaction Data
    tipoComprobante = 'BOLETA';
    cliente = {
        documento: '',
        nombre: '',
        direccion: ''
    };

    // Sales History & Cancellation (RF30)
    historialVentas: Venta[] = [];
    showHistorialModal = false;
    showAnularModal = false;
    ventaParaAnular: Venta | null = null;
    motivoAnulacion = '';

    // User Role & Clock
    sellerRole: string = '';
    isAdmin = false;
    currentDate = new Date();

    constructor(
        private ventaService: VentaService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private authService: AuthService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private invoiceService: InvoiceService
    ) { }

    ngOnInit() {
        this.loadData();
        this.sellerRole = this.authService.getRole() || 'Vendedor';
        this.isAdmin = this.authService.getRole() === 'ADMIN';

        setInterval(() => {
            this.currentDate = new Date();
        }, 60000);
    }

    loadData() {
        this.loadingService.show();

        this.categoriaService.getAll().subscribe({
            next: (cats) => this.categories = cats,
            error: () => this.toastService.show('Error al cargar categorías', 'error')
        });

        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
                this.filterProducts();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar catálogo de productos', 'error');
            }
        });
    }

    filterProducts() {
        let temp = this.productos;

        if (this.selectedCategory) {
            temp = temp.filter(p => p.categoria?.id === this.selectedCategory?.id);
        }

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            temp = temp.filter(p =>
                p.nombre.toLowerCase().includes(term) ||
                (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term))
            );
        }

        this.filteredProductos = temp;
    }

    selectCategory(cat: Categoria | null) {
        this.selectedCategory = cat;
        this.filterProducts();
    }

    onSearch() {
        this.filterProducts();
    }

    // Cart Actions
    agregarAlCarrito(producto: Producto) {
        const precio = Number(producto.precioVenta);
        const item = this.carrito.find(i => i.producto.id === producto.id);

        if (item) {
            if (item.cantidad < producto.stock) {
                item.cantidad++;
                item.subtotal = Number((item.cantidad * precio).toFixed(2));
                this.toastService.show('Cantidad +1', 'success');
            } else {
                this.toastService.show('Stock insuficiente para este producto', 'error');
            }
        } else {
            if (producto.stock > 0) {
                this.carrito.push({ producto, cantidad: 1, subtotal: precio });
                this.toastService.show('Producto agregado al carrito', 'success');
            } else {
                this.toastService.show('Producto sin stock disponible', 'error');
            }
        }
        this.calcularTotales();
    }

    updateQuantity(index: number, change: number) {
        const item = this.carrito[index];
        const newQty = item.cantidad + change;

        if (newQty > 0 && newQty <= item.producto.stock) {
            item.cantidad = newQty;
            item.subtotal = Number((item.cantidad * Number(item.producto.precioVenta)).toFixed(2));
            this.calcularTotales();
        } else if (newQty > item.producto.stock) {
            this.toastService.show('No hay suficiente stock en inventario', 'error');
        }
    }

    eliminarDelCarrito(index: number) {
        this.carrito.splice(index, 1);
        this.calcularTotales();
    }

    // RF32: Motor de cálculo de precios y descuentos en tiempo real
    calcularTotales() {
        this.subtotalGeneral = Number(this.carrito.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2));
        let desc = 0;

        if (this.tipoDescuento === 'PORCENTAJE' && this.valorDescuento && this.valorDescuento > 0) {
            const pct = Math.min(this.valorDescuento, 50); // Máx 50%
            desc = Number(((this.subtotalGeneral * pct) / 100).toFixed(2));
        } else if (this.tipoDescuento === 'MONTO' && this.valorDescuento && this.valorDescuento > 0) {
            desc = Number(Math.min(this.valorDescuento, this.subtotalGeneral - 0.01).toFixed(2));
        }

        this.descuentoCalculado = desc;
        this.total = Number((this.subtotalGeneral - this.descuentoCalculado).toFixed(2));

        this.calcularCambioEfectivo();
    }

    // RF31: CÓBRO MODAL WORKFLOW
    openCobroModal() {
        if (this.carrito.length === 0) {
            this.toastService.show('Debe añadir al menos un producto al carrito para registrar la venta', 'error');
            return;
        }

        // Preparar valores por defecto para el modal de pago
        this.metodoPago = 'EFECTIVO';
        this.montoEntregado = this.total;
        this.numeroReferencia = '';
        this.calcularCambioEfectivo();

        this.showCobroModal = true;
    }

    closeCobroModal() {
        this.showCobroModal = false;
    }

    // RF31: Cálculo de Vuelto para Estrategia Efectivo
    calcularCambioEfectivo() {
        if (this.metodoPago === 'EFECTIVO' && this.montoEntregado && this.montoEntregado >= this.total) {
            this.montoCambio = Number((this.montoEntregado - this.total).toFixed(2));
        } else {
            this.montoCambio = 0;
        }
    }

    setMontoEntregadoRapido(monto: number) {
        this.montoEntregado = monto;
        this.calcularCambioEfectivo();
    }

    onMetodoPagoChange() {
        if (this.metodoPago !== 'EFECTIVO') {
            this.montoEntregado = null;
            this.montoCambio = 0;
        } else {
            this.montoEntregado = this.total;
            this.calcularCambioEfectivo();
        }
    }

    // Processing Venta Final (Confirmar en Modal)
    confirmarCobro() {
        if (this.carrito.length === 0) {
            this.toastService.show('El carrito de compras está vacío', 'error');
            return;
        }

        if (this.tipoComprobante === 'FACTURA') {
            if (!this.cliente.documento || !this.cliente.nombre) {
                this.toastService.show('Para FACTURA, RUC y Razón Social son obligatorios', 'error');
                return;
            }
        }

        // RF31 Validaciones según Strategy seleccionada en el Modal
        if (this.metodoPago === 'EFECTIVO') {
            if (!this.montoEntregado || this.montoEntregado < this.total) {
                this.toastService.show(`Monto entregado insuficiente. Total venta: S/ ${this.total}`, 'error');
                return;
            }
        } else if (this.metodoPago === 'TARJETA' || this.metodoPago === 'DIGITAL') {
            if (!this.numeroReferencia || !this.numeroReferencia.trim()) {
                const label = this.metodoPago === 'TARJETA' ? 'número de voucher/tarjeta' : 'número de operación digital (Yape/Plin)';
                this.toastService.show(`El ${label} es obligatorio`, 'error');
                return;
            }
        }

        const userId = this.authService.getUserId();
        if (!userId) {
            this.toastService.show('Error: Sesión no válida', 'error');
            return;
        }

        const detalles: DetalleDTO[] = this.carrito.map(item => ({
            productoId: item.producto.id!,
            cantidad: item.cantidad
        }));

        const ventaDto: VentaDTO = {
            usuarioId: userId,
            tipoComprobante: this.tipoComprobante,
            productos: detalles,
            metodoPago: this.metodoPago,
            montoEntregado: this.montoEntregado || undefined,
            numeroReferencia: this.numeroReferencia || undefined,
            tipoDescuento: this.tipoDescuento !== 'NINGUNO' ? this.tipoDescuento : undefined,
            valorDescuento: (this.tipoDescuento !== 'NINGUNO' && this.valorDescuento) ? this.valorDescuento : undefined,
            clienteNombre: this.cliente.nombre,
            clienteDocumento: this.cliente.documento,
            clienteDireccion: this.cliente.direccion
        };

        this.loadingService.show();
        this.ventaService.registrarVenta(ventaDto).subscribe({
            next: (res: Venta) => {
                this.loadingService.hide();
                this.toastService.show(`¡Venta ${res.codigoVenta || ''} procesada y emitida con éxito!`, 'success');
                this.generateInvoicePDF(res.id!, ventaDto, res.codigoVenta);
                this.closeCobroModal();
                this.resetForm();
                this.loadData(); // Actualizar catálogo e inventario
            },
            error: (err) => {
                this.loadingService.hide();
                const msg = err.error?.message || err.error || 'Error al procesar la venta';
                this.toastService.show(msg, 'error');
            }
        });
    }

    generateInvoicePDF(ventaId: number, ventaDto: VentaDTO, codigoVenta?: string) {
        const ventaParaPDF: any = {
            ...ventaDto,
            id: ventaId,
            codigoVenta: codigoVenta,
            fecha: new Date(),
            cliente: this.cliente,
            productos: this.carrito.map(c => ({
                productoNombre: c.producto.nombre,
                cantidad: c.cantidad,
                precioUnitario: c.producto.precioVenta,
                subtotal: c.subtotal
            }))
        };

        const vendedorInfo = {
            nombreCompleto: this.sellerRole,
            rol: { nombre: this.sellerRole }
        } as any;

        this.invoiceService.generateInvoice(ventaParaPDF, vendedorInfo, this.total, ventaId);
    }

    resetForm() {
        this.carrito = [];
        this.subtotalGeneral = 0;
        this.descuentoCalculado = 0;
        this.total = 0;
        this.cliente = { documento: '', nombre: '', direccion: '' };
        this.tipoComprobante = 'BOLETA';
        this.metodoPago = 'EFECTIVO';
        this.montoEntregado = null;
        this.montoCambio = 0;
        this.numeroReferencia = '';
        this.tipoDescuento = 'NINGUNO';
        this.valorDescuento = null;
    }

    // RF30: Abrir Historial de Ventas y Anulaciones
    openHistorialModal() {
        this.loadingService.show();
        this.ventaService.getHistorial().subscribe({
            next: (data) => {
                this.historialVentas = data.reverse();
                this.showHistorialModal = true;
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar historial de ventas', 'error');
            }
        });
    }

    closeHistorialModal() {
        this.showHistorialModal = false;
    }

    // RF30: Iniciar modal de anulación transaccional (Sólo ADMIN)
    iniciarAnulacion(venta: Venta) {
        if (venta.estado === 'ANULADA') {
            this.toastService.show('Esta venta ya se encuentra anulada', 'info');
            return;
        }
        this.ventaParaAnular = venta;
        this.motivoAnulacion = '';
        this.showAnularModal = true;
    }

    closeAnularModal() {
        this.showAnularModal = false;
        this.ventaParaAnular = null;
        this.motivoAnulacion = '';
    }

    confirmarAnulacion() {
        if (!this.ventaParaAnular || !this.ventaParaAnular.id) return;
        if (!this.motivoAnulacion || !this.motivoAnulacion.trim()) {
            this.toastService.show('El motivo de anulación es obligatorio para la auditoría', 'error');
            return;
        }

        this.loadingService.show();
        this.ventaService.anularVenta(this.ventaParaAnular.id, { motivo: this.motivoAnulacion.trim() }).subscribe({
            next: () => {
                this.loadingService.hide();
                this.toastService.show('✅ Venta anulada. El stock fue restaurado al inventario.', 'success');
                this.closeAnularModal();
                this.openHistorialModal();
                this.loadData();
            },
            error: (err) => {
                this.loadingService.hide();
                const msg = err.error?.message || err.error || 'Error al anular la venta. Requiere rol ADMIN.';
                this.toastService.show(msg, 'error');
            }
        });
    }
}

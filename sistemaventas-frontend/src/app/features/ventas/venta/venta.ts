import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VentaService } from '../../../core/services/venta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { Producto, DetalleDTO, VentaDTO, Categoria } from '../../../shared/models/models';
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
    total = 0;

    // Transaction Data
    tipoComprobante = 'BOLETA';
    cliente = {
        documento: '',
        nombre: '',
        direccion: ''
    };

    // Metadata
    currentDate = new Date();
    sellerRole: string = '';

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

        // Live clock
        setInterval(() => {
            this.currentDate = new Date();
        }, 60000);
    }

    loadData() {
        this.loadingService.show();

        // Load Categories
        this.categoriaService.getAll().subscribe({
            next: (cats) => this.categories = cats,
            error: () => this.toastService.show('Error al cargar categorías', 'error')
        });

        // Load Products
        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
                this.filterProducts();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar productos', 'error');
            }
        });
    }

    // Filtering Logic
    filterProducts() {
        let temp = this.productos;

        // by Category
        if (this.selectedCategory) {
            temp = temp.filter(p => p.categoria?.id === this.selectedCategory?.id);
        }

        // by Search Term
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
                item.subtotal = item.cantidad * precio;
                this.toastService.show('Cantidad +1', 'success');
            } else {
                this.toastService.show('Stock insuficiente', 'error');
            }
        } else {
            if (producto.stock > 0) {
                this.carrito.push({ producto, cantidad: 1, subtotal: precio });
                this.toastService.show('Producto agregado', 'success');
            } else {
                this.toastService.show('Sin stock', 'error');
            }
        }
        this.calcularTotal();
    }

    updateQuantity(index: number, change: number) {
        const item = this.carrito[index];
        const newQty = item.cantidad + change;

        if (newQty > 0 && newQty <= item.producto.stock) {
            item.cantidad = newQty;
            item.subtotal = item.cantidad * Number(item.producto.precioVenta);
            this.calcularTotal();
        } else if (newQty > item.producto.stock) {
            this.toastService.show('No hay más stock disponible', 'error');
        }
    }

    eliminarDelCarrito(index: number) {
        this.carrito.splice(index, 1);
        this.calcularTotal();
    }

    calcularTotal() {
        this.total = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
    }

    // Processing
    procesarVenta() {
        if (this.carrito.length === 0) return;

        // Validation based on Receipt Type
        if (this.tipoComprobante === 'FACTURA') {
            if (!this.cliente.documento || !this.cliente.nombre) {
                this.toastService.show('Para FACTURA, RUC y Razón Social son obligatorios', 'error');
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

        const venta: VentaDTO = {
            usuarioId: userId,
            tipoComprobante: this.tipoComprobante,
            productos: detalles,
            clienteNombre: this.cliente.nombre,
            clienteDocumento: this.cliente.documento,
            clienteDireccion: this.cliente.direccion
        };

        this.loadingService.show();
        this.ventaService.registrarVenta(venta).subscribe({
            next: (res: any) => {
                this.loadingService.hide();
                this.toastService.show('¡Venta Exitosa!', 'success');
                this.generateInvoicePDF(res.id, venta);
                this.resetForm();
                this.loadData(); // Update stock
            },
            error: (err) => {
                this.loadingService.hide();
                console.error(err);
                this.toastService.show('Error al procesar la venta', 'error');
            }
        });
    }

    generateInvoicePDF(ventaId: number, ventaDto: VentaDTO) {
        // Construct enriched object for PDF
        const ventaParaPDF: any = {
            ...ventaDto,
            id: ventaId,
            fecha: new Date(),
            cliente: this.cliente, // Pass captured client info
            productos: this.carrito.map(c => ({
                productoNombre: c.producto.nombre,
                cantidad: c.cantidad,
                precioUnitario: c.producto.precioVenta,
                subtotal: c.subtotal
            }))
        };

        const vendedorInfo = {
            nombreCompleto: this.sellerRole, // using role as placeholder name if name unavailable
            rol: { nombre: this.sellerRole }
        } as any;

        this.invoiceService.generateInvoice(ventaParaPDF, vendedorInfo, this.total, ventaId);
    }

    resetForm() {
        this.carrito = [];
        this.total = 0;
        this.cliente = { documento: '', nombre: '', direccion: '' };
        this.tipoComprobante = 'BOLETA';
    }
}

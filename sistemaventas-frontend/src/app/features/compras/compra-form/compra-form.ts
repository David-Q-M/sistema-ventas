import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../core/services/compra.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Proveedor, Producto, Categoria, DetalleCompra, Compra } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-compra-form',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './compra-form.html',
    styleUrls: ['./compra-form.css']
})
export class CompraFormComponent implements OnInit {
    proveedores: Proveedor[] = [];
    selectedProveedor: Proveedor | null = null;
    
    productos: Producto[] = [];
    filteredProductos: Producto[] = [];
    categorias: Categoria[] = [];
    
    // Filters & Searches
    selectedCategoriaId: string = '';
    productSearchTerm: string = '';
    
    // Order fields
    detalles: DetalleCompra[] = [];
    montoTotal = 0;
    fechaPedido: string = new Date().toISOString().split('T')[0];
    fechaEntrega: string = '';
    metodoPedidoSeleccionado: string = 'Llamada Telefónica';
    metodoPagoSeleccionado: string = 'Contado';
    observacionGeneral: string = '';

    metodosPedido = ['Llamada Telefónica', 'Correo Electrónico', 'Mensaje WhatsApp', 'Visita Presencial'];
    metodosPago = ['Contado', 'Crédito 30 días', 'Crédito 60 días', 'Transferencia (2 días)'];

    // Dynamic row addition models
    selectedProductoForAdd: Producto | null = null;
    cantidadForAdd: number | null = null;
    precioCostoForAdd: number | null = null;
    observacionForAdd: string = '';

    // Success Modal
    showSuccessModal = false;
    createdCompraInfo: {
        codigo: string;
        montoTotal: number;
        totalUnidades: number;
    } | null = null;

    constructor(
        private compraService: CompraService,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadInitialData();
    }

    loadInitialData() {
        this.loadingService.show();
        
        // Load active suppliers
        this.proveedorService.getAll().subscribe({
            next: (data) => {
                this.proveedores = data.filter(p => p.activo);
                this.loadProductos();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar proveedores', 'error');
            }
        });
    }

    loadProductos() {
        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
                this.filteredProductos = [...this.productos];
                this.loadCategorias();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar productos', 'error');
            }
        });
    }

    loadCategorias() {
        this.categoriaService.getAll().subscribe({
            next: (data) => {
                this.categorias = data;
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar categorías', 'error');
            }
        });
    }

    onProveedorChange() {
        // Find fully loaded supplier detail if needed, or simply assign
        this.selectedProveedor = this.proveedores.find(p => p.id === this.selectedProveedor?.id) || null;
    }

    filterProductos() {
        this.filteredProductos = this.productos.filter(p => {
            const matchesSearch = !this.productSearchTerm.trim() || 
                p.nombre.toLowerCase().includes(this.productSearchTerm.toLowerCase()) ||
                (p.codigoBarras && p.codigoBarras.includes(this.productSearchTerm));
            
            const matchesCat = !this.selectedCategoriaId || 
                (p.categoria && p.categoria.id === Number(this.selectedCategoriaId));
                
            return matchesSearch && matchesCat;
        });
    }

    onProductSelectForAdd(event: any) {
        const prodId = Number(event.target.value);
        this.selectedProductoForAdd = this.productos.find(p => p.id === prodId) || null;
        if (this.selectedProductoForAdd) {
            // Suggest default precio cost as 70% of retail price for instance, or empty
            this.precioCostoForAdd = Number((this.selectedProductoForAdd.precioVenta * 0.75).toFixed(2));
            this.cantidadForAdd = 10;
        } else {
            this.precioCostoForAdd = null;
            this.cantidadForAdd = null;
        }
    }

    addItem() {
        if (!this.selectedProductoForAdd) {
            this.toastService.show('Debe seleccionar un producto', 'error');
            return;
        }
        if (!this.cantidadForAdd || this.cantidadForAdd <= 0) {
            this.toastService.show('La cantidad debe ser mayor a cero', 'error');
            return;
        }
        if (this.precioCostoForAdd === null || this.precioCostoForAdd < 0) {
            this.toastService.show('El precio de costo no puede ser negativo', 'error');
            return;
        }

        // Check if product is already in the list
        const existingIdx = this.detalles.findIndex(d => d.producto.id === this.selectedProductoForAdd!.id);
        const subtotal = Number((this.cantidadForAdd * this.precioCostoForAdd).toFixed(2));

        if (existingIdx > -1) {
            // Update quantity & subtotal
            const d = this.detalles[existingIdx];
            d.cantidad += this.cantidadForAdd;
            d.precioCosto = this.precioCostoForAdd; // use latest cost
            d.subtotal = Number((d.cantidad * d.precioCosto).toFixed(2));
            d.observacion = this.observacionForAdd || d.observacion;
        } else {
            this.detalles.push({
                producto: this.selectedProductoForAdd,
                cantidad: this.cantidadForAdd,
                precioCosto: this.precioCostoForAdd,
                subtotal: subtotal,
                observacion: this.observacionForAdd
            });
        }

        this.calculateTotal();
        
        // Reset fields
        this.selectedProductoForAdd = null;
        this.cantidadForAdd = null;
        this.precioCostoForAdd = null;
        this.observacionForAdd = '';
        
        // Reset HTML Select value
        const selectElem = document.getElementById('prodAddSelect') as HTMLSelectElement;
        if (selectElem) selectElem.value = '';
    }

    removeItem(index: number) {
        this.detalles.splice(index, 1);
        this.calculateTotal();
    }

    calculateTotal() {
        this.montoTotal = this.detalles.reduce((acc, curr) => acc + curr.subtotal, 0);
    }

    generarPedido() {
        if (!this.selectedProveedor) {
            this.toastService.show('Debe seleccionar un proveedor', 'error');
            return;
        }
        if (this.detalles.length === 0) {
            this.toastService.show('Debe añadir al menos un producto a la orden', 'error');
            return;
        }

        this.loadingService.show();
        
        const nuevaCompra: Compra = {
            proveedor: this.selectedProveedor,
            fechaPedido: this.fechaPedido,
            fechaEntrega: this.fechaEntrega || undefined,
            metodoPedido: this.metodoPedidoSeleccionado,
            estadoPago: this.metodoPagoSeleccionado,
            montoTotal: this.montoTotal,
            estado: 'RECIBIDO', // Al registrar, se recibe directamente de acuerdo al flujo de las imágenes
            observacion: this.observacionGeneral || undefined,
            detalles: this.detalles
        };

        this.compraService.create(nuevaCompra).subscribe({
            next: (res) => {
                this.loadingService.hide();
                this.createdCompraInfo = {
                    codigo: res.codigo || 'N/A',
                    montoTotal: res.montoTotal,
                    totalUnidades: this.detalles.reduce((acc, curr) => acc + curr.cantidad, 0)
                };
                this.showSuccessModal = true;
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al registrar la compra', 'error');
            }
        });
    }

    irAInventario() {
        this.showSuccessModal = false;
        this.router.navigate(['/productos']);
    }
}

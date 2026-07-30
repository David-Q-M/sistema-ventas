import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService, CompraRequestPayload } from '../../../core/services/compra.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Proveedor, Producto, Categoria, DetalleCompra } from '../../../shared/models/models';
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
    filteredCategorias: Categoria[] = [];
    
    // Loading State
    loadingProductos = false;

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
        
        // Cargar ÚNICAMENTE proveedores activos (RF24 + RF25)
        this.proveedorService.getAll().subscribe({
            next: (data) => {
                this.proveedores = data.filter(p => p.activo);
                this.loadProductos();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar catálogo de proveedores', 'error');
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
                this.updateFilteredCategorias();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar categorías', 'error');
            }
        });
    }

    /**
     * FILTRADO EXCLUSIVO DE CATEGORÍA POR PROVEEDOR:
     * Cuando se selecciona un proveedor que tiene una categoría asignada (ej: "Bebidas"),
     * la lista desplegable se filtra para mostrar ÚNICAMENTE dicha categoría y excluir todas las demás.
     */
    updateFilteredCategorias() {
        if (!this.selectedProveedor) {
            this.filteredCategorias = [...this.categorias];
            this.selectedCategoriaId = '';
            this.filterProductos();
            return;
        }

        const provCatName = (this.selectedProveedor.categoria || '').trim().toLowerCase();

        // 1. Coincidencia prioritaria por el campo 'categoria' del proveedor seleccionado
        if (provCatName) {
            const matchingBySupplierCat = this.categorias.filter(c => {
                const catName = c.nombre.trim().toLowerCase();
                return catName === provCatName || catName.includes(provCatName) || provCatName.includes(catName);
            });

            if (matchingBySupplierCat.length > 0) {
                this.filteredCategorias = matchingBySupplierCat;
                // Seleccionar automáticamente la categoría única del proveedor
                this.selectedCategoriaId = String(matchingBySupplierCat[0].id);
                this.filterProductos();
                return;
            }
        }

        // 2. Si no hay string de categoría directo, filtrar por las categorías de los productos vinculados al proveedor
        const productCategoryIds = new Set<number>(
            this.productos
                .filter(p => !!p.categoria && p.categoria.id !== undefined)
                .map(p => p.categoria!.id!)
        );

        const matchingByProducts = this.categorias.filter(c => productCategoryIds.has(c.id));

        if (matchingByProducts.length > 0) {
            this.filteredCategorias = matchingByProducts;
            if (matchingByProducts.length === 1) {
                this.selectedCategoriaId = String(matchingByProducts[0].id);
            } else {
                this.selectedCategoriaId = '';
            }
        } else {
            // Respaldar con la lista global si el proveedor no tiene categoría registrada
            this.filteredCategorias = [...this.categorias];
            this.selectedCategoriaId = '';
        }

        this.filterProductos();
    }

    onProveedorChange() {
        const provId = this.selectedProveedor?.id ? Number(this.selectedProveedor.id) : null;
        this.selectedProveedor = this.proveedores.find(p => p.id === provId) || null;

        // Reiniciar carrito si se cambia el proveedor
        if (this.detalles.length > 0) {
            this.detalles = [];
            this.calculateTotal();
            this.toastService.show('⚠️ Se cambió de proveedor: El carrito se ha limpiado para evitar inconsistencias.', 'info');
        }

        // Filtrado dinámico relacional por proveedorId
        if (provId) {
            this.loadingProductos = true;
            this.productoService.getByProveedor(provId).subscribe({
                next: (prodsFiltrados) => {
                    this.loadingProductos = false;
                    if (prodsFiltrados && prodsFiltrados.length > 0) {
                        this.productos = prodsFiltrados;
                    } else {
                        this.loadProductosGenerales();
                    }
                    this.updateFilteredCategorias();
                },
                error: () => {
                    this.loadingProductos = false;
                    this.loadProductosGenerales();
                }
            });
        } else {
            this.loadProductosGenerales();
        }
    }

    loadProductosGenerales() {
        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
                this.updateFilteredCategorias();
            }
        });
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
            this.precioCostoForAdd = Number((this.selectedProductoForAdd.precioVenta * 0.75).toFixed(2));
            this.cantidadForAdd = 10;
        } else {
            this.precioCostoForAdd = null;
            this.cantidadForAdd = null;
        }
    }

    addItem() {
        if (!this.selectedProductoForAdd) {
            this.toastService.show('Debe seleccionar un producto del catálogo', 'error');
            return;
        }
        if (!this.cantidadForAdd || this.cantidadForAdd <= 0) {
            this.toastService.show('La cantidad debe ser mayor a cero', 'error');
            return;
        }
        if (this.precioCostoForAdd === null || this.precioCostoForAdd <= 0) {
            this.toastService.show('El precio de costo debe ser mayor a cero', 'error');
            return;
        }

        const existingIdx = this.detalles.findIndex(d => d.producto.id === this.selectedProductoForAdd!.id);
        const subtotal = Number((this.cantidadForAdd * this.precioCostoForAdd).toFixed(2));

        if (existingIdx > -1) {
            const d = this.detalles[existingIdx];
            d.cantidad += this.cantidadForAdd;
            d.precioCosto = this.precioCostoForAdd;
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
        
        const selectElem = document.getElementById('prodAddSelect') as HTMLSelectElement;
        if (selectElem) selectElem.value = '';
    }

    removeItem(index: number) {
        this.detalles.splice(index, 1);
        this.calculateTotal();
    }

    calculateTotal() {
        this.montoTotal = Number(this.detalles.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2));
    }

    /**
     * RF25, RF26, RF27: Envío del Payload DTO Anidado y Validación de Fechas.
     */
    generarPedido() {
        if (!this.selectedProveedor || !this.selectedProveedor.id) {
            this.toastService.show('Debe seleccionar un proveedor activo de la lista', 'error');
            return;
        }
        if (!this.selectedProveedor.activo) {
            this.toastService.show('El proveedor seleccionado se encuentra inactivo y no puede recibir compras', 'error');
            return;
        }

        // VALIDACIÓN TEMPORAL DE FECHAS (FECHA ENTREGA >= FECHA PEDIDO)
        if (this.fechaEntrega && this.fechaPedido && this.fechaEntrega < this.fechaPedido) {
            this.toastService.show('⚠️ La fecha de entrega debe ser igual o posterior a la fecha del pedido.', 'error');
            return;
        }

        if (this.detalles.length === 0) {
            this.toastService.show('Debe añadir al menos un producto a la orden de compra', 'error');
            return;
        }

        this.loadingService.show();
        
        const payload: CompraRequestPayload = {
            proveedorId: this.selectedProveedor.id,
            fechaPedido: this.fechaPedido,
            fechaEntrega: this.fechaEntrega || undefined,
            metodoPedido: this.metodoPedidoSeleccionado,
            estadoPago: this.metodoPagoSeleccionado,
            estado: 'RECIBIDO',
            observacion: this.observacionGeneral || undefined,
            detalles: this.detalles.map(d => ({
                productoId: d.producto.id!,
                cantidad: d.cantidad,
                precioCosto: d.precioCosto,
                observacion: d.observacion
            }))
        };

        this.compraService.create(payload).subscribe({
            next: (res) => {
                this.loadingService.hide();
                this.createdCompraInfo = {
                    codigo: res.codigo || 'N/A',
                    montoTotal: res.montoTotal,
                    totalUnidades: this.detalles.reduce((acc, curr) => acc + curr.cantidad, 0)
                };
                this.showSuccessModal = true;
            },
            error: (err) => {
                this.loadingService.hide();
                const msg = err.error?.message || 'Error al registrar la compra en el servidor';
                this.toastService.show('⚠️ ' + msg, 'error');
            }
        });
    }

    irAInventario() {
        this.showSuccessModal = false;
        this.router.navigate(['/productos']);
    }
}

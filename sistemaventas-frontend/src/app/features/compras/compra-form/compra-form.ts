import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
    imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
    templateUrl: './compra-form.html',
    styleUrls: ['./compra-form.css']
})
export class CompraFormComponent implements OnInit, OnDestroy {
    // Reactive Form Core
    compraForm!: FormGroup;
    private proveedorSubscription?: Subscription;

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

    metodosPedido = ['Llamada Telefónica', 'Correo Electrónico', 'Mensaje WhatsApp', 'Visita Presencial'];
    metodosPago = ['Contado', 'Crédito 30 días', 'Crédito 60 días', 'Transferencia (2 días)'];

    // Dynamic row addition models (Searchable Dropdown support)
    selectedProductoForAdd: Producto | null = null;
    searchProductQuery: string = '';
    showProductDropdown: boolean = false;
    cantidadForAdd: number | null = 10;
    precioCostoForAdd: number | null = null;
    observacionForAdd: string = '';

    // Success Modal
    showSuccessModal = false;
    createdCompraInfo: {
        codigo: string;
        montoTotal: number;
        totalUnidades: number;
        estado: string;
        fechaEntrega?: string;
    } | null = null;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private compraService: CompraService,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private router: Router
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadInitialData();
        this.setupValueChangesSubscriptions();
    }

    ngOnDestroy() {
        if (this.proveedorSubscription) {
            this.proveedorSubscription.unsubscribe();
        }
    }

    private initForm() {
        const today = new Date().toISOString().split('T')[0];
        this.compraForm = this.fb.group({
            proveedorId: ['', [Validators.required]],
            fechaPedido: [today, [Validators.required]],
            fechaEntrega: [today, [Validators.required]],
            metodoPedido: ['Llamada Telefónica', [Validators.required]],
            estadoPago: ['Contado', [Validators.required]],
            estado: ['PENDIENTE', [Validators.required]], // Default Just-in-Time (PENDIENTE)
            observacion: ['']
        });
    }

    /**
     * Suscripción reactiva valueChanges en selector de Proveedor.
     * Al cambiar el proveedor: dispara carga del catálogo filtrado y limpia productos previos.
     */
    private setupValueChangesSubscriptions() {
        this.proveedorSubscription = this.compraForm.get('proveedorId')?.valueChanges.subscribe(rawId => {
            const provId = rawId ? Number(rawId) : null;
            const nuevoProv = this.proveedores.find(p => p.id === provId) || null;
            
            this.selectedProveedor = nuevoProv;

            // Si el carrito tenía ítems seleccionados, lo limpiamos para evitar mezclar productos de proveedores distintos
            if (this.detalles.length > 0) {
                this.detalles = [];
                this.calculateTotal();
                this.toastService.show('⚠️ Se cambió de proveedor: El carrito de compras se ha limpiado automáticamente.', 'info');
            }

            // Limpiar formulario de adición de producto
            this.resetProductAddForm();

            // Cargar productos exclusivamente del proveedor seleccionado
            if (provId) {
                this.loadingProductos = true;
                this.productoService.getByProveedor(provId).subscribe({
                    next: (prodsFiltrados) => {
                        this.loadingProductos = false;
                        this.productos = prodsFiltrados || [];
                        this.updateFilteredCategorias();
                    },
                    error: () => {
                        this.loadingProductos = false;
                        this.productos = [];
                        this.updateFilteredCategorias();
                    }
                });
            } else {
                this.productos = [];
                this.updateFilteredCategorias();
            }
        });
    }

    loadInitialData() {
        this.loadingService.show();
        
        // Cargar ÚNICAMENTE proveedores activos (RF24 + RF25)
        this.proveedorService.getAll().subscribe({
            next: (data) => {
                this.proveedores = data.filter(p => p.activo);
                this.loadCategorias();
                this.checkQueryParams();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar catálogo de proveedores', 'error');
            }
        });
    }

    private checkQueryParams() {
        const queryProvId = this.route.snapshot.queryParamMap.get('proveedorId');
        if (queryProvId) {
            this.compraForm.patchValue({ proveedorId: Number(queryProvId) });
        }
    }

    loadProductosGenerales() {
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
     * FILTRADO EXCLUSIVO DE CATEGORÍA POR PROVEEDOR
     */
    updateFilteredCategorias() {
        if (!this.selectedProveedor) {
            this.filteredCategorias = [...this.categorias];
            this.selectedCategoriaId = '';
            this.filterProductos();
            return;
        }

        const provCatName = (this.selectedProveedor.categoria || '').trim().toLowerCase();

        if (provCatName) {
            const matchingBySupplierCat = this.categorias.filter(c => {
                const catName = c.nombre.trim().toLowerCase();
                return catName === provCatName || catName.includes(provCatName) || provCatName.includes(catName);
            });

            if (matchingBySupplierCat.length > 0) {
                this.filteredCategorias = matchingBySupplierCat;
                this.selectedCategoriaId = String(matchingBySupplierCat[0].id);
                this.filterProductos();
                return;
            }
        }

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
            this.filteredCategorias = [...this.categorias];
            this.selectedCategoriaId = '';
        }

        this.filterProductos();
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

    // --- Searchable Product Dropdown Methods ---
    onSearchInputFocus() {
        this.showProductDropdown = true;
    }

    onSearchInputChange() {
        this.showProductDropdown = true;
    }

    selectProductForAdd(prod: Producto) {
        this.selectedProductoForAdd = prod;
        this.searchProductQuery = prod.nombre;
        this.precioCostoForAdd = Number((prod.precioVenta * 0.75).toFixed(2));
        if (!this.cantidadForAdd || this.cantidadForAdd <= 0) {
            this.cantidadForAdd = 10;
        }
        this.showProductDropdown = false;
    }

    get filteredDropdownProducts(): Producto[] {
        if (!this.searchProductQuery.trim()) {
            return this.filteredProductos;
        }
        const q = this.searchProductQuery.toLowerCase();
        return this.filteredProductos.filter(p => 
            p.nombre.toLowerCase().includes(q) || 
            (p.codigoBarras && p.codigoBarras.includes(q))
        );
    }

    resetProductAddForm() {
        this.selectedProductoForAdd = null;
        this.searchProductQuery = '';
        this.cantidadForAdd = 10;
        this.precioCostoForAdd = null;
        this.observacionForAdd = '';
        this.showProductDropdown = false;
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

        const existingIdx = this.detalles.findIndex(d => (d.producto?.id || d.productoId) === this.selectedProductoForAdd!.id);
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
        this.resetProductAddForm();
    }

    removeItem(index: number) {
        this.detalles.splice(index, 1);
        this.calculateTotal();
    }

    calculateTotal() {
        this.montoTotal = Number(this.detalles.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2));
    }

    /**
     * Envío del Payload DTO Anidado y Validación Temporal Just-in-Time
     */
    generarPedido() {
        if (this.compraForm.invalid) {
            this.compraForm.markAllAsTouched();
            this.toastService.show('Por favor complete todos los campos obligatorios del formulario', 'error');
            return;
        }

        const formVal = this.compraForm.value;

        if (!this.selectedProveedor || !this.selectedProveedor.id) {
            this.toastService.show('Debe seleccionar un proveedor activo de la lista', 'error');
            return;
        }
        if (!this.selectedProveedor.activo) {
            this.toastService.show('El proveedor seleccionado se encuentra inactivo y no puede recibir compras', 'error');
            return;
        }

        // VALIDACIÓN TEMPORAL DE FECHAS (FECHA ENTREGA >= FECHA PEDIDO)
        if (formVal.fechaEntrega && formVal.fechaPedido && formVal.fechaEntrega < formVal.fechaPedido) {
            this.toastService.show('⚠️ La fecha de entrega debe ser igual o posterior a la fecha del pedido.', 'error');
            return;
        }

        if (this.detalles.length === 0) {
            this.toastService.show('Debe añadir al menos un producto a la orden de compra', 'error');
            return;
        }

        this.loadingService.show();
        
        const payload: CompraRequestPayload = {
            proveedorId: Number(formVal.proveedorId),
            fechaPedido: formVal.fechaPedido,
            fechaEntrega: formVal.fechaEntrega || undefined,
            metodoPedido: formVal.metodoPedido,
            estadoPago: formVal.estadoPago,
            estado: formVal.estado, // PENDIENTE (Just-in-Time) o RECIBIDO
            observacion: formVal.observacion || undefined,
            detalles: this.detalles.map(d => ({
                productoId: (d.producto?.id || d.productoId)!,
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
                    totalUnidades: this.detalles.reduce((acc, curr) => acc + curr.cantidad, 0),
                    estado: res.estado || formVal.estado,
                    fechaEntrega: res.fechaEntrega
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

    irAListadoCompras() {
        this.showSuccessModal = false;
        this.router.navigate(['/compras']);
    }
}

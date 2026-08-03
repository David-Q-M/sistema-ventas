import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CatalogoProveedorService } from '../../../core/services/catalogo-proveedor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Proveedor, Producto, CatalogoProveedor } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
    selector: 'app-proveedor-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './proveedor-detail.html',
    styleUrls: ['./proveedor-detail.css']
})
export class ProveedorDetailComponent implements OnInit {
    proveedor: Proveedor | null = null;
    catalogoItems: CatalogoProveedor[] = [];
    filteredCatalogo: CatalogoProveedor[] = [];
    productosGlobales: Producto[] = [];
    productosFiltradosPorCategoria: Producto[] = [];
    searchTerm: string = '';
    loading = false;

    // Control del Modal de Edición de Proveedor
    showEditProveedorModal: boolean = false;
    isProveedorSubmitted: boolean = false;
    proveedorFormModel: Proveedor = {
        nombre: '',
        ruc: '',
        contacto: '',
        telefono: '',
        direccion: '',
        categoria: '',
        email: '',
        activo: true
    };
    proveedorValidationErrors: {
        nombre?: string;
        ruc?: string;
        email?: string;
        telefono?: string;
        contacto?: string;
    } = {};

    categoriesList: string[] = [
        'Abarrotes',
        'Lácteos',
        'Bebidas',
        'Snacks',
        'Productos de limpieza',
        'Higiene personal',
        'Artículos de primera necesidad'
    ];

    // Modales y Control de Formulario de Catálogo
    showCatalogoModal: boolean = false;
    isEditing: boolean = false;
    isSubmitted: boolean = false;

    // Form Model para Suministro
    catalogoFormModel: CatalogoProveedor = {
        proveedorId: 0,
        productoId: 0,
        precioCosto: 0,
        stockActual: 0,
        stockMinimo: 10,
        fechaVencimiento: '',
        codigoLote: '',
        esActivo: true
    };

    // Objeto para errores de validación específicos por campo
    validationErrors: {
        productoId?: string;
        precioCosto?: string;
        stockActual?: string;
        stockMinimo?: string;
    } = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private catalogoService: CatalogoProveedorService,
        private categoriaService: CategoriaService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private confirmModalService: ConfirmModalService
    ) { }

    ngOnInit() {
        this.loadCategorias();
        const id = this.route.snapshot.paramMap.get('id');
        const autoAdd = this.route.snapshot.queryParamMap.get('autoAdd');
        if (id) {
            const proveedorId = Number(id);
            this.loadProveedorDetail(proveedorId);
            this.loadCatalogoProveedor(proveedorId);
            this.loadProductosGlobales();

            if (autoAdd === 'true') {
                setTimeout(() => {
                    this.abrirModalAgregarSuministro();
                }, 600);
            }
        }
    }

    loadCategorias() {
        this.categoriaService.getAll().subscribe({
            next: (cats) => {
                if (cats && cats.length > 0) {
                    const dbCatNames = cats.map(c => c.nombre);
                    const merged = Array.from(new Set([...dbCatNames, ...this.categoriesList]));
                    this.categoriesList = merged;
                }
            },
            error: (err) => console.error('Error al cargar categorías del sistema:', err)
        });
    }

    loadProveedorDetail(id: number) {
        this.loadingService.show();
        this.loading = true;

        this.proveedorService.getById(id).subscribe({
            next: (prov) => {
                this.proveedor = prov;
                this.updateProductosFiltrados();
                this.loadingService.hide();
                this.loading = false;
            },
            error: () => {
                this.loadingService.hide();
                this.loading = false;
                this.toastService.show('Error al cargar la información del proveedor', 'error');
            }
        });
    }

    loadCatalogoProveedor(proveedorId: number) {
        this.catalogoService.getByProveedor(proveedorId).subscribe({
            next: (items) => {
                this.catalogoItems = items;
                this.filterCatalogo();
            },
            error: () => {
                this.toastService.show('Error al cargar el catálogo de suministros del proveedor', 'error');
            }
        });
    }

    loadProductosGlobales() {
        this.productoService.getAll().subscribe({
            next: (productos) => {
                this.productosGlobales = productos;
                this.updateProductosFiltrados();
            },
            error: () => {
                this.toastService.show('Error al cargar catálogo general de productos', 'error');
            }
        });
    }

    /**
     * Filtra los productos globales para mostrar únicamente aquellos que pertenecen
     * a la categoría asignada al proveedor actual.
     */
    updateProductosFiltrados() {
        if (!this.productosGlobales || this.productosGlobales.length === 0) {
            this.productosFiltradosPorCategoria = [];
            return;
        }

        if (!this.proveedor || !this.proveedor.categoria || !this.proveedor.categoria.trim()) {
            this.productosFiltradosPorCategoria = [...this.productosGlobales];
            return;
        }

        const provCat = this.proveedor.categoria.trim().toLowerCase();

        const matching = this.productosGlobales.filter(p => {
            if (!p.categoria || !p.categoria.nombre) return false;
            const prodCat = p.categoria.nombre.trim().toLowerCase();
            return prodCat === provCat || prodCat.includes(provCat) || provCat.includes(prodCat);
        });

        const others = this.productosGlobales.filter(p => !matching.includes(p));

        // Prioriza productos coincidentes por categoría y añade el resto del catálogo general
        this.productosFiltradosPorCategoria = [...matching, ...others];
    }

    filterCatalogo() {
        if (!this.searchTerm || !this.searchTerm.trim()) {
            this.filteredCatalogo = [...this.catalogoItems];
            return;
        }

        const term = this.searchTerm.toLowerCase().trim();
        this.filteredCatalogo = this.catalogoItems.filter(item =>
            (item.productoNombre && item.productoNombre.toLowerCase().includes(term)) ||
            (item.productoCodigoBarras && item.productoCodigoBarras.toLowerCase().includes(term)) ||
            (item.codigoLote && item.codigoLote.toLowerCase().includes(term)) ||
            (item.productoCategoriaNombre && item.productoCategoriaNombre.toLowerCase().includes(term))
        );
    }

    registrarCompraDirecta() {
        if (this.proveedor && this.proveedor.id) {
            this.router.navigate(['/compras/nuevo'], { queryParams: { proveedorId: this.proveedor.id } });
        }
    }

    // --- MODAL DE EDICIÓN DE PROVEEDOR ---
    abrirModalEditarProveedor() {
        if (!this.proveedor) return;
        this.isProveedorSubmitted = false;
        this.proveedorValidationErrors = {};
        this.proveedorFormModel = { ...this.proveedor };
        this.showEditProveedorModal = true;
    }

    cerrarModalProveedor() {
        this.showEditProveedorModal = false;
        this.isProveedorSubmitted = false;
        this.proveedorValidationErrors = {};
    }

    onlyLettersKey(event: KeyboardEvent): boolean {
        return true;
    }

    onlyNumbersKey(event: KeyboardEvent): boolean {
        const key = event.key;
        if (['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key)) {
            return true;
        }
        if (!/^[0-9]$/.test(key)) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    onProveedorNombreInput() {
        this.onProveedorFieldChange();
    }

    onProveedorContactoInput() {
        this.onProveedorFieldChange();
    }

    onProveedorRucInput() {
        if (this.proveedorFormModel.ruc) {
            this.proveedorFormModel.ruc = this.proveedorFormModel.ruc.replace(/\D/g, '');
        }
        this.onProveedorFieldChange();
    }

    onProveedorTelefonoInput() {
        if (this.proveedorFormModel.telefono) {
            this.proveedorFormModel.telefono = this.proveedorFormModel.telefono.replace(/\D/g, '');
        }
        this.onProveedorFieldChange();
    }

    onProveedorFieldChange() {
        if (this.isProveedorSubmitted) {
            this.validateProveedorForm();
        }
    }

    validateProveedorForm(): boolean {
        this.proveedorValidationErrors = {};
        let isValid = true;

        if (!this.proveedorFormModel.nombre || !this.proveedorFormModel.nombre.trim()) {
            this.proveedorValidationErrors.nombre = 'El nombre o razón social es obligatorio.';
            isValid = false;
        } else if (this.proveedorFormModel.nombre.trim().length < 2) {
            this.proveedorValidationErrors.nombre = 'El nombre debe tener al menos 2 caracteres.';
            isValid = false;
        }

        if (!this.proveedorFormModel.ruc || !this.proveedorFormModel.ruc.trim()) {
            this.proveedorValidationErrors.ruc = 'El número de RUC es obligatorio.';
            isValid = false;
        } else {
            const rucClean = this.proveedorFormModel.ruc.trim();
            if (/\D/.test(rucClean)) {
                this.proveedorValidationErrors.ruc = 'El RUC solo debe contener números. ¡No se permiten letras!';
                isValid = false;
            } else if (rucClean.length !== 11) {
                this.proveedorValidationErrors.ruc = 'El RUC debe contener exactamente 11 dígitos numéricos.';
                isValid = false;
            }
        }

        // Contacto es opcional

        if (this.proveedorFormModel.email && this.proveedorFormModel.email.trim()) {
            const emailClean = this.proveedorFormModel.email.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(emailClean)) {
                this.proveedorValidationErrors.email = 'Ingrese un correo electrónico válido.';
                isValid = false;
            }
        }

        if (this.proveedorFormModel.telefono && this.proveedorFormModel.telefono.trim()) {
            const phoneClean = this.proveedorFormModel.telefono.trim();
            if (/\D/.test(phoneClean)) {
                this.proveedorValidationErrors.telefono = 'El teléfono solo debe contener números.';
                isValid = false;
            } else if (phoneClean.length < 7 || phoneClean.length > 9) {
                this.proveedorValidationErrors.telefono = 'El teléfono debe contener entre 7 y 9 dígitos numéricos.';
                isValid = false;
            }
        }

        return isValid;
    }

    guardarProveedor() {
        this.isProveedorSubmitted = true;
        if (!this.validateProveedorForm()) {
            this.toastService.show('⚠️ Corrija los campos no válidos marcados en rojo', 'error');
            return;
        }

        if (!this.proveedorFormModel.id) return;

        this.loadingService.show();
        this.proveedorService.update(this.proveedorFormModel.id, this.proveedorFormModel).subscribe({
            next: (updated) => {
                this.loadingService.hide();
                this.proveedor = updated;
                this.toastService.show('✅ Datos del proveedor actualizados correctamente', 'success');
                this.cerrarModalProveedor();
                this.updateProductosFiltrados();
            },
            error: (err) => {
                this.loadingService.hide();
                const msg = err.error?.message || 'Error al actualizar la información del proveedor';
                if (msg.toLowerCase().includes('ruc')) {
                    this.proveedorValidationErrors.ruc = msg;
                }
                this.toastService.show('⚠️ ' + msg, 'error');
            }
        });
    }

    // Modal Control: Abrir para Crear Nuevo Suministro
    abrirModalAgregarSuministro() {
        if (!this.proveedor || !this.proveedor.id) return;
        this.isEditing = false;
        this.isSubmitted = false;
        this.validationErrors = {};

        const openModalLogic = () => {
            this.updateProductosFiltrados();

            const initialProdId = (this.productosFiltradosPorCategoria && this.productosFiltradosPorCategoria.length > 0)
                ? this.productosFiltradosPorCategoria[0].id
                : 0;

            const selectedProd = (this.productosFiltradosPorCategoria && this.productosFiltradosPorCategoria.length > 0)
                ? this.productosFiltradosPorCategoria[0]
                : null;

            const defaultPrice = (selectedProd && selectedProd.precioVenta)
                ? Number((selectedProd.precioVenta * 0.75).toFixed(2))
                : 10.00;

            this.catalogoFormModel = {
                proveedorId: this.proveedor!.id!,
                productoId: Number(initialProdId || 0),
                precioCosto: defaultPrice,
                stockActual: 100,
                stockMinimo: 10,
                fechaVencimiento: '',
                codigoLote: '',
                esActivo: true
            };
            this.showCatalogoModal = true;
        };

        if (!this.productosGlobales || this.productosGlobales.length === 0) {
            this.loadingService.show();
            this.productoService.getAll().subscribe({
                next: (prods) => {
                    this.loadingService.hide();
                    this.productosGlobales = prods;
                    openModalLogic();
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al cargar catálogo de productos', 'error');
                }
            });
        } else {
            openModalLogic();
        }
    }

    // Modal Control: Abrir para Editar Suministro Existente
    abrirModalEditarSuministro(item: CatalogoProveedor) {
        this.isEditing = true;
        this.isSubmitted = false;
        this.validationErrors = {};
        this.updateProductosFiltrados();

        const provId = item.proveedorId || (this.proveedor ? this.proveedor.id : 0);
        const prodId = item.productoId || 0;

        // Asegurar que el producto actual esté en la lista filtrada
        if (prodId && !this.productosFiltradosPorCategoria.some(p => p.id === prodId)) {
            const prod = this.productosGlobales.find(p => p.id === prodId);
            if (prod) {
                this.productosFiltradosPorCategoria.push(prod);
            }
        }

        this.catalogoFormModel = {
            id: item.id,
            proveedorId: Number(provId),
            productoId: Number(prodId),
            precioCosto: item.precioCosto,
            stockActual: item.stockActual,
            stockMinimo: item.stockMinimo || 10,
            fechaVencimiento: item.fechaVencimiento ? item.fechaVencimiento.split('T')[0] : '',
            codigoLote: item.codigoLote || '',
            esActivo: item.esActivo !== undefined ? item.esActivo : true
        };
        this.showCatalogoModal = true;
    }

    cerrarModalCatalogo() {
        this.showCatalogoModal = false;
        this.isSubmitted = false;
        this.validationErrors = {};
    }

    onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.cerrarModalCatalogo();
        }
    }

    onProveedorBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.cerrarModalProveedor();
        }
    }

    // --- VALIDACIÓN RIGUROSA DE SUMINISTRO ---
    validateForm(): boolean {
        this.validationErrors = {};
        let isValid = true;

        // 1. Producto ID: Obligatorio en creación
        const prodId = Number(this.catalogoFormModel.productoId);
        if (!prodId || isNaN(prodId) || prodId <= 0) {
            this.validationErrors.productoId = 'Debe seleccionar un producto del catálogo general.';
            isValid = false;
        }

        // 2. Precio Costo: Obligatorio, mayor a cero
        const pCosto = Number(this.catalogoFormModel.precioCosto);
        if (this.catalogoFormModel.precioCosto === null || this.catalogoFormModel.precioCosto === undefined || isNaN(pCosto) || pCosto <= 0) {
            this.validationErrors.precioCosto = 'El precio de costo debe ser un monto numérico mayor a cero (ej. 12.50).';
            isValid = false;
        }

        // 3. Stock Actual: Obligatorio, positivo o cero
        const sActual = Number(this.catalogoFormModel.stockActual);
        if (this.catalogoFormModel.stockActual === null || this.catalogoFormModel.stockActual === undefined || isNaN(sActual) || sActual < 0) {
            this.validationErrors.stockActual = 'El stock actual no puede ser un valor negativo.';
            isValid = false;
        }

        // 4. Stock Mínimo: Positivo o cero
        if (this.catalogoFormModel.stockMinimo !== null && this.catalogoFormModel.stockMinimo !== undefined) {
            const sMin = Number(this.catalogoFormModel.stockMinimo);
            if (isNaN(sMin) || sMin < 0) {
                this.validationErrors.stockMinimo = 'El stock mínimo no puede ser un valor negativo.';
                isValid = false;
            }
        }

        return isValid;
    }

    onProductoChange() {
        this.onFieldChange();
        if (this.catalogoFormModel.productoId) {
            const prodId = Number(this.catalogoFormModel.productoId);
            const selectedProd = this.productosGlobales.find(p => p.id === prodId);
            if (selectedProd) {
                if (!this.catalogoFormModel.precioCosto || this.catalogoFormModel.precioCosto <= 0) {
                    const price = selectedProd.precioVenta ? Number((selectedProd.precioVenta * 0.75).toFixed(2)) : 10.00;
                    this.catalogoFormModel.precioCosto = price;
                }
            }
        }
    }

    onFieldChange() {
        if (this.isSubmitted) {
            this.validateForm();
        }
    }

    guardarSuministro() {
        this.isSubmitted = true;

        if (!this.validateForm()) {
            this.toastService.show('⚠️ Por favor corrija los campos no válidos marcados en rojo', 'error');
            return;
        }

        const payload: any = {
            proveedorId: Number(this.catalogoFormModel.proveedorId || (this.proveedor ? this.proveedor.id : 0)),
            productoId: Number(this.catalogoFormModel.productoId),
            precioCosto: Number(this.catalogoFormModel.precioCosto),
            stockActual: Number(this.catalogoFormModel.stockActual),
            stockMinimo: (this.catalogoFormModel.stockMinimo !== null && this.catalogoFormModel.stockMinimo !== undefined) ? Number(this.catalogoFormModel.stockMinimo) : 10,
            codigoLote: (this.catalogoFormModel.codigoLote && String(this.catalogoFormModel.codigoLote).trim()) ? String(this.catalogoFormModel.codigoLote).trim() : null,
            fechaVencimiento: (this.catalogoFormModel.fechaVencimiento && String(this.catalogoFormModel.fechaVencimiento).trim()) ? String(this.catalogoFormModel.fechaVencimiento).trim() : null,
            esActivo: this.catalogoFormModel.esActivo !== undefined ? this.catalogoFormModel.esActivo : true
        };

        this.loadingService.show();

        if (this.isEditing && this.catalogoFormModel.id) {
            this.catalogoService.actualizar(this.catalogoFormModel.id, payload).subscribe({
                next: () => {
                    this.loadingService.hide();
                    this.toastService.show('✅ Suministro del catálogo actualizado correctamente', 'success');
                    this.cerrarModalCatalogo();
                    if (this.proveedor?.id) {
                        this.loadCatalogoProveedor(this.proveedor.id);
                    }
                },
                error: (err) => {
                    this.loadingService.hide();
                    const msg = err.error?.message || 'Error al actualizar el suministro en el catálogo';
                    this.toastService.show('⚠️ ' + msg, 'error');
                }
            });
        } else {
            // Guardar o actualizar automáticamente si ya existía
            this.catalogoService.guardar(payload).subscribe({
                next: (res) => {
                    this.loadingService.hide();
                    this.toastService.show('✅ Producto asignado al catálogo del proveedor exitosamente', 'success');
                    this.cerrarModalCatalogo();
                    if (this.proveedor?.id) {
                        this.loadCatalogoProveedor(this.proveedor.id);
                    }
                },
                error: (err) => {
                    this.loadingService.hide();
                    const msg = err.error?.message || 'Error al asignar el producto al catálogo';
                    this.toastService.show('⚠️ ' + msg, 'error');
                }
            });
        }
    }

    async toggleEstadoSuministro(item: CatalogoProveedor) {
        if (!item.id) return;
        const nuevoEstado = !item.esActivo;
        const accionText = nuevoEstado ? 'activar' : 'desactivar';

        const confirmed = await this.confirmModalService.confirm({
            title: nuevoEstado ? 'Activar Suministro' : 'Desactivar Suministro',
            message: `¿Deseas ${accionText} el suministro "${item.productoNombre}" del catálogo del proveedor?`,
            detail: nuevoEstado ? 'El suministro volverá a estar disponible para órdenes de compra.' : 'El suministro se desactivará temporalmente.',
            icon: nuevoEstado ? 'bi-eye-fill' : 'bi-eye-slash-fill',
            type: nuevoEstado ? 'info' : 'warning',
            confirmText: nuevoEstado ? 'Sí, Activar' : 'Sí, Desactivar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            this.loadingService.show();
            this.catalogoService.toggleEstado(item.id, nuevoEstado).subscribe({
                next: () => {
                    this.loadingService.hide();
                    this.toastService.show(`✅ Suministro ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
                    if (this.proveedor?.id) {
                        this.loadCatalogoProveedor(this.proveedor.id);
                    }
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al cambiar el estado del suministro', 'error');
                }
            });
        }
    }

    async eliminarSuministro(item?: CatalogoProveedor) {
        const idToDelete = item?.id || (this.isEditing ? this.catalogoFormModel.id : undefined);
        const prodNombre = item?.productoNombre || (this.productosGlobales.find(p => p.id === this.catalogoFormModel.productoId)?.nombre || 'este producto');

        if (!idToDelete) return;

        const confirmed = await this.confirmModalService.confirm({
            title: 'Eliminar Producto del Catálogo',
            message: `¿Estás seguro de eliminar el producto "${prodNombre}" del catálogo de este proveedor?`,
            detail: 'Esta acción removerá el producto de forma permanente de la lista de suministros de este proveedor.',
            icon: 'bi-trash-fill',
            type: 'danger',
            confirmText: 'Sí, Eliminar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            this.loadingService.show();
            this.catalogoService.eliminar(idToDelete).subscribe({
                next: () => {
                    this.loadingService.hide();
                    this.toastService.show('✅ Producto eliminado del catálogo del proveedor exitosamente', 'success');
                    if (this.showCatalogoModal) {
                        this.cerrarModalCatalogo();
                    }
                    if (this.proveedor?.id) {
                        this.loadCatalogoProveedor(this.proveedor.id);
                    }
                },
                error: (err) => {
                    this.loadingService.hide();
                    const msg = err.error?.message || 'Error al eliminar el producto del catálogo';
                    this.toastService.show('⚠️ ' + msg, 'error');
                }
            });
        }
    }
}

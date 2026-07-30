import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, AlertaVencimiento, MovimientoInventario, PageResponse } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../shared/models/models';
import { ToastService } from '../../core/services/toast.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inventario.html',
    styleUrls: ['./inventario.css']
})
export class InventarioComponent implements OnInit {
    activeTab: 'vencimientos' | 'movimientos' | 'ajuste' = 'vencimientos';

    // TAB 1: CONTROL DE VENCIMIENTOS (RF28)
    vencimientos: AlertaVencimiento[] = [];
    filteredVencimientos: AlertaVencimiento[] = [];
    searchVencimientoTerm: string = '';
    filterEstadoAlerta: string = 'TODOS';

    // Summary Counters
    countCriticos = 0;
    countPrecaucion = 0;
    countNormales = 0;

    // TAB 2: HISTORIAL DE MOVIMIENTOS - AUDIT LOG PAGINADO (RF29)
    movimientos: MovimientoInventario[] = [];
    productos: Producto[] = [];
    
    filterProductoId: number | null = null;
    filterTipoMovimiento: string = '';
    filterFechaInicio: string = '';
    filterFechaFin: string = '';

    currentPage: number = 0;
    pageSize: number = 10;
    totalPages: number = 0;
    totalElements: number = 0;

    // TAB 3: AJUSTE MANUAL DE INVENTARIO (AUDITADO)
    selectedProductoAjuste: Producto | null = null;
    nuevoStockAjuste: number | null = null;
    motivoAjuste: string = '';

    constructor(
        private inventarioService: InventarioService,
        private productoService: ProductoService,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadProductosList();
        this.loadVencimientos();
    }

    setTab(tab: 'vencimientos' | 'movimientos' | 'ajuste') {
        this.activeTab = tab;
        if (tab === 'vencimientos') {
            this.loadVencimientos();
        } else if (tab === 'movimientos') {
            this.loadMovimientos();
        }
    }

    loadProductosList() {
        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
            }
        });
    }

    // RF28: Cargar alertas semáforo de vencimientos
    loadVencimientos() {
        this.loadingService.show();
        this.inventarioService.getVencimientos().subscribe({
            next: (data) => {
                this.vencimientos = data;
                this.calculateCounters();
                this.filterVencimientos();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar alertas de vencimiento', 'error');
            }
        });
    }

    calculateCounters() {
        this.countCriticos = this.vencimientos.filter(v => v.estadoAlerta === 'CRITICO').length;
        this.countPrecaucion = this.vencimientos.filter(v => v.estadoAlerta === 'PRECAUCION').length;
        this.countNormales = this.vencimientos.filter(v => v.estadoAlerta === 'NORMAL').length;
    }

    filterVencimientos() {
        this.filteredVencimientos = this.vencimientos.filter(v => {
            const matchesSearch = !this.searchVencimientoTerm.trim() ||
                v.productoNombre.toLowerCase().includes(this.searchVencimientoTerm.toLowerCase()) ||
                (v.codigoBarras && v.codigoBarras.includes(this.searchVencimientoTerm));

            const matchesEstado = this.filterEstadoAlerta === 'TODOS' || v.estadoAlerta === this.filterEstadoAlerta;

            return matchesSearch && matchesEstado;
        });
    }

    // RF29: Cargar Historial de Movimientos Paginado
    loadMovimientos(page: number = 0) {
        this.loadingService.show();
        this.currentPage = page;

        const params: any = {
            page: this.currentPage,
            size: this.pageSize
        };

        if (this.filterProductoId) params.productoId = this.filterProductoId;
        if (this.filterTipoMovimiento) params.tipoMovimiento = this.filterTipoMovimiento;
        if (this.filterFechaInicio) params.fechaInicio = `${this.filterFechaInicio}T00:00:00`;
        if (this.filterFechaFin) params.fechaFin = `${this.filterFechaFin}T23:59:59`;

        this.inventarioService.getMovimientosPaginados(params).subscribe({
            next: (res: PageResponse<MovimientoInventario>) => {
                this.movimientos = res.content;
                this.totalPages = res.totalPages;
                this.totalElements = res.totalElements;
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar el historial de movimientos', 'error');
            }
        });
    }

    resetFiltrosMovimientos() {
        this.filterProductoId = null;
        this.filterTipoMovimiento = '';
        this.filterFechaInicio = '';
        this.filterFechaFin = '';
        this.loadMovimientos(0);
    }

    changePage(newPage: number) {
        if (newPage >= 0 && newPage < this.totalPages) {
            this.loadMovimientos(newPage);
        }
    }

    // TAB 3: Ejecutar Ajuste Manual de Inventario Auditado
    onProductoAjusteSelect(event: any) {
        const id = Number(event.target.value);
        this.selectedProductoAjuste = this.productos.find(p => p.id === id) || null;
        if (this.selectedProductoAjuste) {
            this.nuevoStockAjuste = this.selectedProductoAjuste.stock;
        } else {
            this.nuevoStockAjuste = null;
        }
    }

    guardarAjuste() {
        if (!this.selectedProductoAjuste || !this.selectedProductoAjuste.id) {
            this.toastService.show('Debe seleccionar un producto para ajustar', 'error');
            return;
        }
        if (this.nuevoStockAjuste === null || this.nuevoStockAjuste < 0) {
            this.toastService.show('El nuevo stock debe ser un número igual o mayor a cero', 'error');
            return;
        }
        if (!this.motivoAjuste || !this.motivoAjuste.trim()) {
            this.toastService.show('El motivo del ajuste es obligatorio para la auditoría (RF29)', 'error');
            return;
        }

        if (this.nuevoStockAjuste === this.selectedProductoAjuste.stock) {
            this.toastService.show('El nuevo stock ingresado es idéntico al actual. Sin cambios.', 'info');
            return;
        }

        this.loadingService.show();

        const payload = {
            productoId: this.selectedProductoAjuste.id,
            nuevoStock: this.nuevoStockAjuste,
            motivo: this.motivoAjuste.trim()
        };

        this.inventarioService.ajustarStock(payload).subscribe({
            next: () => {
                this.loadingService.hide();
                this.toastService.show('✅ Stock ajustado y movimiento registrado en auditoría', 'success');
                
                // Reset form
                this.selectedProductoAjuste = null;
                this.nuevoStockAjuste = null;
                this.motivoAjuste = '';
                
                // Reload data
                this.loadProductosList();
                this.setTab('movimientos');
            },
            error: (err) => {
                this.loadingService.hide();
                const msg = err.error?.message || err.error || 'Error al ejecutar el ajuste de inventario';
                this.toastService.show(msg, 'error');
            }
        });
    }
}

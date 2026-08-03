import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../core/services/compra.service';
import { Compra } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
    selector: 'app-compra-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './compra-list.html',
    styleUrls: ['./compra-list.css']
})
export class CompraListComponent implements OnInit {
    compras: Compra[] = [];
    filteredCompras: Compra[] = [];
    searchTerm: string = '';
    selectedEstado: string = '';
    fechaInicio: string = '';
    fechaFin: string = '';

    // Summary KPI Counters
    totalComprasCount: number = 0;
    montoTotalInvertido: number = 0;
    countRecibidos: number = 0;
    countPendientes: number = 0;

    // Modal detail view
    selectedCompraDetalles: Compra | null = null;

    constructor(
        private compraService: CompraService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private confirmModalService: ConfirmModalService
    ) { }

    ngOnInit() {
        this.loadCompras();
    }

    loadCompras() {
        this.loadingService.show();
        this.compraService.getAll().subscribe({
            next: (data) => {
                this.compras = data;
                this.calculateMetrics();
                this.filterList();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar órdenes de compra', 'error');
            }
        });
    }

    calculateMetrics() {
        this.totalComprasCount = this.compras.length;
        this.montoTotalInvertido = this.compras.reduce((sum, c) => sum + (c.montoTotal || 0), 0);
        this.countRecibidos = this.compras.filter(c => c.estado === 'RECIBIDO').length;
        this.countPendientes = this.compras.filter(c => c.estado === 'PENDIENTE').length;
    }

    filterList() {
        this.filteredCompras = this.compras.filter(c => {
            const provNombre = c.proveedorNombre || c.proveedor?.nombre || '';
            const matchesSearch = !this.searchTerm.trim() || 
                (c.codigo && c.codigo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (provNombre && provNombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            const matchesEstado = !this.selectedEstado || c.estado === this.selectedEstado;
            
            let matchesFecha = true;
            if (this.fechaInicio) {
                matchesFecha = matchesFecha && c.fechaPedido >= this.fechaInicio;
            }
            if (this.fechaFin) {
                matchesFecha = matchesFecha && c.fechaPedido <= this.fechaFin;
            }
            
            return matchesSearch && matchesEstado && matchesFecha;
        });
    }

    resetFilters() {
        this.searchTerm = '';
        this.selectedEstado = '';
        this.fechaInicio = '';
        this.fechaFin = '';
        this.filterList();
    }

    showDetails(compra: Compra) {
        this.selectedCompraDetalles = compra;
    }

    closeDetails() {
        this.selectedCompraDetalles = null;
    }

    async changeEstado(compra: Compra, nuevoEstado: string) {
        const isRecibido = nuevoEstado === 'RECIBIDO';
        const accionTexto = isRecibido ? 'marcar como RECIBIDA' : 'CANCELAR';

        const confirmed = await this.confirmModalService.confirm({
            title: isRecibido ? 'Confirmar Recepción de Orden' : 'Confirmar Cancelación',
            message: `¿Estás seguro de ${accionTexto} la orden de compra ${compra.codigo || ''}?`,
            detail: isRecibido ? 'Esto actualizará automáticamente el inventario sumando el stock de cada producto.' : 'La orden pasará a estado cancelado.',
            icon: isRecibido ? 'bi-box-seam-fill' : 'bi-x-circle-fill',
            type: isRecibido ? 'success' : 'danger',
            confirmText: isRecibido ? 'Sí, Marcar Recibido' : 'Sí, Cancelar Orden',
            cancelText: 'Volver'
        });

        if (confirmed) {
            this.loadingService.show();
            this.compraService.updateEstado(compra.id!, nuevoEstado).subscribe({
                next: (updated) => {
                    this.toastService.show(`✅ Estado de la compra actualizado a ${nuevoEstado}`, 'success');
                    if (this.selectedCompraDetalles && this.selectedCompraDetalles.id === compra.id) {
                        this.selectedCompraDetalles = updated;
                    }
                    this.loadCompras();
                },
                error: (err) => {
                    this.loadingService.hide();
                    const msg = err.error?.message || 'Error al actualizar el estado de la compra';
                    this.toastService.show(msg, 'error');
                }
            });
        }
    }

    async procesarEntregasManual() {
        const confirmed = await this.confirmModalService.confirm({
            title: 'Ejecutar Verificación JIT de Entregas',
            message: '¿Deseas procesar inmediatamente todas las compras PENDIENTES con fecha de entrega ocurrida?',
            detail: 'El programador automático (Scheduler) actualizará el inventario y cambiará las órdenes calificadas a estado RECIBIDO.',
            icon: 'bi-clock-history',
            type: 'info',
            confirmText: 'Sí, Ejecutar Ahora',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            this.loadingService.show();
            this.compraService.procesarEntregasPendientes().subscribe({
                next: (res) => {
                    this.loadingService.hide();
                    this.toastService.show(`⚡ ${res.message || 'Procesamiento completado'}`, res.ordenesProcesadas > 0 ? 'success' : 'info');
                    this.loadCompras();
                },
                error: (err) => {
                    this.loadingService.hide();
                    const msg = err.error?.message || 'Error al procesar entregas diferidas';
                    this.toastService.show(`⚠️ ${msg}`, 'error');
                }
            });
        }
    }
}

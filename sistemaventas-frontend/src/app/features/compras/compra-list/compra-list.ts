import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../core/services/compra.service';
import { Compra } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

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

    // Modal detail view
    selectedCompraDetalles: Compra | null = null;

    constructor(
        private compraService: CompraService,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadCompras();
    }

    loadCompras() {
        this.loadingService.show();
        this.compraService.getAll().subscribe({
            next: (data) => {
                this.compras = data;
                this.filterList();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar órdenes de compra', 'error');
            }
        });
    }

    filterList() {
        this.filteredCompras = this.compras.filter(c => {
            const matchesSearch = !this.searchTerm.trim() || 
                (c.codigo && c.codigo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (c.proveedor.nombre && c.proveedor.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            const matchesEstado = !this.selectedEstado || c.estado === this.selectedEstado;
            
            return matchesSearch && matchesEstado;
        });
    }

    showDetails(compra: Compra) {
        this.selectedCompraDetalles = compra;
    }

    closeDetails() {
        this.selectedCompraDetalles = null;
    }

    changeEstado(compra: Compra, nuevoEstado: string) {
        if (confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}? Esto puede afectar el inventario.`)) {
            this.loadingService.show();
            this.compraService.updateEstado(compra.id!, nuevoEstado).subscribe({
                next: (updated) => {
                    this.toastService.show(`Estado de la compra actualizado a ${nuevoEstado}`, 'success');
                    if (this.selectedCompraDetalles && this.selectedCompraDetalles.id === compra.id) {
                        this.selectedCompraDetalles = updated;
                    }
                    this.loadCompras();
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al actualizar el estado de la compra', 'error');
                }
            });
        }
    }
}

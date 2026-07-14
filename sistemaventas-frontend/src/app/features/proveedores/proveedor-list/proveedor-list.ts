import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { Proveedor } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-proveedor-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './proveedor-list.html',
    styleUrls: ['./proveedor-list.css']
})
export class ProveedorListComponent implements OnInit {
    proveedores: Proveedor[] = [];
    filteredProveedores: Proveedor[] = [];
    searchTerm: string = '';

    // Stats
    totalProviders = 0;
    activeCount = 0;
    inactiveCount = 0;

    // Modal control
    showAddModal = false;
    showEditModal = false;
    isEdit = false;

    categoriesList = [
        'Abarrotes',
        'Lácteos',
        'Bebidas',
        'Snacks',
        'Productos de limpieza',
        'Higiene personal',
        'Artículos de primera necesidad'
    ];

    // Form model
    formModel: Proveedor = {
        nombre: '',
        ruc: '',
        contacto: '',
        telefono: '',
        direccion: '',
        categoria: '',
        email: '',
        activo: true
    };

    constructor(
        private proveedorService: ProveedorService,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadProveedores();
    }

    loadProveedores() {
        this.loadingService.show();
        this.proveedorService.getAll().subscribe({
            next: (data) => {
                this.proveedores = data;
                this.filterList();
                this.calculateStats();
                this.loadingService.hide();
            },
            error: () => {
                this.loadingService.hide();
                this.toastService.show('Error al cargar proveedores', 'error');
            }
        });
    }

    filterList() {
        if (!this.searchTerm.trim()) {
            this.filteredProveedores = [...this.proveedores];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredProveedores = this.proveedores.filter(p =>
                p.nombre.toLowerCase().includes(term) ||
                (p.contacto && p.contacto.toLowerCase().includes(term)) ||
                (p.ruc && p.ruc.toLowerCase().includes(term))
            );
        }
    }

    calculateStats() {
        this.totalProviders = this.proveedores.length;
        this.activeCount = this.proveedores.filter(p => p.activo).length;
        this.inactiveCount = this.totalProviders - this.activeCount;
    }

    openAddModal() {
        this.isEdit = false;
        this.formModel = {
            nombre: '',
            ruc: '',
            contacto: '',
            telefono: '',
            direccion: '',
            categoria: this.categoriesList[0],
            email: '',
            activo: true
        };
        this.showAddModal = true;
    }

    openEditModal(proveedor: Proveedor) {
        this.isEdit = true;
        this.formModel = { ...proveedor };
        this.showEditModal = true;
    }

    closeModal() {
        this.showAddModal = false;
        this.showEditModal = false;
    }

    saveProveedor() {
        if (!this.formModel.nombre.trim()) {
            this.toastService.show('El nombre es obligatorio', 'error');
            return;
        }

        this.loadingService.show();
        if (this.isEdit && this.formModel.id) {
            this.proveedorService.update(this.formModel.id, this.formModel).subscribe({
                next: () => {
                    this.toastService.show('Proveedor actualizado correctamente', 'success');
                    this.closeModal();
                    this.loadProveedores();
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al actualizar proveedor', 'error');
                }
            });
        } else {
            this.proveedorService.create(this.formModel).subscribe({
                next: () => {
                    this.toastService.show('Proveedor creado correctamente', 'success');
                    this.closeModal();
                    this.loadProveedores();
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al guardar proveedor', 'error');
                }
            });
        }
    }

    deleteProveedor(id: number) {
        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            this.loadingService.show();
            this.proveedorService.delete(id).subscribe({
                next: () => {
                    this.toastService.show('Proveedor eliminado correctamente', 'success');
                    this.loadProveedores();
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al eliminar proveedor. Verifique que no tenga dependencias.', 'error');
                }
            });
        }
    }
}

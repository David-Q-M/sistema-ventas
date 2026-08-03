import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';

@Component({
    selector: 'app-usuario-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './usuario-list.html',
    styleUrls: ['./usuario-list.css']
})
export class UsuarioListComponent implements OnInit {
    allUsuarios: Usuario[] = [];
    usuarios: Usuario[] = [];

    countTotal = 0;
    countActive = 0;
    countInactive = 0;
    currentFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

    constructor(
        private usuarioService: UsuarioService,
        private toastService: ToastService,
        private confirmModalService: ConfirmModalService
    ) { }

    ngOnInit() {
        this.loadUsuarios();
    }

    loadUsuarios() {
        this.usuarioService.getAll().subscribe({
            next: (data) => {
                this.allUsuarios = data;
                this.calculateCounts();
                this.applyFilter();
            },
            error: () => this.toastService.show('Error al cargar usuarios', 'error')
        });
    }

    calculateCounts() {
        this.countTotal = this.allUsuarios.length;
        this.countActive = this.allUsuarios.filter(u => u.activo).length;
        this.countInactive = this.allUsuarios.filter(u => !u.activo).length;
    }

    setFilter(filter: 'ALL' | 'ACTIVE' | 'INACTIVE') {
        this.currentFilter = filter;
        this.applyFilter();
    }

    applyFilter() {
        if (this.currentFilter === 'ALL') {
            this.usuarios = this.allUsuarios;
        } else if (this.currentFilter === 'ACTIVE') {
            this.usuarios = this.allUsuarios.filter(u => u.activo);
        } else {
            this.usuarios = this.allUsuarios.filter(u => !u.activo);
        }
    }

    async deleteUsuario(id: number) {
        const uObj = this.allUsuarios.find(u => u.id === id);
        const username = uObj ? uObj.username : 'este usuario';

        const confirmed = await this.confirmModalService.confirm({
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de eliminar al usuario "${username}"?`,
            detail: 'Esta acción removerá la cuenta del usuario del sistema.',
            icon: 'bi-person-x-fill',
            type: 'danger',
            confirmText: 'Sí, Eliminar',
            cancelText: 'Cancelar'
        });

        if (confirmed) {
            this.usuarioService.delete(id).subscribe({
                next: () => {
                    this.toastService.show('✅ Usuario eliminado correctamente', 'success');
                    this.loadUsuarios();
                },
                error: () => this.toastService.show('Error al eliminar usuario', 'error')
            });
        }
    }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { UsuarioDTO, Rol } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-usuario-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './usuario-form.html',
    styleUrls: ['./usuario-form.css']
})
export class UsuarioFormComponent implements OnInit {
    usuario: UsuarioDTO = {
        nombreCompleto: '',
        username: '',
        password: '',
        rolNombre: '',
        activo: true
    };
    roles: Rol[] = [];
    isEdit = false;

    constructor(
        private usuarioService: UsuarioService,
        private rolService: RolService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadRoles();
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEdit = true;
            this.loadingService.show();
            this.usuarioService.getById(id).subscribe({
                next: (data) => {
                    this.usuario = {
                        id: data.id,
                        nombreCompleto: data.nombreCompleto,
                        username: data.username,
                        password: '', // Don't show password
                        rolNombre: data.rol.nombre,
                        activo: data.activo
                    };
                    this.loadingService.hide();
                },
                error: (err) => {
                    this.loadingService.hide();
                    this.toastService.show('Error al cargar usuario', 'error');
                    this.router.navigate(['/usuarios']);
                }
            });
        }
    }

    loadRoles() {
        this.rolService.getAll().subscribe({
            next: (data) => this.roles = data,
            error: () => this.toastService.show('Error al cargar roles', 'error')
        });
    }

    onSubmit() {
        if (this.isEdit && !this.usuario.password) {
            delete this.usuario.password;
        }

        this.loadingService.show();
        const request = this.isEdit
            ? this.usuarioService.update(this.usuario.id!, this.usuario)
            : this.usuarioService.create(this.usuario);

        request.subscribe({
            next: () => {
                this.loadingService.hide();
                this.toastService.show(
                    `Usuario ${this.isEdit ? 'actualizado' : 'creado'} con éxito`,
                    'success'
                );
                this.router.navigate(['/usuarios']);
            },
            error: (err) => {
                this.loadingService.hide();
                this.toastService.show('Error al guardar usuario', 'error');
            }
        });
    }
}

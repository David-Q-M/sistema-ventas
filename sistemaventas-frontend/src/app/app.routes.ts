import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { LayoutComponent } from './core/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ProductoListComponent } from './features/productos/producto-list/producto-list';
import { ProductoFormComponent } from './features/productos/producto-form/producto-form';
import { UsuarioListComponent } from './features/usuarios/usuario-list/usuario-list';
import { UsuarioFormComponent } from './features/usuarios/usuario-form/usuario-form';
import { VentaComponent } from './features/ventas/venta/venta';
import { ReportesComponent } from './features/reportes/reportes';
import { authGuard } from './core/guards/auth.guard';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },

            {
                path: 'productos',
                component: ProductoListComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
            },
            {
                path: 'productos/nuevo',
                component: ProductoFormComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
            },
            {
                path: 'productos/editar/:id',
                component: ProductoFormComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
            },

            {
                path: 'usuarios',
                component: UsuarioListComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'usuarios/nuevo',
                component: UsuarioFormComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'usuarios/editar/:id',
                component: UsuarioFormComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },

            {
                path: 'ventas',
                component: VentaComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'CAJERO'] }
            },
            {
                path: 'reportes',
                component: ReportesComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];

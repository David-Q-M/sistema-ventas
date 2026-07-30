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
import { ProveedorListComponent } from './features/proveedores/proveedor-list/proveedor-list';
import { ProveedorDetailComponent } from './features/proveedores/proveedor-detail/proveedor-detail';
import { CompraListComponent } from './features/compras/compra-list/compra-list';
import { CompraFormComponent } from './features/compras/compra-form/compra-form';
import { InventarioComponent } from './features/inventario/inventario';
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
                path: 'inventario',
                component: InventarioComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
            },

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
                path: 'proveedores',
                component: ProveedorListComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'proveedores/detalle/:id',
                component: ProveedorDetailComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },

            {
                path: 'compras',
                component: CompraListComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
            },
            {
                path: 'compras/nuevo',
                component: CompraFormComponent,
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'ALMACENERO'] }
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

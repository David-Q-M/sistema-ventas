import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { Proveedor, Producto } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-proveedor-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './proveedor-detail.html',
    styleUrls: ['./proveedor-detail.css']
})
export class ProveedorDetailComponent implements OnInit {
    proveedor: Proveedor | null = null;
    productosSuministrados: Producto[] = [];
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private proveedorService: ProveedorService,
        private productoService: ProductoService,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProveedorDetail(Number(id));
        }
    }

    loadProveedorDetail(id: number) {
        this.loadingService.show();
        this.loading = true;

        this.proveedorService.getById(id).subscribe({
            next: (prov) => {
                this.proveedor = prov;
                this.loadProductosSuministrados(id);
            },
            error: () => {
                this.loadingService.hide();
                this.loading = false;
                this.toastService.show('Error al cargar detalle del proveedor', 'error');
            }
        });
    }

    loadProductosSuministrados(proveedorId: number) {
        this.productoService.getAll().subscribe({
            next: (allProducts) => {
                this.productosSuministrados = allProducts.filter(
                    p => p.proveedor && p.proveedor.id === proveedorId
                );
                this.loadingService.hide();
                this.loading = false;
            },
            error: () => {
                this.loadingService.hide();
                this.loading = false;
                this.toastService.show('Error al cargar productos del proveedor', 'error');
            }
        });
    }
}

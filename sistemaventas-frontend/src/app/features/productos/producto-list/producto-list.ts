import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Producto, Categoria } from '../../../shared/models/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-producto-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './producto-list.html',
    styleUrls: ['./producto-list.css']
})
export class ProductoListComponent implements OnInit {
    categories: Categoria[] = [];
    productos: Producto[] = [];
    filteredProductos: Producto[] = [];

    searchTerm: string = '';
    viewMode: 'categories' | 'products' | 'search' = 'categories';
    selectedCategory: Categoria | null = null;
    loading = false;

    constructor(
        private productoService: ProductoService,
        private categoriaService: CategoriaService,
        private toastService: ToastService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loadingService.show();
        this.loading = true;

        // Load both categories and products
        // In a real large app, you might want to load products only when a category is selected,
        // but for now we'll load all to keep client-side filtering fast as per current architecture.

        this.categoriaService.getAll().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.loadProductos();
            },
            error: () => {
                this.toastService.show('Error al cargar categorías', 'error');
                this.loadProductos(); // Try loading products anyway
            }
        });
    }

    loadProductos() {
        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data;
                this.loadingService.hide();
                this.loading = false;
            },
            error: () => {
                this.loadingService.hide();
                this.loading = false;
                this.toastService.show('Error al cargar productos', 'error');
            }
        });
    }

    onSearch() {
        if (!this.searchTerm.trim()) {
            this.backToCategories();
            return;
        }

        this.viewMode = 'search';
        this.selectedCategory = null;

        const term = this.searchTerm.toLowerCase();
        this.filteredProductos = this.productos.filter(p =>
            p.nombre.toLowerCase().includes(term) ||
            (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term))
        );
    }

    selectCategory(category: Categoria) {
        this.selectedCategory = category;
        this.viewMode = 'products';
        this.searchTerm = ''; // Clear search when picking category

        this.filteredProductos = this.productos.filter(p =>
            p.categoria?.id === category.id
        );

        if (this.filteredProductos.length === 0) {
            this.toastService.show('No hay productos en esta categoría', 'info');
        }
    }

    backToCategories() {
        this.viewMode = 'categories';
        this.selectedCategory = null;
        this.filteredProductos = [];
    }

    deleteProducto(id: number) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            this.loadingService.show();
            this.productoService.delete(id).subscribe({
                next: () => {
                    this.toastService.show('Producto eliminado', 'success');
                    // Reload but stay in current view
                    this.productoService.getAll().subscribe(data => {
                        this.productos = data;
                        if (this.selectedCategory) {
                            this.selectCategory(this.selectedCategory);
                        }
                        this.loadingService.hide();
                    });
                },
                error: () => {
                    this.loadingService.hide();
                    this.toastService.show('Error al eliminar producto', 'error');
                }
            });
        }
    }
}

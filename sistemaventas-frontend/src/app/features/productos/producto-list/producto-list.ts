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
  displayMode: 'grid' | 'table' = 'grid';
  selectedCategory: Categoria | null = null;
  selectedStockFilter: 'ALL' | 'AVAILABLE' | 'LOW_STOCK' = 'ALL';
  loading = false;

  // KPI Statistics
  totalProductsCount = 0;
  availableCount = 0;
  lowStockCount = 0;

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

    this.categoriaService.getAll().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadProductos();
      },
      error: () => {
        this.toastService.show('Error al cargar categorías', 'error');
        this.loadProductos();
      }
    });
  }

  loadProductos() {
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.calculateStats();
        if (this.viewMode === 'products' && this.selectedCategory) {
          this.selectCategory(this.selectedCategory);
        } else if (this.viewMode === 'search') {
          this.onSearch();
        }
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

  calculateStats() {
    this.totalProductsCount = this.productos.length;
    this.availableCount = this.productos.filter(p => (p.stock || 0) >= 10).length;
    this.lowStockCount = this.productos.filter(p => (p.stock || 0) < 10).length;
  }

  getProductsCountByCategory(catId: number): number {
    return this.productos.filter(p => p.categoria?.id === catId).length;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      if (this.selectedCategory) {
        this.selectCategory(this.selectedCategory);
      } else {
        this.viewMode = 'products';
        this.filteredProductos = [...this.productos];
      }
      return;
    }

    this.viewMode = 'search';
    const term = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term)) ||
      (p.categoria && p.categoria.nombre.toLowerCase().includes(term))
    );
  }

  selectCategory(category: Categoria | null) {
    this.selectedCategory = category;
    this.viewMode = 'products';

    if (category === null) {
      this.filteredProductos = [...this.productos];
    } else {
      this.filteredProductos = this.productos.filter(p =>
        p.categoria?.id === category.id
      );
    }

    this.applyStockFilter();
  }

  setStockFilter(filter: 'ALL' | 'AVAILABLE' | 'LOW_STOCK') {
    this.selectedStockFilter = filter;
    if (this.viewMode === 'categories') {
      this.viewMode = 'products';
      this.selectedCategory = null;
    }
    this.applyStockFilter();
  }

  applyStockFilter() {
    let list = this.selectedCategory
      ? this.productos.filter(p => p.categoria?.id === this.selectedCategory?.id)
      : [...this.productos];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term))
      );
    }

    if (this.selectedStockFilter === 'AVAILABLE') {
      list = list.filter(p => (p.stock || 0) >= 10);
    } else if (this.selectedStockFilter === 'LOW_STOCK') {
      list = list.filter(p => (p.stock || 0) < 10);
    }

    this.filteredProductos = list;
  }

  switchToCategories() {
    this.viewMode = 'categories';
    this.selectedCategory = null;
    this.searchTerm = '';
    this.selectedStockFilter = 'ALL';
  }

  showAllProductsView() {
    this.viewMode = 'products';
    this.selectedCategory = null;
    this.applyStockFilter();
  }

  setDisplayMode(mode: 'grid' | 'table') {
    this.displayMode = mode;
  }

  deleteProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      this.loadingService.show();
      this.productoService.delete(id).subscribe({
        next: () => {
          this.toastService.show('Producto eliminado correctamente', 'success');
          this.loadProductos();
        },
        error: (err) => {
          this.loadingService.hide();
          let mensaje = 'Error al eliminar producto';
          if (err?.error?.message) {
            mensaje = err.error.message;
          } else if (err?.status === 403) {
            mensaje = 'No tienes permisos para eliminar este producto';
          } else if (err?.status === 404) {
            mensaje = 'El producto ya no existe en el sistema';
          }
          this.toastService.show(mensaje, 'error');
        }
      });
    }
  }

}

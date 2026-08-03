import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { ProductoService } from '../../../core/services/producto.service';
import { CatalogoProveedorService } from '../../../core/services/catalogo-proveedor.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Proveedor, Producto, Categoria, CatalogoProveedor } from '../../../shared/models/models';

@Component({
  selector: 'app-catalogo-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogo-proveedor.html',
  styleUrls: ['./catalogo-proveedor.css']
})
export class CatalogoProveedorComponent implements OnInit {
  proveedorId: number = 0;
  proveedor: Proveedor | null = null;
  productosGlobales: Producto[] = [];
  categorias: Categoria[] = [];

  // Pestañas / Modo de asignación: 'select' (Existente) o 'new' (Crear nuevo)
  assignMode: 'select' | 'new' = 'select';
  isSubmitted = false;

  formModel = {
    // Modo selección existente
    productoId: 0,

    // Modo creación de nuevo producto global
    nuevoNombre: '',
    nuevoDescripcion: '',
    nuevoCodigoBarras: '',
    nuevoUrlImagen: '',
    nuevoCategoria: undefined as Categoria | undefined,
    nuevoPrecioVenta: 15.00,
    nuevoPerecible: false,

    // Atributos de Suministro por Proveedor
    precioCosto: 10.00,
    stockActual: 100,
    stockMinimo: 10,
    codigoLote: '',
    fechaVencimiento: '',
    esActivo: true
  };

  validationErrors: {
    productoId?: string;
    nuevoNombre?: string;
    nuevoCategoria?: string;
    precioCosto?: string;
    stockActual?: string;
  } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proveedorService: ProveedorService,
    private productoService: ProductoService,
    private catalogoService: CatalogoProveedorService,
    private categoriaService: CategoriaService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('proveedorId');
    if (id) {
      this.proveedorId = Number(id);
      this.loadProveedorDetail(this.proveedorId);
      this.loadProductosGlobales();
      this.loadCategorias();
    } else {
      this.toastService.show('Identificador de proveedor no especificado', 'error');
      this.router.navigate(['/proveedores']);
    }
  }

  loadProveedorDetail(id: number) {
    this.loadingService.show();
    this.proveedorService.getById(id).subscribe({
      next: (prov) => {
        this.proveedor = prov;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.show('Error al cargar datos del proveedor', 'error');
        this.router.navigate(['/proveedores']);
      }
    });
  }

  loadProductosGlobales() {
    this.productoService.getAll().subscribe({
      next: (prods) => {
        this.productosGlobales = prods || [];
        if (this.productosGlobales.length > 0) {
          this.formModel.productoId = this.productosGlobales[0].id!;
          this.onProductoSelectChange();
        }
      },
      error: () => this.toastService.show('Error al cargar lista de productos', 'error')
    });
  }

  loadCategorias() {
    this.categoriaService.getAll().subscribe({
      next: (cats) => {
        this.categorias = cats || [];
        if (this.categorias.length > 0) {
          this.formModel.nuevoCategoria = this.categorias[0];
        }
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  setAssignMode(mode: 'select' | 'new') {
    this.assignMode = mode;
    this.validationErrors = {};
    this.isSubmitted = false;
  }

  onProductoSelectChange() {
    if (this.formModel.productoId) {
      const prodId = Number(this.formModel.productoId);
      const selected = this.productosGlobales.find(p => p.id === prodId);
      if (selected && selected.precioVenta) {
        this.formModel.precioCosto = Number((selected.precioVenta * 0.75).toFixed(2));
      }
    }
  }

  compareCategorias(c1: Categoria, c2: Categoria): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (this.assignMode === 'select') {
      const pId = Number(this.formModel.productoId);
      if (!pId || isNaN(pId) || pId <= 0) {
        this.validationErrors.productoId = 'Debe seleccionar un producto del catálogo general.';
        isValid = false;
      }
    } else {
      if (!this.formModel.nuevoNombre || !this.formModel.nuevoNombre.trim()) {
        this.validationErrors.nuevoNombre = 'El nombre del producto es obligatorio.';
        isValid = false;
      }
      if (!this.formModel.nuevoCategoria) {
        this.validationErrors.nuevoCategoria = 'Debe seleccionar una categoría para el nuevo producto.';
        isValid = false;
      }
    }

    const pCosto = Number(this.formModel.precioCosto);
    if (this.formModel.precioCosto === null || this.formModel.precioCosto === undefined || isNaN(pCosto) || pCosto <= 0) {
      this.validationErrors.precioCosto = 'El precio de costo debe ser mayor a 0.00';
      isValid = false;
    }

    const sActual = Number(this.formModel.stockActual);
    if (this.formModel.stockActual === null || this.formModel.stockActual === undefined || isNaN(sActual) || sActual < 0) {
      this.validationErrors.stockActual = 'El stock no puede ser un número negativo.';
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (!this.validateForm()) {
      this.toastService.show('⚠️ Complete todos los campos obligatorios requeridos', 'error');
      return;
    }

    this.loadingService.show();

    if (this.assignMode === 'new') {
      // 1. Crear producto nuevo primero en el backend
      const nuevoProductoPayload = {
        nombre: this.formModel.nuevoNombre.trim(),
        descripcion: this.formModel.nuevoDescripcion ? this.formModel.nuevoDescripcion.trim() : undefined,
        codigoBarras: this.formModel.nuevoCodigoBarras ? this.formModel.nuevoCodigoBarras.trim() : undefined,
        categoria: this.formModel.nuevoCategoria,
        precioVenta: Number(this.formModel.nuevoPrecioVenta || (this.formModel.precioCosto * 1.3)),
        stock: Number(this.formModel.stockActual),
        stockMinimo: Number(this.formModel.stockMinimo || 10),
        fechaVencimiento: this.formModel.fechaVencimiento || undefined,
        perecible: this.formModel.nuevoPerecible || !!this.formModel.fechaVencimiento,
        urlImagen: this.formModel.nuevoUrlImagen ? this.formModel.nuevoUrlImagen.trim() : undefined
      } as Producto;

      this.productoService.create(nuevoProductoPayload).subscribe({
        next: (prodCreado) => {
          this.guardarSuministroFinal(prodCreado.id!);
        },
        error: (err) => {
          this.loadingService.hide();
          const msg = err.error?.message || 'Error al crear el producto en el catálogo general';
          this.toastService.show('⚠️ ' + msg, 'error');
        }
      });
    } else {
      // Asignar producto existente
      this.guardarSuministroFinal(Number(this.formModel.productoId));
    }
  }

  private guardarSuministroFinal(productoId: number) {
    const payload = {
      proveedorId: this.proveedorId,
      productoId: productoId,
      precioCosto: Number(this.formModel.precioCosto),
      stockActual: Number(this.formModel.stockActual),
      stockMinimo: Number(this.formModel.stockMinimo || 10),
      codigoLote: this.formModel.codigoLote ? this.formModel.codigoLote.trim() : undefined,
      fechaVencimiento: this.formModel.fechaVencimiento ? this.formModel.fechaVencimiento.trim() : undefined,
      esActivo: true
    } as CatalogoProveedor;

    this.catalogoService.guardar(payload).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.show(`✅ Producto asignado con éxito al catálogo de ${this.proveedor?.nombre}`, 'success');
        this.router.navigate(['/proveedores/detalle', this.proveedorId]);
      },
      error: (err) => {
        this.loadingService.hide();
        const msg = err.error?.message || 'Error al asignar el producto al proveedor';
        this.toastService.show('⚠️ ' + msg, 'error');
      }
    });
  }

  volverADetalle() {
    this.router.navigate(['/proveedores/detalle', this.proveedorId]);
  }
}

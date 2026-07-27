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
  selectedStatusFilter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS' = 'TODOS';
  selectedCategoryFilter: string = '';

  // Stats
  totalProviders = 0;
  activeCount = 0;
  inactiveCount = 0;

  // Modal control
  showAddModal = false;
  showEditModal = false;
  isEdit = false;

  // Form & Validation State
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

  validationErrors: {
    nombre?: string;
    ruc?: string;
    email?: string;
    telefono?: string;
    contacto?: string;
  } = {};

  isSubmitted = false;

  categoriesList = [
    'Abarrotes',
    'Lácteos',
    'Bebidas',
    'Snacks',
    'Productos de limpieza',
    'Higiene personal',
    'Artículos de primera necesidad'
  ];

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
    let list = [...this.proveedores];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.contacto && p.contacto.toLowerCase().includes(term)) ||
        (p.ruc && p.ruc.toLowerCase().includes(term))
      );
    }

    if (this.selectedStatusFilter === 'ACTIVOS') {
      list = list.filter(p => p.activo);
    } else if (this.selectedStatusFilter === 'INACTIVOS') {
      list = list.filter(p => !p.activo);
    }

    if (this.selectedCategoryFilter) {
      list = list.filter(p => p.categoria === this.selectedCategoryFilter);
    }

    this.filteredProveedores = list;
  }

  setStatusFilter(filter: 'TODOS' | 'ACTIVOS' | 'INACTIVOS') {
    this.selectedStatusFilter = filter;
    this.filterList();
  }

  calculateStats() {
    this.totalProviders = this.proveedores.length;
    this.activeCount = this.proveedores.filter(p => p.activo).length;
    this.inactiveCount = this.totalProviders - this.activeCount;
  }

  openAddModal() {
    this.isEdit = false;
    this.isSubmitted = false;
    this.validationErrors = {};
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
    this.isSubmitted = false;
    this.validationErrors = {};
    this.formModel = { ...proveedor };
    this.showEditModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.isSubmitted = false;
    this.validationErrors = {};
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // 1. Nombre validation
    if (!this.formModel.nombre || !this.formModel.nombre.trim()) {
      this.validationErrors.nombre = 'El nombre o razón social es obligatorio.';
      isValid = false;
    } else if (this.formModel.nombre.trim().length < 3) {
      this.validationErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    }

    // 2. RUC validation (11 digits if provided)
    if (this.formModel.ruc && this.formModel.ruc.trim()) {
      const rucClean = this.formModel.ruc.trim();
      if (!/^\d{11}$/.test(rucClean)) {
        this.validationErrors.ruc = 'El RUC debe contener exactamente 11 dígitos numéricos.';
        isValid = false;
      }
    }

    // 3. Email validation
    if (this.formModel.email && this.formModel.email.trim()) {
      const emailClean = this.formModel.email.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailClean)) {
        this.validationErrors.email = 'Ingrese un correo electrónico válido (ej: proveedor@empresa.com).';
        isValid = false;
      }
    }

    // 4. Telefono validation (7 to 9 digits if provided)
    if (this.formModel.telefono && this.formModel.telefono.trim()) {
      const phoneClean = this.formModel.telefono.trim();
      if (!/^\d{7,9}$/.test(phoneClean)) {
        this.validationErrors.telefono = 'El teléfono debe contener entre 7 y 9 dígitos numéricos.';
        isValid = false;
      }
    }

    return isValid;
  }

  onFieldChange() {
    if (this.isSubmitted) {
      this.validateForm();
    }
  }

  saveProveedor() {
    this.isSubmitted = true;
    if (!this.validateForm()) {
      this.toastService.show('Por favor corrija los errores en el formulario', 'error');
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

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

  // --- KEYBOARD & INPUT PREVENTIONS ---

  /**
   * Bloquea en el teclado el ingreso de números (0-9) para campos de Nombre y Contacto.
   */
  onlyLettersKey(event: KeyboardEvent): boolean {
    const key = event.key;
    if (/[0-9]/.test(key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Bloquea en el teclado el ingreso de letras o símbolos para campos de RUC y Teléfono.
   */
  onlyNumbersKey(event: KeyboardEvent): boolean {
    const key = event.key;
    if (['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key)) {
      return true;
    }
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Sanitizadores en tiempo real
  onNombreInput() {
    if (this.formModel.nombre) {
      this.formModel.nombre = this.formModel.nombre.replace(/[0-9]/g, '');
    }
    this.onFieldChange();
  }

  onContactoInput() {
    if (this.formModel.contacto) {
      this.formModel.contacto = this.formModel.contacto.replace(/[0-9]/g, '');
    }
    this.onFieldChange();
  }

  onRucInput() {
    if (this.formModel.ruc) {
      this.formModel.ruc = this.formModel.ruc.replace(/\D/g, '');
    }
    this.onFieldChange();
  }

  onTelefonoInput() {
    if (this.formModel.telefono) {
      this.formModel.telefono = this.formModel.telefono.replace(/\D/g, '');
    }
    this.onFieldChange();
  }

  // --- VALIDACIÓN RIGUROSA ---
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // 1. NOMBRE: Obligatorio, solo letras y símbolos de nombre, NADA DE NÚMEROS.
    if (!this.formModel.nombre || !this.formModel.nombre.trim()) {
      this.validationErrors.nombre = 'El nombre o razón social es obligatorio.';
      isValid = false;
    } else if (this.formModel.nombre.trim().length < 3) {
      this.validationErrors.nombre = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    } else if (/[0-9]/.test(this.formModel.nombre)) {
      this.validationErrors.nombre = 'El nombre solo debe contener letras. ¡No se permiten números!';
      isValid = false;
    }

    // 2. RUC: Obligatorio, exactamente 11 dígitos numéricos, NADA DE LETRAS.
    if (!this.formModel.ruc || !this.formModel.ruc.trim()) {
      this.validationErrors.ruc = 'El número de RUC es obligatorio.';
      isValid = false;
    } else {
      const rucClean = this.formModel.ruc.trim();
      if (/\D/.test(rucClean)) {
        this.validationErrors.ruc = 'El RUC solo debe contener números. ¡No se permiten letras!';
        isValid = false;
      } else if (rucClean.length !== 11) {
        this.validationErrors.ruc = 'El RUC debe contener exactamente 11 dígitos numéricos.';
        isValid = false;
      }
    }

    // 3. CONTACTO: Opcional, pero solo letras si se ingresa.
    if (this.formModel.contacto && this.formModel.contacto.trim()) {
      if (/[0-9]/.test(this.formModel.contacto)) {
        this.validationErrors.contacto = 'El contacto solo debe contener letras. ¡No se permiten números!';
        isValid = false;
      }
    }

    // 4. EMAIL: Opcional, formato de correo válido.
    if (this.formModel.email && this.formModel.email.trim()) {
      const emailClean = this.formModel.email.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailClean)) {
        this.validationErrors.email = 'Ingrese un correo electrónico válido (ej: proveedor@empresa.com).';
        isValid = false;
      }
    }

    // 5. TELÉFONO: Opcional, entre 7 y 9 dígitos numéricos si se ingresa.
    if (this.formModel.telefono && this.formModel.telefono.trim()) {
      const phoneClean = this.formModel.telefono.trim();
      if (/\D/.test(phoneClean)) {
        this.validationErrors.telefono = 'El teléfono solo debe contener números. ¡No se permiten letras!';
        isValid = false;
      } else if (phoneClean.length < 7 || phoneClean.length > 9) {
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

    // BLOQUEO ABSOLUTO SI LA VALIDACIÓN NO SE CUMPLE
    if (!this.validateForm()) {
      this.toastService.show('⚠️ Registro bloqueado: Por favor corrija los campos no válidos marcados en rojo.', 'error');
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
        error: (err) => {
          this.loadingService.hide();
          const msg = err.error?.message || err.error?.ruc || err.error?.nombre || 'Error al actualizar proveedor';
          if (msg.toLowerCase().includes('ruc')) {
            this.validationErrors.ruc = msg;
          } else if (msg.toLowerCase().includes('nombre')) {
            this.validationErrors.nombre = msg;
          }
          this.toastService.show('⚠️ ' + msg, 'error');
        }
      });
    } else {
      this.proveedorService.create(this.formModel).subscribe({
        next: () => {
          this.toastService.show('Proveedor creado correctamente', 'success');
          this.closeModal();
          this.loadProveedores();
        },
        error: (err) => {
          this.loadingService.hide();
          const msg = err.error?.message || err.error?.ruc || err.error?.nombre || 'Error al guardar proveedor';
          if (msg.toLowerCase().includes('ruc')) {
            this.validationErrors.ruc = msg;
          } else if (msg.toLowerCase().includes('nombre')) {
            this.validationErrors.nombre = msg;
          }
          this.toastService.show('⚠️ ' + msg, 'error');
        }
      });
    }
  }

  /**
   * RF24: Eliminación Lógica (Soft Delete)
   */
  desactivarProveedor(proveedor: Proveedor) {
    if (!proveedor.id) return;
    const confirmMessage = `¿Estás seguro de desactivar al proveedor "${proveedor.nombre}"?\n\nEsta acción realizará una eliminación lógica (Soft Delete). El historial de compras se conservará sin alteración.`;

    if (confirm(confirmMessage)) {
      this.loadingService.show();
      this.proveedorService.delete(proveedor.id).subscribe({
        next: () => {
          this.toastService.show('Proveedor desactivado correctamente (Eliminación lógica)', 'success');
          this.loadProveedores();
        },
        error: (err) => {
          this.loadingService.hide();
          const msg = err.error?.message || 'Error al desactivar proveedor';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }

  toggleEstado(proveedor: Proveedor) {
    if (!proveedor.id) return;
    const nuevoEstado = !proveedor.activo;
    const accionText = nuevoEstado ? 'reactivar' : 'desactivar (soft delete)';

    if (confirm(`¿Deseas ${accionText} al proveedor "${proveedor.nombre}"?`)) {
      this.loadingService.show();
      this.proveedorService.toggleEstado(proveedor.id, nuevoEstado).subscribe({
        next: () => {
          this.toastService.show(`Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');
          this.loadProveedores();
        },
        error: (err) => {
          this.loadingService.hide();
          const msg = err.error?.message || 'Error al cambiar estado del proveedor';
          this.toastService.show(msg, 'error');
        }
      });
    }
  }
}

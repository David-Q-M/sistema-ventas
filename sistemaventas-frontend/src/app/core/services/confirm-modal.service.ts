import { Injectable, signal } from '@angular/core';

export interface ConfirmModalOptions {
  title: string;
  message: string;
  detail?: string;
  icon?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  state = signal<{
    isOpen: boolean;
    options: ConfirmModalOptions | null;
    resolveFn?: (result: boolean) => void;
  }>({
    isOpen: false,
    options: null
  });

  confirm(options: ConfirmModalOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const type = options.type || 'warning';
      let defaultIcon = 'bi-exclamation-triangle-fill';
      if (type === 'danger') defaultIcon = 'bi-exclamation-octagon-fill';
      if (type === 'success') defaultIcon = 'bi-check-circle-fill';
      if (type === 'info') defaultIcon = 'bi-info-circle-fill';

      this.state.set({
        isOpen: true,
        options: {
          icon: options.icon || defaultIcon,
          type: type,
          confirmText: options.confirmText || 'Aceptar',
          cancelText: options.cancelText || 'Cancelar',
          ...options
        },
        resolveFn: resolve
      });
    });
  }

  handleConfirm() {
    const currentState = this.state();
    if (currentState.options?.onConfirm) {
      currentState.options.onConfirm();
    }
    if (currentState.resolveFn) {
      currentState.resolveFn(true);
    }
    this.close();
  }

  handleCancel() {
    const currentState = this.state();
    if (currentState.options?.onCancel) {
      currentState.options.onCancel();
    }
    if (currentState.resolveFn) {
      currentState.resolveFn(false);
    }
    this.close();
  }

  close() {
    this.state.set({ isOpen: false, options: null });
  }
}

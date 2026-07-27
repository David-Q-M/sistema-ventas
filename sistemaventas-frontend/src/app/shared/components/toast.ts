import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast" 
           [ngClass]="toast.type">
        <div class="toast-content">
          <i class="bi" [ngClass]="{
            'bi-check-circle-fill': toast.type === 'success',
            'bi-exclamation-circle-fill': toast.type === 'error',
            'bi-info-circle-fill': toast.type === 'info'
          }"></i>
          <span>{{ toast.message }}</span>
        </div>
        <button (click)="toastService.remove(toast.id)" class="close-btn" title="Cerrar">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      padding: 12px 18px;
      border-radius: 10px;
      color: #FFFFFF;
      min-width: 260px;
      max-width: 380px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toast-content i {
      font-size: 1.15rem;
    }
    
    .toast.success { 
      background: linear-gradient(135deg, #15803D 0%, #22C55E 100%) !important; 
      color: #FFFFFF !important;
    }
    
    .toast.error { 
      background: linear-gradient(135deg, #C62828 0%, #EF5350 100%) !important; 
      color: #FFFFFF !important;
    }
    
    .toast.info { 
      background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%) !important; 
      color: #FFFFFF !important;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      font-size: 1.3rem;
      cursor: pointer;
      margin-left: 12px;
      line-height: 1;
      padding: 0;
      transition: color 0.15s ease;
    }

    .close-btn:hover {
      color: #FFFFFF;
    }
    
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }
}

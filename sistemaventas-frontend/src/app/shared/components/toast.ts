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
        {{ toast.message }}
        <button (click)="toastService.remove(toast.id)" class="close-btn">×</button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      min-width: 250px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
    }
    .toast.success { background-color: var(--secondary-color); }
    .toast.error { background-color: var(--danger-color); }
    .toast.info { background-color: var(--primary-color); }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: 10px;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" *ngIf="confirmService.state().isOpen" (click)="onBackdropClick($event)">
      <div class="confirm-card" [ngClass]="confirmService.state().options?.type || 'warning'">
        
        <div class="confirm-header">
          <div class="confirm-icon-badge" [ngClass]="confirmService.state().options?.type || 'warning'">
            <i class="bi" [ngClass]="confirmService.state().options?.icon || 'bi-exclamation-triangle-fill'"></i>
          </div>
          <button type="button" class="btn-close" (click)="confirmService.handleCancel()" title="Cerrar">×</button>
        </div>

        <div class="confirm-body">
          <h3 class="confirm-title">{{ confirmService.state().options?.title }}</h3>
          <p class="confirm-message">{{ confirmService.state().options?.message }}</p>
          <div class="confirm-detail-box" *ngIf="confirmService.state().options?.detail">
            <i class="bi bi-info-circle-fill me-2"></i>
            <span>{{ confirmService.state().options?.detail }}</span>
          </div>
        </div>

        <div class="confirm-footer">
          <button type="button" class="btn btn-cancel" (click)="confirmService.handleCancel()">
            {{ confirmService.state().options?.cancelText || 'Cancelar' }}
          </button>
          <button type="button" class="btn btn-action" [ngClass]="confirmService.state().options?.type || 'warning'" (click)="confirmService.handleConfirm()">
            {{ confirmService.state().options?.confirmText || 'Aceptar' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    .confirm-card {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(226, 232, 240, 0.9);
    }

    .confirm-header {
      padding: 1.25rem 1.5rem 0.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .confirm-icon-badge {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }

    .confirm-icon-badge.warning {
      background: #FEF3C7;
      color: #D97706;
    }

    .confirm-icon-badge.danger {
      background: #FEE2E2;
      color: #DC2626;
    }

    .confirm-icon-badge.success {
      background: #DCFCE7;
      color: #16A34A;
    }

    .confirm-icon-badge.info {
      background: #E0F2FE;
      color: #0284C7;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.8rem;
      color: #94A3B8;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      transition: color 0.15s ease;
    }

    .btn-close:hover {
      color: #334155;
    }

    .confirm-body {
      padding: 0.75rem 1.5rem 1.25rem 1.5rem;
    }

    .confirm-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 0.5rem 0;
    }

    .confirm-message {
      font-size: 0.95rem;
      color: #334155;
      margin: 0 0 0.85rem 0;
      line-height: 1.5;
    }

    .confirm-detail-box {
      background: #F8FAFC;
      border-left: 4px solid #64748B;
      padding: 0.85rem 1rem;
      border-radius: 0 10px 10px 0;
      font-size: 0.88rem;
      color: #475569;
      display: flex;
      align-items: flex-start;
      line-height: 1.45;
    }

    .confirm-card.warning .confirm-detail-box {
      border-left-color: #D97706;
      background: #FFFBEB;
      color: #92400E;
    }

    .confirm-card.danger .confirm-detail-box {
      border-left-color: #DC2626;
      background: #FEF2F2;
      color: #991B1B;
    }

    .confirm-card.success .confirm-detail-box {
      border-left-color: #16A34A;
      background: #F0FDF4;
      color: #166534;
    }

    .confirm-footer {
      padding: 1rem 1.5rem 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #F8FAFC;
      border-top: 1px solid #F1F5F9;
    }

    .btn {
      padding: 0.65rem 1.35rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.92rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-cancel {
      background: #E2E8F0;
      color: #334155;
    }

    .btn-cancel:hover {
      background: #CBD5E1;
      color: #0F172A;
    }

    .btn-action.warning {
      background: #D97706;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
    }

    .btn-action.warning:hover {
      background: #B45309;
      transform: translateY(-1px);
    }

    .btn-action.danger {
      background: #DC2626;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
    }

    .btn-action.danger:hover {
      background: #B91C1C;
      transform: translateY(-1px);
    }

    .btn-action.success {
      background: #16A34A;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    }

    .btn-action.success:hover {
      background: #15803D;
      transform: translateY(-1px);
    }

    .btn-action.info {
      background: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }

    .btn-action.info:hover {
      background: #0369A1;
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.94); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ConfirmModalComponent {
  constructor(public confirmService: ConfirmModalService) {}

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('confirm-overlay')) {
      this.confirmService.handleCancel();
    }
  }
}

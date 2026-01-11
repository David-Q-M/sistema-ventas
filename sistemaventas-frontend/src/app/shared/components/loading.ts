import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="loadingService.isLoading()" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
    styles: [`
    .loading-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(2px);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
    constructor(public loadingService: LoadingService) { }
}

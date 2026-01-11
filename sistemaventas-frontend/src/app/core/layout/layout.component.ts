import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading';
import { ToastComponent } from '../../shared/components/toast';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LoadingComponent, ToastComponent],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
    role: string | null = null;
    sidebarOpen = true;

    constructor(public authService: AuthService, private router: Router) {
        this.role = this.authService.getRole();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }
}

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getRole();
    const expectedRoles = route.data['roles'] as Array<string>;

    if (userRole && expectedRoles.includes(userRole)) {
        return true;
    }

    // Redirect to dashboard if unauthorized
    router.navigate(['/dashboard']);
    return false;
};

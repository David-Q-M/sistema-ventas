import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toastService = inject(ToastService);
    const token = authService.getToken();

    let clonedReq = req;
    if (token) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/login')) {
                console.warn(`Error de autorización (${error.status}). Redirigiendo a login...`);
                authService.logout();
                toastService.show('⚠️ Tu sesión ha expirado o el acceso no está autorizado. Inicia sesión nuevamente.', 'error');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};

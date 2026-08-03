import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/models';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: { username: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('rol', response.rol);
                    localStorage.setItem('userId', response.id);
                    this.currentUserSubject.next(response.token);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('userId');
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getRole(): string | null {
        const role = localStorage.getItem('rol');
        if (!role || role === 'null' || role === 'undefined') return null;
        return role;
    }

    getToken(): string | null {
        const token = localStorage.getItem('token');
        if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
            return null;
        }
        return token;
    }

    getUserId(): number | null {
        const id = localStorage.getItem('userId');
        if (!id || id === 'null' || id === 'undefined') return null;
        const parsed = parseInt(id, 10);
        return isNaN(parsed) ? null : parsed;
    }
}

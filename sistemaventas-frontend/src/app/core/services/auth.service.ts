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
                localStorage.setItem('token', response.token);
                localStorage.setItem('rol', response.rol);
                localStorage.setItem('userId', response.id);
                this.currentUserSubject.next(response.token);
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
        return !!localStorage.getItem('token');
    }

    getRole(): string | null {
        return localStorage.getItem('rol');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserId(): number | null {
        const id = localStorage.getItem('userId');
        return id ? parseInt(id, 10) : null;
    }
}

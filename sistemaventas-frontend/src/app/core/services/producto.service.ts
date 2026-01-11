import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../shared/models/models';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/listar`);
    }

    getById(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/${id}`);
    }

    create(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(`${this.apiUrl}/guardar`, producto);
    }

    update(id: number, producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

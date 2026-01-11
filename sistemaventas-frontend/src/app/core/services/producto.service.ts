import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = 'http://localhost:8080/api/productos';

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

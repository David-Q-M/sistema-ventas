import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {
    private apiUrl = `${environment.apiUrl}/proveedores`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.apiUrl}/listar`);
    }

    getById(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
    }

    create(proveedor: Proveedor): Observable<Proveedor> {
        return this.http.post<Proveedor>(`${this.apiUrl}/guardar`, proveedor);
    }

    update(id: number, proveedor: Proveedor): Observable<Proveedor> {
        return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

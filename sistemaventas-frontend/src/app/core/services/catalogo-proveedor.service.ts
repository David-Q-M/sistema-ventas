import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogoProveedor } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CatalogoProveedorService {
    private apiUrl = `${environment.apiUrl}/catalogo-proveedor`;

    constructor(private http: HttpClient) { }

    getByProveedor(proveedorId: number): Observable<CatalogoProveedor[]> {
        return this.http.get<CatalogoProveedor[]>(`${this.apiUrl}/proveedor/${proveedorId}`);
    }

    getActivosByProveedor(proveedorId: number): Observable<CatalogoProveedor[]> {
        return this.http.get<CatalogoProveedor[]>(`${this.apiUrl}/proveedor/${proveedorId}/activos`);
    }

    getById(id: number): Observable<CatalogoProveedor> {
        return this.http.get<CatalogoProveedor>(`${this.apiUrl}/${id}`);
    }

    guardar(item: CatalogoProveedor): Observable<CatalogoProveedor> {
        return this.http.post<CatalogoProveedor>(this.apiUrl, item);
    }

    actualizar(id: number, item: CatalogoProveedor): Observable<CatalogoProveedor> {
        return this.http.put<CatalogoProveedor>(`${this.apiUrl}/${id}`, item);
    }

    toggleEstado(id: number, activo: boolean): Observable<CatalogoProveedor> {
        return this.http.patch<CatalogoProveedor>(`${this.apiUrl}/${id}/estado?activo=${activo}`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

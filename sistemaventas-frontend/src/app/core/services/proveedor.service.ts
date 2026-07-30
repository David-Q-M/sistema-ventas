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

    getActivos(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.apiUrl}/listar-activos`);
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

    /**
     * RF24: Eliminación Lógica (Soft Delete)
     * Desactiva el proveedor en la base de datos sin borrar el registro.
     */
    delete(id: number): Observable<Proveedor> {
        return this.http.delete<Proveedor>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cambiar estado activo/inactivo dinámicamente
     */
    toggleEstado(id: number, activo: boolean): Observable<Proveedor> {
        return this.http.patch<Proveedor>(`${this.apiUrl}/${id}/estado?activo=${activo}`, {});
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

export interface DetalleCompraRequestPayload {
    productoId: number;
    cantidad: number;
    precioCosto: number;
    observacion?: string;
}

export interface CompraRequestPayload {
    proveedorId: number;
    fechaPedido?: string;
    fechaEntrega?: string;
    metodoPedido?: string;
    estadoPago?: string;
    estado?: string;
    observacion?: string;
    detalles: DetalleCompraRequestPayload[];
}

@Injectable({
    providedIn: 'root'
})
export class CompraService {
    private apiUrl = `${environment.apiUrl}/compras`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/listar`);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    create(compraPayload: CompraRequestPayload | any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/guardar`, compraPayload);
    }

    updateEstado(id: number, estado: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { estado });
    }
}

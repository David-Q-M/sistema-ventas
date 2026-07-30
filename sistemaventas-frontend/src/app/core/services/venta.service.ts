import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, VentaDTO } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

export interface AnulacionVentaPayload {
    motivo: string;
    usuarioAdmin?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VentaService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) { }

    getHistorial(): Observable<Venta[]> {
        return this.http.get<Venta[]>(`${this.apiUrl}/historial`);
    }

    getById(id: number): Observable<Venta> {
        return this.http.get<Venta>(`${this.apiUrl}/${id}`);
    }

    registrarVenta(venta: VentaDTO): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/procesar`, venta);
    }

    anularVenta(id: number, payload: AnulacionVentaPayload): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/${id}/anular`, payload);
    }
}

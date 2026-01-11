import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, VentaDTO } from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class VentaService {
    private apiUrl = 'http://localhost:8080/api/ventas';

    constructor(private http: HttpClient) { }

    getHistorial(): Observable<Venta[]> {
        return this.http.get<Venta[]>(`${this.apiUrl}/historial`);
    }

    registrarVenta(venta: VentaDTO): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/procesar`, venta);
    }
}

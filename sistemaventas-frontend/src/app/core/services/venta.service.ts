import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, VentaDTO } from '../../shared/models/models';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VentaService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) { }

    getHistorial(): Observable<Venta[]> {
        return this.http.get<Venta[]>(`${this.apiUrl}/historial`);
    }

    registrarVenta(venta: VentaDTO): Observable<Venta> {
        return this.http.post<Venta>(`${this.apiUrl}/procesar`, venta);
    }
}

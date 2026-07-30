import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AlertaVencimiento {
    productoId: number;
    productoNombre: string;
    codigoBarras: string;
    categoriaNombre: string;
    stock: number;
    stockMinimo: number;
    fechaVencimiento: string;
    diasRestantes: number;
    estadoAlerta: 'CRITICO' | 'PRECAUCION' | 'NORMAL';
    perecible: boolean;
}

export interface MovimientoInventario {
    id: number;
    producto: {
        id: number;
        nombre: string;
        codigoBarras?: string;
    };
    tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    stockAnterior: number;
    stockFinal: number;
    usuario: string;
    motivo: string;
    fecha: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface AjusteStockPayload {
    productoId: number;
    nuevoStock: number;
    motivo: string;
    usuario?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private apiUrl = `${environment.apiUrl}/inventario`;

    constructor(private http: HttpClient) { }

    getVencimientos(): Observable<AlertaVencimiento[]> {
        return this.http.get<AlertaVencimiento[]>(`${this.apiUrl}/vencimientos`);
    }

    getMovimientosPaginados(params: {
        productoId?: number;
        tipoMovimiento?: string;
        fechaInicio?: string;
        fechaFin?: string;
        page?: number;
        size?: number;
    }): Observable<PageResponse<MovimientoInventario>> {
        let httpParams = new HttpParams();
        if (params.productoId) httpParams = httpParams.set('productoId', params.productoId.toString());
        if (params.tipoMovimiento) httpParams = httpParams.set('tipoMovimiento', params.tipoMovimiento);
        if (params.fechaInicio) httpParams = httpParams.set('fechaInicio', params.fechaInicio);
        if (params.fechaFin) httpParams = httpParams.set('fechaFin', params.fechaFin);
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

        return this.http.get<PageResponse<MovimientoInventario>>(`${this.apiUrl}/movimientos`, { params: httpParams });
    }

    ajustarStock(payload: AjusteStockPayload): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/ajuste`, payload);
    }
}

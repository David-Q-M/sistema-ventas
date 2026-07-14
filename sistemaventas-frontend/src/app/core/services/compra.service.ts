import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CompraService {
    private apiUrl = `${environment.apiUrl}/compras`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Compra[]> {
        return this.http.get<Compra[]>(`${this.apiUrl}/listar`);
    }

    getById(id: number): Observable<Compra> {
        return this.http.get<Compra>(`${this.apiUrl}/${id}`);
    }

    create(compra: Compra): Observable<Compra> {
        return this.http.post<Compra>(`${this.apiUrl}/guardar`, compra);
    }

    updateEstado(id: number, estado: string): Observable<Compra> {
        return this.http.put<Compra>(`${this.apiUrl}/${id}/estado`, { estado });
    }
}

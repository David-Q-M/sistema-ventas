import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../../shared/models/models';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.apiUrl}/listar`);
    }
}

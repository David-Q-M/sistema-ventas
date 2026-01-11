import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private apiUrl = 'http://localhost:8080/api/categorias';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.apiUrl}/listar`);
    }
}

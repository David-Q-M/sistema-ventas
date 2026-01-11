import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioDTO } from '../../shared/models/models';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private apiUrl = 'http://localhost:8080/api/usuarios';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/listar`);
    }

    getById(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
    }

    create(usuario: UsuarioDTO): Observable<any> {
        return this.http.post(`${this.apiUrl}/guardar`, usuario);
    }

    update(id: number, usuario: UsuarioDTO): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

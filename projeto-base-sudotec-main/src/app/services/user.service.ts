import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserData } from '@/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl: string = 'http://localhost:3000/users';
    private http = inject(HttpClient);

    /**
     * Lista todos os usuários
     */
    getUsers(): Observable<UserData[]> {
        return this.http.get<UserData[]>(this.apiUrl);
    }

    /**
     * Busca um usuário por ID
     */
    getUserById(id: number): Observable<UserData> {
        return this.http.get<UserData>(`${this.apiUrl}/${id}`);
    }

    /**
     * Deleta um usuário
     */
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * Atualiza status de admin de um usuário
     */
    updateUserAdmin(id: number, isAdmin: boolean): Observable<UserData> {
        return this.http.patch<UserData>(`${this.apiUrl}/${id}/admin`, { isAdmin });
    }
}


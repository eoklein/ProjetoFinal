import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conta } from '@/models/conta.model';

@Injectable({
    providedIn: 'root'
})
export class ContaService {
    private apiUrl: string = 'http://localhost:3000/contas';
    private http = inject(HttpClient);

    /**
     * Lista todas as contas
     */
    getContas(): Observable<Conta[]> {
        return this.http.get<Conta[]>(this.apiUrl);
    }

    /**
     * Busca uma conta por ID
     */
    getContaById(id: number): Observable<Conta> {
        return this.http.get<Conta>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria uma nova conta
     */
    createConta(conta: Conta): Observable<Conta> {
        return this.http.post<Conta>(this.apiUrl, conta);
    }

    /**
     * Atualiza uma conta
     */
    updateConta(id: number, conta: Conta): Observable<Conta> {
        return this.http.put<Conta>(`${this.apiUrl}/${id}`, conta);
    }

    /**
     * Deleta uma conta
     */
    deleteConta(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

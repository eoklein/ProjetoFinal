import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lancamento } from '@/models/lancamento.model';

@Injectable({
    providedIn: 'root'
})
export class LancamentoService {
    private apiUrl: string = 'http://localhost:3000/lancamentos';
    private http = inject(HttpClient);

    /**
     * Lista todos os lançamentos
     */
    getLancamentos(): Observable<Lancamento[]> {
        return this.http.get<Lancamento[]>(this.apiUrl);
    }

    /**
     * Busca um lançamento por ID
     */
    getLancamentoById(id: number): Observable<Lancamento> {
        return this.http.get<Lancamento>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria um novo lançamento
     */
    createLancamento(lancamento: Lancamento): Observable<Lancamento> {
        return this.http.post<Lancamento>(this.apiUrl, lancamento);
    }

    /**
     * Atualiza um lançamento
     */
    updateLancamento(id: number, lancamento: Lancamento): Observable<Lancamento> {
        return this.http.put<Lancamento>(`${this.apiUrl}/${id}`, lancamento);
    }

    /**
     * Deleta um lançamento
     */
    deleteLancamento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

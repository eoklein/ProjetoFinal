import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estoque } from '@/models/estoque.model';

@Injectable({
    providedIn: 'root'
})
export class EstoqueService {
    private apiUrl: string = 'http://localhost:3000/lancamentos';
    private http = inject(HttpClient);

    /**
     * Lista todos os estoques
     */
    getEstoques(): Observable<Estoque[]> {
        return this.http.get<Estoque[]>(this.apiUrl);
    }

    /**
     * Lista todos os estoques/lançamentos compartilhados (sem filtro de usuário)
     */
    getEstoquesCompartilhados(): Observable<Estoque[]> {
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime();
        return this.http.get<Estoque[]>(`${this.apiUrl}/compartilhados/todos?t=${timestamp}`);
    }

    /**
     * Busca um estoque por ID
     */
    getEstoqueById(id: number): Observable<Estoque> {
        return this.http.get<Estoque>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria um novo estoque
     */
    createEstoque(estoque: Estoque): Observable<Estoque> {
        return this.http.post<Estoque>(this.apiUrl, estoque);
    }

    /**
     * Atualiza um estoque
     */
    updateEstoque(id: number, estoque: Estoque): Observable<Estoque> {
        return this.http.put<Estoque>(`${this.apiUrl}/${id}`, estoque);
    }

    /**
     * Deleta um estoque
     */
    deleteEstoque(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

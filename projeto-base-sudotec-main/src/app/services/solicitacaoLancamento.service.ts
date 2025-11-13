import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitacaoLancamento } from '@/models/solicitacaoLancamento.model';

@Injectable({
    providedIn: 'root'
})
export class SolicitacaoLancamentoService {
    private apiUrl: string = 'http://localhost:3000/solicitacoes-lancamento';
    private http = inject(HttpClient);

    /**
     * Busca solicitações do usuário atual
     */
    getMinhasSolicitacoes(): Observable<SolicitacaoLancamento[]> {
        return this.http.get<SolicitacaoLancamento[]>(`${this.apiUrl}/minhas-solicitacoes`);
    }

    /**
     * Busca solicitações pendentes para o admin
     */
    getSolicitacoesPendentes(): Observable<SolicitacaoLancamento[]> {
        return this.http.get<SolicitacaoLancamento[]>(`${this.apiUrl}/pendentes`);
    }

    /**
     * Cria uma nova solicitação de lançamento
     */
    createSolicitacao(solicitacao: SolicitacaoLancamento): Observable<any> {
        return this.http.post(`${this.apiUrl}`, solicitacao);
    }

    /**
     * Aprova uma solicitação de lançamento
     */
    aprovarSolicitacao(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/aprovar`, {});
    }

    /**
     * Rejeita uma solicitação de lançamento
     */
    rejeitarSolicitacao(id: number, motivo_rejeicao: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/rejeitar`, {motivo_rejeicao});
    }
}

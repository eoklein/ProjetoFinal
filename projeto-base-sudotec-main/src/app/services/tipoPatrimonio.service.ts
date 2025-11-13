import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoPatrimonio } from '@/models/tipoPatrimonio.model';

@Injectable({
    providedIn: 'root'
})
export class TipoPatrimonioService {
    private apiUrl: string = 'http://localhost:3000/tiposPatrimonio';
    private http = inject(HttpClient);

    /**
     * Lista todos os tipos de patrimonio
     */
    getTiposPatrimonio(): Observable<TipoPatrimonio[]> {
        return this.http.get<TipoPatrimonio[]>(this.apiUrl);
    }

    /**
     * Busca um tipo de patrimonio por ID
     */
    getTipoPatrimonioById(id: number): Observable<TipoPatrimonio> {
        return this.http.get<TipoPatrimonio>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria um novo tipo de patrimonio
     */
    createTipoPatrimonio(tipoPatrimonio: TipoPatrimonio): Observable<TipoPatrimonio> {
        return this.http.post<TipoPatrimonio>(this.apiUrl, tipoPatrimonio);
    }

    /**
     * Atualiza um tipo de patrimonio
     */
    updateTipoPatrimonio(id: number, tipoPatrimonio: TipoPatrimonio): Observable<TipoPatrimonio> {
        return this.http.put<TipoPatrimonio>(`${this.apiUrl}/${id}`, tipoPatrimonio);
    }

    /**
     * Deleta um tipo de patrimonio
     */
    deleteTipoPatrimonio(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

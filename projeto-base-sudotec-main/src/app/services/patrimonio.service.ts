import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patrimonio } from '@/models/patrimonio.model';

@Injectable({
    providedIn: 'root'
})
export class PatrimonioService {
    private apiUrl: string = 'http://localhost:3000/patrimonios';
    private http = inject(HttpClient);

    /**
     * Lista todos os patrimonios
     */
    getPatrimonios(): Observable<Patrimonio[]> {
        return this.http.get<Patrimonio[]>(this.apiUrl);
    }

    /**
     * Busca um patrimonio por ID
     */
    getPatrimonioById(id: number): Observable<Patrimonio> {
        return this.http.get<Patrimonio>(`${this.apiUrl}/${id}`);
    }

    /**
     * Cria um novo patrimonio
     */
    createPatrimonio(patrimonio: Patrimonio): Observable<Patrimonio> {
        return this.http.post<Patrimonio>(this.apiUrl, patrimonio);
    }

    /**
     * Atualiza um patrimonio
     */
    updatePatrimonio(id: number, patrimonio: Patrimonio): Observable<Patrimonio> {
        return this.http.put<Patrimonio>(`${this.apiUrl}/${id}`, patrimonio);
    }

    /**
     * Deleta um patrimonio
     */
    deletePatrimonio(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

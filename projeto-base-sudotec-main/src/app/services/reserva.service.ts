import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '@/models/reserva.model';

@Injectable({
    providedIn: 'root'
})
export class ReservaService {
    private apiUrl = 'http://localhost:3000/reservas';

    constructor(private http: HttpClient) {}

    getReservas(): Observable<Reserva[]> {
        return this.http.get<Reserva[]>(`${this.apiUrl}`);
    }

    getPatrimoniosDisponiveis(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/disponivel`);
    }

    createReserva(reserva: Reserva): Observable<{ message: string; reserva: Reserva }> {
        return this.http.post<{ message: string; reserva: Reserva }>(`${this.apiUrl}`, reserva);
    }

    updateReserva(id: number, reserva: Partial<Reserva>): Observable<{ message: string; reserva: Reserva }> {
        return this.http.put<{ message: string; reserva: Reserva }>(`${this.apiUrl}/${id}`, reserva);
    }

    deleteReserva(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

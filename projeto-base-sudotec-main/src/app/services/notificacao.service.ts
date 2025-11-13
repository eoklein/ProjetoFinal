import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificacaoService {
    private reservaAlterada$ = new Subject<{ patrimonioId: number; status?: string }>();

    getReservaAlterada() {
        return this.reservaAlterada$.asObservable();
    }

    notifyReservaAlterada(patrimonioId: number, status?: string) {
        this.reservaAlterada$.next({ patrimonioId, status });
    }
}

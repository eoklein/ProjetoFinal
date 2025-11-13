import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth.service';

/**
 * Guard funcional (Angular 18+) para proteger rotas que precisam de autenticação
 */
export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redireciona para a página de acesso negado se não estiver autenticado
    return router.createUrlTree(['/access']);
};

/**
 * Guard para proteger rotas que são apenas para admins
 */
export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.isAdmin()) {
        return true;
    }

    // Redireciona para home se não for admin
    return router.createUrlTree(['/']);
};

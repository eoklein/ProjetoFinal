import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@/services/auth.service';

/**
 * Interceptor funcional (Angular 18+) que adiciona o header Authorization
 * automaticamente em todas as requisições HTTP e trata erros 404+
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    // Se a requisição já tem Authorization header, não modifica
    if (req.headers.has('Authorization')) {
        return next(req).pipe(
            catchError((error) => {
                if (error.status >= 404) {
                    router.navigate(['/error']);
                }
                return throwError(() => error);
            })
        );
    }
    
    const token = authService.getToken();

    // Se existe token, adiciona o header Authorization
    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Basic ${token}`
            }
        });

        return next(clonedRequest).pipe(
            catchError((error) => {
                if (error.status >= 404) {
                    router.navigate(['/error']);
                }
                return throwError(() => error);
            })
        );
    }

    // Se não existe token, continua com a requisição original
    return next(req).pipe(
        catchError((error) => {
            if (error.status >= 404) {
                router.navigate(['/error']);
            }
            return throwError(() => error);
        })
    );
};


import { Injectable } from '@angular/core';
import { UserData } from '@/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'user_data';

    /**
     * Salva o token e os dados do usuário no localStorage
     */
    saveAuthData(userData: UserData): void {
        localStorage.setItem(this.TOKEN_KEY, userData.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }

    /**
     * Retorna o token de autenticação
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Retorna os dados do usuário logado
     */
    getUserData(): UserData | null {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }

    /**
     * Verifica se o usuário é admin
     */
    isAdmin(): boolean {
        const userData = this.getUserData();
        return userData?.isAdmin || false;
    }

    /**
     * Remove os dados de autenticação (logout)
     */
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

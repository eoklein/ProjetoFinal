import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { LoginService } from '@/services/login-service';
import { AuthModel } from '@/models/auth.model';
import { AuthService } from '@/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, RippleModule, Toast, CommonModule, FormsModule],
    templateUrl: './login.html',
    providers: [MessageService, LoginService]
})
export class Login {
    @ViewChild('usernameInput') usernameInput!: ElementRef;

    formBuilder = inject(FormBuilder);
    messageService = inject(MessageService);
    loginService = inject(LoginService);
    authService = inject(AuthService);
    router = inject(Router);

    // ETAPA 4: Navegação por teclado
    isLoading = false;

    loginForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    ngOnInit() {
        // ETAPA 4: Foco automático no campo usuário
        setTimeout(() => {
            this.usernameInput?.nativeElement?.focus();
        }, 100);

        // Limpar senha após logout
        localStorage.removeItem('auth_token');
    }

    // ETAPA 3: Validação de formato (email vs username)
    isValidLogin(): boolean {
        const login = this.loginForm.get('username')?.value || '';
        if (!login) return false;
        return true;
    }

    isEmailFormat(value: string): boolean {
        return value.includes('@');
    }

    getLoginIcon(): string {
        const value = this.loginForm.get('username')?.value || '';
        if (this.isEmailFormat(value)) {
            return '✉';
        }
        return '👤';
    }

    // ETAPA 4: Navegação por teclado
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.validarLogin();
        }
    }

    validarLogin() {
        if (this.loginForm.invalid) {
            this.messageService.add({ severity: 'info', summary: 'Informação', detail: 'Digite usuário ou e-mail' });
            return;
        }

        this.isLoading = true;

        let loginInput = {
            username: this.loginForm.value.username || '',
            password: this.loginForm.value.password || ''
        } as AuthModel;

        this.loginService.login(loginInput).subscribe({
            next: (userData) => {
                this.isLoading = false;
                this.authService.saveAuthData(userData);
                this.router.navigate(['/home']);
            },
            error: (err) => {
                this.isLoading = false;
                const errorMessage = err.error?.error || 'Erro ao realizar login';
                
                
                // ETAPA 3: Mensagens de erro específicas
                let detailMessage = errorMessage;
                if (errorMessage.includes('Credenciais inválidas')) {
                    // Verificar se é um usuário não encontrado ou senha errada
                    const username = this.loginForm.get('username')?.value || '';
                    if (this.isEmailFormat(username)) {
                        detailMessage = 'E-mail ou senha incorretos';
                    } else {
                        detailMessage = 'Usuário ou senha incorretos';
                    }
                }
                
                this.messageService.add({ severity: 'error', summary: 'Erro de Login', detail: detailMessage });
            }
        });
    }
}


import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { LoginService } from '@/services/login-service';
import { AuthModel } from '@/models/auth.model';
import { AuthService } from '@/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, RippleModule, Toast],
    templateUrl: './login.html',
    providers: [MessageService, LoginService]
})
export class Login {
    formBuilder = inject(FormBuilder);
    messageService = inject(MessageService);
    loginService = inject(LoginService);
    authService = inject(AuthService);
    router = inject(Router);

    loginForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    validarLogin() {
        if (this.loginForm.invalid) {
            this.messageService.add({ severity: 'info', summary: 'Informação', detail: 'Preencha todos os campos corretamente' });
            return;
        }

        let loginInput = this.loginForm.value as AuthModel;

        this.loginService.login(loginInput).subscribe({
            next: (userData) => {
                this.authService.saveAuthData(userData);
                this.router.navigate(['/home']);
            },
            error: (err) => {
                const errorMessage = err.error?.error || 'Erro ao realizar login';
                this.messageService.add({ severity: 'error', summary: 'Erro de Login', detail: errorMessage });
            }
        });
    }
}

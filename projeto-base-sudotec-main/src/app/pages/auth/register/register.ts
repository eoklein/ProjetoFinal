import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { RegisterService } from '../../../services/register-service';
import { RegisterInput } from '@/models/registerInput';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, Toast],
    templateUrl: './register.html',
    providers: [MessageService, RegisterService]
})
export class Register {
    formBuilder = inject(FormBuilder);
    messageService = inject(MessageService);
    registerService = inject(RegisterService);
    router = inject(Router);

    registerForm = this.formBuilder.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', [Validators.required]]
    });

    validarCadastro() {
        if (this.registerForm.invalid) {
            this.messageService.add({
                severity: 'info',
                summary: 'Informação',
                detail: 'Preencha todos os campos corretamente'
            });
            return;
        }

        const password = this.registerForm.get('password')?.value;
        const confirmPassword = this.registerForm.get('confirmPassword')?.value;

        if (password !== confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'As senhas não coincidem'
            });
            return;
        }

        const registerInput: RegisterInput = {
            username: this.registerForm.get('username')?.value || '',
            password: password || ''
        };

        this.registerService.register(registerInput).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Cadastro realizado com sucesso',
                    detail: response.message + (response.isAdmin ? ' - Você é o primeiro usuário (Admin)!' : '')
                });

                // Redirecionar para login após 1.5s
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 1500);
            },
            error: (err) => {
                const errorMessage = err.error?.error || 'Erro ao realizar cadastro';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro no Cadastro',
                    detail: errorMessage
                });
            }
        });
    }
}

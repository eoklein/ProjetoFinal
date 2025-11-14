import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { RegisterService } from '../../../services/register-service';
import { RegisterInput } from '@/models/registerInput';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, Toast, CommonModule],
    templateUrl: './register.html',
    providers: [MessageService, RegisterService]
})
export class Register {
    @ViewChild('usernameInput') usernameInput!: ElementRef;

    formBuilder = inject(FormBuilder);
    messageService = inject(MessageService);
    registerService = inject(RegisterService);
    router = inject(Router);

    // Regex para validação de email
    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    isLoading = false;

    registerForm = this.formBuilder.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [this.emailValidator.bind(this)]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', [Validators.required]]
    });

    ngOnInit() {
        // Foco automático no campo username
        setTimeout(() => {
            this.usernameInput?.nativeElement?.focus();
        }, 100);
    }

    // Validador customizado de email (opcional mas se fornecido, deve ser válido)
    emailValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        
        // Se vazio, é válido (campo opcional)
        if (!value) {
            return null;
        }
        
        // Se preenchido, valida formato
        if (!this.emailRegex.test(value)) {
            return { invalidEmail: true };
        }
        
        return null;
    }

    // Verifica se o email tem formato válido
    isValidEmail(email: string | null | undefined): boolean {
        return email ? this.emailRegex.test(email.trim()) : false;
    }

    // Retorna classes CSS condicionais para validação visual do email
    getEmailClasses(): string {
        const emailControl = this.registerForm.get('email');
        if (!emailControl?.value) return '';
        
        if (emailControl.valid) {
            return 'border-2 border-green-500';
        } else {
            return 'border-2 border-red-500';
        }
    }

    validarCadastro() {
        if (this.registerForm.invalid) {
            this.messageService.add({
                severity: 'info',
                summary: 'Informação',
                detail: 'Preencha todos os campos obrigatórios corretamente'
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

        this.isLoading = true;

        const registerInput: RegisterInput = {
            username: this.registerForm.get('username')?.value || '',
            password: password || '',
            email: this.registerForm.get('email')?.value || undefined
        };

        this.registerService.register(registerInput).subscribe({
            next: (response) => {
                this.isLoading = false;
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
                this.isLoading = false;
                const errorMessage = err.error?.error || 'Erro ao realizar cadastro';
                let detailMessage = errorMessage;

                // Mensagens de erro específicas por campo
                if (errorMessage.includes('Email')) {
                    detailMessage = 'Email já está registrado ou tem formato inválido';
                } else if (errorMessage.includes('Username')) {
                    detailMessage = 'Username já existe. Escolha outro.';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro no Cadastro',
                    detail: detailMessage
                });
            }
        });
    }
}

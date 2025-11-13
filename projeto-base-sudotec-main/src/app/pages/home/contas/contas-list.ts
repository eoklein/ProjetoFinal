import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContaService } from '@/services/conta.service';
import { Conta } from '@/models/conta.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-contas-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './contas-list.html',
    providers: [MessageService, ConfirmationService]
})
export class ContasList implements OnInit {
    contaService = inject(ContaService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    contas: Conta[] = [];
    contaDialog: boolean = false;
    conta: Conta = {} as Conta;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;

    ngOnInit() {
        this.loadContas();
    }

    loadContas() {
        this.loading = true;
        this.contaService.getContas().subscribe({
            next: (contas) => {
                this.contas = contas;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar contas'
                });
                this.loading = false;
            }
        });
    }

    openNew() {
        this.conta = { saldo: 0, limite: 0 } as Conta;
        this.submitted = false;
        this.isEditMode = false;
        this.contaDialog = true;
    }

    editConta(conta: Conta) {
        this.conta = { ...conta };
        this.isEditMode = true;
        this.contaDialog = true;
    }

    hideDialog() {
        this.contaDialog = false;
        this.submitted = false;
    }

    saveContact() {
        this.submitted = true;

        if (this.conta.descricao?.trim() && this.conta.saldo !== undefined && this.conta.limite !== undefined) {
            if (this.conta.id) {
                // Update
                this.contaService.updateConta(this.conta.id, this.conta).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Conta atualizada com sucesso'
                        });
                        this.loadContas();
                        this.contaDialog = false;
                        this.conta = {} as Conta;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar conta'
                        });
                    }
                });
            } else {
                // Create
                this.contaService.createConta(this.conta).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Conta criada com sucesso'
                        });
                        this.loadContas();
                        this.contaDialog = false;
                        this.conta = {} as Conta;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao criar conta'
                        });
                    }
                });
            }
        }
    }

    confirmDelete(conta: Conta) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar a conta "${conta.descricao}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteConta(conta.id!);
            }
        });
    }

    deleteConta(id: number) {
        this.contaService.deleteConta(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Conta deletada com sucesso'
                });
                this.loadContas();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar conta'
                });
            }
        });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}


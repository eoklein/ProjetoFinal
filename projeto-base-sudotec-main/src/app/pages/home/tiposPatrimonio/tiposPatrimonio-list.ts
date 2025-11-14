import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TipoPatrimonioService } from '@/services/tipoPatrimonio.service';
import { AuthService } from '@/services/auth.service';
import { TipoPatrimonio } from '@/models/tipoPatrimonio.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-tipos-patrimonio-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './tiposPatrimonio-list.html',
    providers: [MessageService, ConfirmationService]
})
export class TiposPatrimonioList implements OnInit {
    tipoPatrimonioService = inject(TipoPatrimonioService);
    authService = inject(AuthService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    tiposPatrimonio: TipoPatrimonio[] = [];
    tipoPatrimonioDialog: boolean = false;
    tipoPatrimonio: TipoPatrimonio = {} as TipoPatrimonio;
    tipoPatrimonioOriginal: TipoPatrimonio = {} as TipoPatrimonio;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    isAdmin: boolean = false;

    ngOnInit() {
        this.checkAdmin();
        this.loadTiposPatrimonio();
    }

    checkAdmin() {
        // Usar AuthService para verificar se é admin
        this.isAdmin = this.authService.isAdmin();
    }

    loadTiposPatrimonio() {
        this.loading = true;
        this.tipoPatrimonioService.getTiposPatrimonio().subscribe({
            next: (tiposPatrimonio) => {
                this.tiposPatrimonio = tiposPatrimonio;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar tipos de patrimonio'
                });
                this.loading = false;
            }
        });
    }

    openNew() {
        if (!this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acesso Negado',
                detail: 'Apenas administradores podem criar novos tipos'
            });
            return;
        }
        this.tipoPatrimonio = {} as TipoPatrimonio;
        this.submitted = false;
        this.isEditMode = false;
        this.tipoPatrimonioDialog = true;
    }

    editTipoPatrimonio(tipoPatrimonio: TipoPatrimonio) {
        if (!this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acesso Negado',
                detail: 'Apenas administradores podem editar tipos'
            });
            return;
        }
        this.tipoPatrimonioOriginal = { ...tipoPatrimonio };
        this.tipoPatrimonio = { ...tipoPatrimonio };
        this.isEditMode = true;
        this.tipoPatrimonioDialog = true;
    }

    hideDialog() {
        this.tipoPatrimonioDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    saveContact() {
        this.submitted = true;

        // Restaurar campos vazios com valores originais durante edição
        if (this.isEditMode && !this.tipoPatrimonio.nome?.trim()) {
            this.tipoPatrimonio.nome = this.tipoPatrimonioOriginal.nome;
        }

        if (this.tipoPatrimonio.nome?.trim()) {
            if (this.tipoPatrimonio.id) {
                // Update
                this.tipoPatrimonioService.updateTipoPatrimonio(this.tipoPatrimonio.id, this.tipoPatrimonio).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Tipo de patrimonio atualizado com sucesso'
                        });
                        this.loadTiposPatrimonio();
                        this.tipoPatrimonioDialog = false;
                        this.tipoPatrimonio = {} as TipoPatrimonio;
                    },
                    error: (err) => {
                        if (err.status === 403) {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erro',
                                detail: 'Apenas administradores podem editar tipos'
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erro',
                                detail: 'Erro ao atualizar tipo de patrimonio'
                            });
                        }
                    }
                });

            } else {
                // Create
                this.tipoPatrimonioService.createTipoPatrimonio(this.tipoPatrimonio).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Tipo de patrimonio criado com sucesso'
                        });
                        this.loadTiposPatrimonio();
                        this.tipoPatrimonioDialog = false;
                        this.tipoPatrimonio = {} as TipoPatrimonio;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao criar tipo de patrimonio'
                        });
                    }
                });
            }
        }
    }

    confirmDelete(tipoPatrimonio: TipoPatrimonio) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o tipo de patrimonio "${tipoPatrimonio.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteTipoPatrimonio(tipoPatrimonio.id!);
            }
        });
    }

    deleteTipoPatrimonio(id: number) {
        this.tipoPatrimonioService.deleteTipoPatrimonio(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Tipo de patrimonio deletado com sucesso'
                });
                this.loadTiposPatrimonio();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar tipo de patrimonio'
                });
            }
        });
    }
}

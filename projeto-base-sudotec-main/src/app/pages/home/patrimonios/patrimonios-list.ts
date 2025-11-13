import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PatrimonioService } from '@/services/patrimonio.service';
import { Patrimonio } from '@/models/patrimonio.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-patrimonios-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, SelectModule, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './patrimonios-list.html',
    providers: [MessageService, ConfirmationService]
})
export class PatrimoniosList implements OnInit {
    patrimonioService = inject(PatrimonioService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    patrimonios: Patrimonio[] = [];
    patrimonioDialog: boolean = false;
    patrimonio: Patrimonio = {} as Patrimonio;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    
    statusOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Normal', value: 'normal' },
        { label: 'Bom', value: 'bom' }
    ];

    ngOnInit() {
        this.loadPatrimonios();
    }

    loadPatrimonios() {
        this.loading = true;
        this.patrimonioService.getPatrimonios().subscribe({
            next: (patrimonios) => {
                this.patrimonios = patrimonios;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar patrimonios'
                });
                this.loading = false;
            }
        });
    }

    openNew() {
        this.patrimonio = { status: 'normal' } as Patrimonio;
        this.submitted = false;
        this.isEditMode = false;
        this.patrimonioDialog = true;
    }

    editPatrimonio(patrimonio: Patrimonio) {
        this.patrimonio = { ...patrimonio };
        this.isEditMode = true;
        this.patrimonioDialog = true;
    }

    hideDialog() {
        this.patrimonioDialog = false;
        this.submitted = false;
    }

    saveContact() {
        this.submitted = true;

        if (this.patrimonio.nome?.trim() && this.patrimonio.status) {
            if (this.patrimonio.id) {
                // Update
                this.patrimonioService.updatePatrimonio(this.patrimonio.id, this.patrimonio).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Patrimonio atualizado com sucesso'
                        });
                        this.loadPatrimonios();
                        this.patrimonioDialog = false;
                        this.patrimonio = {} as Patrimonio;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar patrimonio'
                        });
                    }
                });
            } else {
                // Create
                this.patrimonioService.createPatrimonio(this.patrimonio).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Patrimonio criado com sucesso'
                        });
                        this.loadPatrimonios();
                        this.patrimonioDialog = false;
                        this.patrimonio = {} as Patrimonio;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao criar patrimonio'
                        });
                    }
                });
            }
        }
    }

    confirmDelete(patrimonio: Patrimonio) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o patrimonio "${patrimonio.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deletePatrimonio(patrimonio.id!);
            }
        });
    }

    deletePatrimonio(id: number) {
        this.patrimonioService.deletePatrimonio(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Patrimonio deletado com sucesso'
                });
                this.loadPatrimonios();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar patrimonio'
                });
            }
        });
    }
}

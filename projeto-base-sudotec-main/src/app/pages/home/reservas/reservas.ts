import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ReservaService } from '@/services/reserva.service';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { Reserva } from '@/models/reserva.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-reservas',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, Select, DatePicker, Toolbar, TooltipModule, TagModule, IconField, InputIcon],
    templateUrl: './reservas.html',
    styleUrl: './reservas.scss',
    providers: [MessageService, ConfirmationService]
})
export class ReservasComponent implements OnInit {
    reservaService = inject(ReservaService);
    authService = inject(AuthService);
    userService = inject(UserService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    reservas: Reserva[] = [];
    patrimoniosDisponiveis: any[] = [];
    usuarios: any[] = [];
    reserva: Reserva = {} as Reserva;
    reservaOriginal: Reserva = {} as Reserva;
    reservaDialog: boolean = false;
    isEditMode: boolean = false;
    submitted: boolean = false;
    loading: boolean = false;
    isAdmin: boolean = false;

    statusOptions = [
        { label: 'Ativa', value: 'ativa' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin();
        this.loadReservas();
        this.loadPatrimoniosDisponiveis();
        if (this.isAdmin) {
            this.loadUsuarios();
        }
    }

    loadReservas() {
        this.loading = true;
        this.reservaService.getReservas().subscribe({
            next: (reservas) => {
                this.reservas = reservas;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar reservas'
                });
                this.loading = false;
            }
        });
    }

    loadPatrimoniosDisponiveis() {
        this.reservaService.getPatrimoniosDisponiveis().subscribe({
            next: (patrimonios) => {
                this.patrimoniosDisponiveis = patrimonios;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar patrimônios disponíveis'
                });
            }
        });
    }

    loadUsuarios() {
        this.userService.getUsers().subscribe({
            next: (usuarios) => {
                this.usuarios = usuarios;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar usuários'
                });
            }
        });
    }

    openNew() {
        this.reserva = { patrimonioId: 0, dataDevolucao: new Date() } as Reserva;
        this.isEditMode = false;
        this.submitted = false;
        this.reservaDialog = true;
    }

    editReserva(reserva: Reserva) {
        this.reserva = { ...reserva };
        this.reservaOriginal = { ...reserva };
        this.isEditMode = true;
        this.submitted = false;
        this.reservaDialog = true;
    }

    hideDialog() {
        this.reservaDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    saveReserva() {
        this.submitted = true;

        if (!this.isEditMode && !this.reserva.patrimonioId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Patrimônio é obrigatório.'
            });
            return;
        }

        if (!this.isEditMode && !this.reserva.dataDevolucao) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Data de devolução é obrigatória.'
            });
            return;
        }

        if (this.isAdmin && !this.isEditMode && !this.reserva.userId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Usuário é obrigatório.'
            });
            return;
        }

        if (this.isEditMode) {
            // Update
            this.reservaService.updateReserva(this.reserva.id!, {
                dataDevolucao: this.reserva.dataDevolucao,
                estado: this.reserva.estado,
                userId: this.reserva.userId
            }).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Reserva atualizada com sucesso'
                    });
                    this.hideDialog();
                    this.loadReservas();
                },
                error: (erro) => {
                    console.error('Erro ao atualizar reserva:', erro);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: erro.error?.error || 'Erro ao atualizar reserva'
                    });
                }
            });
        } else {
            // Create
            this.reservaService.createReserva({
                patrimonioId: this.reserva.patrimonioId,
                dataDevolucao: this.reserva.dataDevolucao,
                userId: this.reserva.userId
            }).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Reserva criada com sucesso'
                    });
                    this.hideDialog();
                    this.loadReservas();
                    this.loadPatrimoniosDisponiveis();
                },
                error: (erro) => {
                    console.error('Erro ao criar reserva:', erro);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: erro.error?.error || 'Erro ao criar reserva'
                    });
                }
            });
        }
    }

    confirmDelete(reserva: Reserva) {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja deletar esta reserva?',
            header: 'Confirmar Deleção',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteReserva(reserva.id!);
            }
        });
    }

    deleteReserva(id: number) {
        this.reservaService.deleteReserva(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Reserva deletada com sucesso'
                });
                this.loadReservas();
                this.loadPatrimoniosDisponiveis();
            },
            error: (erro) => {
                console.error('Erro ao deletar reserva:', erro);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: erro.error?.error || 'Erro ao deletar reserva'
                });
            }
        });
    }
}

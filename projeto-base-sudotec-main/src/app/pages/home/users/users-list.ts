import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '@/services/user.service';
import { AuthService } from '@/services/auth.service';
import { UserData } from '@/models/auth.model';
import { Toolbar } from 'primeng/toolbar';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, Toast, ConfirmDialog, Toolbar],
    templateUrl: './users-list.html',
    providers: [MessageService, ConfirmationService]
})
export class UsersList implements OnInit {
    userService = inject(UserService);
    authService = inject(AuthService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    users: UserData[] = [];
    loading: boolean = false;
    currentUserId: number = 0;

    ngOnInit() {
        this.currentUserId = this.authService.getUserData()?.id || 0;
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar usuários'
                });
                this.loading = false;
            }
        });
    }

    confirmDelete(user: UserData) {
        if (user.id === this.currentUserId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Você não pode deletar seu próprio usuário'
            });
            return;
        }

        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o usuário "${user.username}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteUser(user.id);
            }
        });
    }

    deleteUser(id: number) {
        this.userService.deleteUser(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Usuário deletado com sucesso'
                });
                this.loadUsers();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: err.error?.error || 'Erro ao deletar usuário'
                });
            }
        });
    }

    toggleAdmin(user: UserData) {
        if (user.id === this.currentUserId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Você não pode alterar seu próprio status de admin'
            });
            return;
        }

        const newAdminStatus = !user.isAdmin;
        this.userService.updateUserAdmin(user.id, newAdminStatus).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Status de admin ${newAdminStatus ? 'concedido' : 'removido'} com sucesso`
                });
                this.loadUsers();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: err.error?.error || 'Erro ao atualizar usuário'
                });
            }
        });
    }

    getSeverity(isAdmin: boolean): string {
        return isAdmin ? 'success' : 'secondary';
    }

    getAdminLabel(isAdmin: boolean): string {
        return isAdmin ? 'Admin' : 'Usuário';
    }
}


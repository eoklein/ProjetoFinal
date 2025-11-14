import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '@/services/user.service';
import { RegisterService } from '@/services/register-service';
import { AuthService } from '@/services/auth.service';
import { UserData } from '@/models/auth.model';
import { RegisterInput } from '@/models/registerInput';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, Toast, ConfirmDialog, Dialog, InputTextModule, Toolbar, TooltipModule, SelectModule],
    templateUrl: './users-list.html',
    providers: [MessageService, ConfirmationService, RegisterService]
})
export class UsersList implements OnInit {
    userService = inject(UserService);
    authService = inject(AuthService);
    registerService = inject(RegisterService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    users: UserData[] = [];
    filteredUsers: UserData[] = [];
    loading: boolean = false;
    currentUserId: number = 0;
    userDialog: boolean = false;
    newUser: RegisterInput = { username: '', password: '' };
    submitted: boolean = false;
    searchTerm: string = '';
    selectedFilter: string = 'all'; // 'all', 'admin', 'user'

    ngOnInit() {
        this.currentUserId = this.authService.getUserData()?.id || 0;
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.filteredUsers = users;
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
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
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

    openNew() {
        this.newUser = { username: '', password: '' };
        this.submitted = false;
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    saveUser() {
        this.submitted = true;

        if (!this.newUser.username?.trim() || !this.newUser.password?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validação',
                detail: 'Username e password são obrigatórios'
            });
            return;
        }

        this.registerService.register(this.newUser).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Usuário criado com sucesso'
                });
                this.hideDialog();
                this.loadUsers();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: err.error?.error || 'Erro ao criar usuário'
                });
            }
        });
    }

    // Step 2: Métodos para indicadores
    countTotalUsers(): number {
        return this.users.length;
    }

    countAdmins(): number {
        return this.users.filter(u => u.isAdmin).length;
    }

    countCommonUsers(): number {
        return this.users.filter(u => !u.isAdmin).length;
    }

    // Step 2: Métodos para busca e filtro
    handleSearch(term: string): void {
        this.searchTerm = term.toLowerCase();
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredUsers = this.users.filter(user => {
            // Aplicar filtro de tipo (admin/user/all)
            if (this.selectedFilter !== 'all') {
                if (this.selectedFilter === 'admin' && !user.isAdmin) return false;
                if (this.selectedFilter === 'user' && user.isAdmin) return false;
            }

            // Aplicar busca por username
            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                return (
                    user.username.toLowerCase().includes(searchLower) ||
                    user.id.toString().includes(searchLower)
                );
            }

            return true;
        });
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedFilter = 'all';
        this.applyFilters();
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    // Step 3: Keyboard shortcuts
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // Ctrl+N: Novo usuário
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            this.openNew();
        }
        // Escape: Fechar diálogo
        if (event.key === 'Escape' && this.userDialog) {
            event.preventDefault();
            this.hideDialog();
        }
    }
}
import { Component, inject, OnInit, HostListener } from '@angular/core';
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
import { PatrimonioService } from '@/services/patrimonio.service';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { NotificacaoService } from '@/services/notificacao.service';
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
    patrimonioService = inject(PatrimonioService);
    authService = inject(AuthService);
    userService = inject(UserService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    notificacaoService = inject(NotificacaoService);

    reservas: Reserva[] = [];
    filteredReservas: Reserva[] = [];
    patrimoniosDisponiveis: any[] = [];
    patrimonios: any[] = [];
    usuarios: any[] = [];
    reserva: Reserva = {} as Reserva;
    reservaOriginal: Reserva = {} as Reserva;
    reservaDialog: boolean = false;
    isEditMode: boolean = false;
    submitted: boolean = false;
    loading: boolean = false;
    isAdmin: boolean = false;

    // Filtros
    searchTerm: string = '';
    filterStatus: string | null = null;
    filterUserId: number | null = null;
    dateStart: string | null = null;
    dateEnd: string | null = null;
    dateRange: Date[] | null = null;

    statusOptions = [
        { label: 'Ativa', value: 'ativa' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    statusFilterOptions = [
        { label: 'Todos', value: null },
        { label: 'Ativa', value: 'ativa' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    priorityOptions = [
        { label: 'Normal', value: 'normal' },
        { label: 'Alta', value: 'alta' },
        { label: 'Urgente', value: 'urgente' }
    ];

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin();
        this.loadReservas();
        this.loadPatrimoniosDisponiveis();
        this.loadPatrimonios();
        if (this.isAdmin) {
            this.loadUsuarios();
        }

        // Escutar notificações de mudança de reserva
        this.notificacaoService.getReservaAlterada().subscribe(() => {
            this.loadReservas();
            this.loadPatrimoniosDisponiveis();
        });
    }

    loadReservas() {
        this.loading = true;
        this.reservaService.getReservas().subscribe({
            next: (reservas) => {
                this.reservas = reservas;
                this.applyFilters();
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

    loadPatrimonios() {
        this.patrimonioService.getPatrimonios().subscribe({
            next: (patrimonios) => {
                this.patrimonios = patrimonios;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar patrimônios'
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
        if (!this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acesso Negado',
                detail: 'Apenas administradores podem criar reservas'
            });
            return;
        }
        this.reserva = { patrimonioId: 0, dataDevolucao: new Date(), status: 'ativa', prioridade: 'normal' } as Reserva;
        this.isEditMode = false;
        this.submitted = false;
        this.reservaDialog = true;
    }

    editReserva(reserva: Reserva) {
        if (!this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acesso Negado',
                detail: 'Apenas administradores podem editar reservas'
            });
            return;
        }
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

    // Validações
    private isPatrimonioReservado(patrimonioId: number): boolean {
        return this.reservas.some(r => r.patrimonioId === patrimonioId && r.status === 'ativa');
    }

    private isDataInvalida(dataReserva: Date, dataDevolucao: Date): boolean {
        return new Date(dataDevolucao) <= new Date(dataReserva);
    }

    private isPatrimonioCriticoOuDanificado(patrimonioId: number): boolean {
        const patrimonio = this.patrimonios.find(p => p.id === patrimonioId);
        return patrimonio && (patrimonio.estado === 'critico' || patrimonio.estado === 'danificado');
    }

    private isDuplicataReserva(patrimonioId: number, userId: number): boolean {
        return this.reservas.some(r => 
            r.patrimonioId === patrimonioId && 
            r.userId === userId && 
            r.status === 'ativa' && 
            r.id !== this.reserva.id
        );
    }

    saveReserva() {
        this.submitted = true;

        if (!this.isEditMode) {
            // Validações para criação
            if (!this.reserva.patrimonioId) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Patrimônio é obrigatório.'
                });
                return;
            }

            if (!this.reserva.dataDevolucao) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Data de devolução é obrigatória.'
                });
                return;
            }

            if (this.isAdmin && !this.reserva.userId) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Usuário é obrigatório.'
                });
                return;
            }

            // Validação: patrimônio já está reservado
            if (this.isPatrimonioReservado(this.reserva.patrimonioId)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Patrimônio Já Reservado',
                    detail: 'Este patrimônio já está reservado. Escolha outro.'
                });
                return;
            }

            // Validação: patrimônio crítico ou danificado
            if (this.isPatrimonioCriticoOuDanificado(this.reserva.patrimonioId)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Patrimônio Não Disponível',
                    detail: 'Este patrimônio está crítico ou danificado e não pode ser reservado.'
                });
                return;
            }

            // Validação: data inválida
            if (this.isDataInvalida(new Date(), this.reserva.dataDevolucao)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Inválida',
                    detail: 'A data de devolução deve ser posterior a hoje.'
                });
                return;
            }

            // Validação: duplicata (mesmo usuário + patrimônio)
            const userId = this.reserva.userId || this.authService.getUserData()?.id;
            if (userId && this.isDuplicataReserva(this.reserva.patrimonioId, userId)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Reserva Duplicada',
                    detail: 'Este usuário já possui uma reserva ativa para este patrimônio.'
                });
                return;
            }
        }

        if (this.isEditMode) {
            // Update
            const updateData: any = {
                dataDevolucao: this.reserva.dataDevolucao,
                status: this.reserva.status,
                userId: this.reserva.userId
            };
            
            // Adicionar campos opcionais se existirem
            if (this.reserva.motivo) updateData.motivo = this.reserva.motivo;
            if (this.reserva.observacoes) updateData.observacoes = this.reserva.observacoes;
            if (this.reserva.prioridade) updateData.prioridade = this.reserva.prioridade;
            
            this.reservaService.updateReserva(this.reserva.id!, updateData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Reserva atualizada com sucesso'
                    });
                    const statusDisplay = this.reserva.status === 'ativa' ? 'Reservado' : this.reserva.status;
                    this.notificacaoService.notifyReservaAlterada(
                        this.reserva.patrimonioId!,
                        statusDisplay
                    );
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
            const createData: any = {
                patrimonioId: this.reserva.patrimonioId,
                dataDevolucao: this.reserva.dataDevolucao,
                userId: this.reserva.userId || this.authService.getUserData()?.id
            };
            
            // Adicionar campos opcionais se existirem
            if (this.reserva.motivo) createData.motivo = this.reserva.motivo;
            if (this.reserva.observacoes) createData.observacoes = this.reserva.observacoes;
            if (this.reserva.prioridade) createData.prioridade = this.reserva.prioridade;
            
            this.reservaService.createReserva(createData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Reserva criada com sucesso'
                    });
                    this.notificacaoService.notifyReservaAlterada(
                        this.reserva.patrimonioId!,
                        'Reservado'
                    );
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
        if (!this.isAdmin) {
            this.messageService.add({
                severity: 'error',
                summary: 'Acesso Negado',
                detail: 'Apenas administradores podem deletar reservas'
            });
            return;
        }
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja deletar esta reserva?',
            header: 'Confirmar Deleção',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteReserva(reserva.id!);
            }
        });
    }

    deleteReserva(id: number) {
        // Encontrar a reserva para obter o patrimonioId antes de deletar
        const reservaToDelete = this.reservas.find(r => r.id === id);
        
        this.reservaService.deleteReserva(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Reserva deletada com sucesso'
                });
                if (reservaToDelete) {
                    this.notificacaoService.notifyReservaAlterada(
                        reservaToDelete.patrimonioId!,
                        undefined
                    );
                }
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

    // FILTROS E INDICADORES
    handleSearch(term: string) {
        this.searchTerm = (term || '').trim();
        this.applyFilters();
    }

    onFilterChange() {
        this.applyFilters();
    }

    onDateChange() {
        const start = this.dateStart ? new Date(this.dateStart) : null;
        const end = this.dateEnd ? new Date(this.dateEnd) : null;
        this.dateRange = start && end ? [start, end] : null;
        this.applyFilters();
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterStatus = null;
        this.filterUserId = null;
        this.dateRange = null;
        this.dateStart = null;
        this.dateEnd = null;
        this.applyFilters();
    }

    private applyFilters() {
        let data = [...this.reservas];

        // Texto: busca em nome do patrimônio, código, username
        const q = this.searchTerm.toLowerCase();
        if (q) {
            data = data.filter((r: any) => {
                const nomeMatch = (r.patrimonio?.nome || '').toLowerCase().includes(q);
                const codMatch = (r.patrimonio?.codigo || '').toLowerCase().includes(q);
                const userMatch = (r.user?.username || '').toLowerCase().includes(q);
                const idMatch = String(r.id).includes(q);
                return nomeMatch || codMatch || userMatch || idMatch;
            });
        }

        // Status
        if (this.filterStatus) {
            data = data.filter(r => r.status === this.filterStatus);
        }

        // Usuário
        if (this.filterUserId) {
            data = data.filter(r => r.userId === this.filterUserId);
        }

        // Intervalo de datas
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            const start = new Date(this.dateRange[0]);
            const end = new Date(this.dateRange[1]);
            end.setHours(23, 59, 59, 999);
            data = data.filter(r => {
                if (!r.dataReserva) return false;
                const d = new Date(r.dataReserva);
                return d >= start && d <= end;
            });
        }

        this.filteredReservas = data;
    }

    getActiveFiltersCount(): number {
        let n = 0;
        if (this.searchTerm) n++;
        if (this.filterStatus) n++;
        if (this.filterUserId) n++;
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) n++;
        return n;
    }

    // Indicadores
    getTotal(): number {
        return this.filteredReservas.length;
    }

    getTotalGeral(): number {
        return this.reservas.length;
    }

    getAtivas(): number {
        return this.filteredReservas.filter(r => r.status === 'ativa').length;
    }

    getDevolvidas(): number {
        return this.filteredReservas.filter(r => r.status === 'devolvido').length;
    }

    getCanceladas(): number {
        return this.filteredReservas.filter(r => r.status === 'cancelado').length;
    }

    getAtrasadas(): number {
        return this.filteredReservas.filter(r => this.isAtrasada(r)).length;
    }

    getProximas(): number {
        return this.filteredReservas.filter(r => this.isProximaVencer(r)).length;
    }

    // Helpers para avisos visuais
    isAtrasada(reserva: Reserva): boolean {
        if (reserva.status !== 'ativa' || !reserva.dataDevolucao) return false;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const devolucao = new Date(reserva.dataDevolucao);
        devolucao.setHours(0, 0, 0, 0);
        return devolucao < hoje;
    }

    isProximaVencer(reserva: Reserva): boolean {
        if (reserva.status !== 'ativa' || !reserva.dataDevolucao) return false;
        const devolucao = new Date(reserva.dataDevolucao);
        const hoje = new Date();
        const diasAte = Math.ceil((devolucao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diasAte >= 0 && diasAte <= 7;
    }

    getDiasAte(data: string | Date | undefined): number | null {
        if (!data) return null;
        const d = new Date(data);
        const hoje = new Date();
        return Math.ceil((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    }

    getDuracao(dataReserva: Date, dataDevolucao: Date): number {
        const ms = new Date(dataDevolucao).getTime() - new Date(dataReserva).getTime();
        return Math.ceil(ms / (1000 * 60 * 60 * 24));
    }

    // Atalho Ctrl+N: nova reserva
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'n' && this.isAdmin) {
            event.preventDefault();
            this.openNew();
        }
    }
}

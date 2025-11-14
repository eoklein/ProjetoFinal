import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PatrimonioService } from '@/services/patrimonio.service';
import { TipoPatrimonioService } from '@/services/tipoPatrimonio.service';
import { AuthService } from '@/services/auth.service';
import { NotificacaoService } from '@/services/notificacao.service';
import { Patrimonio } from '@/models/patrimonio.model';
import { TipoPatrimonio } from '@/models/tipoPatrimonio.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-patrimonios-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, SelectModule, Toolbar, TooltipModule, TagModule, IconField, InputIcon],
    templateUrl: './patrimonios-list.html',
    providers: [MessageService, ConfirmationService]
})
export class PatrimoniosList implements OnInit {
    patrimonioService = inject(PatrimonioService);
    tipoPatrimonioService = inject(TipoPatrimonioService);
    authService = inject(AuthService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    router = inject(Router);
    notificacaoService = inject(NotificacaoService);

    patrimonios: Patrimonio[] = [];
    filteredPatrimonios: Patrimonio[] = [];
    tiposPatrimonio: TipoPatrimonio[] = [];
    patrimonioDialog: boolean = false;
    patrimonio: Patrimonio = {} as Patrimonio;
    patrimonioOriginal: Patrimonio = {} as Patrimonio;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    isAdmin: boolean = false;
    // Busca e filtros
    searchTerm: string = '';
    filterTipoId: number | null = null;
    filterEstado: string | null = null;
    filterStatus: string | null = null; // reservado, devolvido, cancelado, disponivel
    dateRange: Date[] | null = null; // [start, end]
    dateStart: string | null = null; // yyyy-mm-dd
    dateEnd: string | null = null;   // yyyy-mm-dd
    
    statusOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Danificado', value: 'danificado' },
        { label: 'Bom', value: 'bom' }
    ];

    statusReservaOptions = [
        { label: 'Todos', value: null },
        { label: 'Disponível', value: 'disponivel' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    ngOnInit() {
        this.checkAdmin();
        this.loadTiposPatrimonio();
        this.loadPatrimonios();
        
        // Escutar notificações de mudança de reserva
        this.notificacaoService.getReservaAlterada().subscribe(() => {
            this.loadPatrimonios();
        });
    }

    checkAdmin() {
        this.isAdmin = this.authService.isAdmin();
    }

    loadTiposPatrimonio() {
        this.tipoPatrimonioService.getTiposPatrimonio().subscribe({
            next: (tipos) => {
                this.tiposPatrimonio = tipos;
                this.enrichPatrimonios();
                this.applyFilters();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar tipos de patrimonio'
                });
            }
        });
    }

    loadPatrimonios() {
        this.loading = true;
        this.patrimonioService.getPatrimonios().subscribe({
            next: (patrimonios) => {
                // Backend agora retorna tipoPatrimonioId diretamente
                this.patrimonios = patrimonios;
                this.enrichPatrimonios();
                this.applyFilters();
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

    private enrichPatrimonios() {
        if (!this.patrimonios?.length) {
            this.filteredPatrimonios = [];
            return;
        }
        const tipoMap = new Map<number, string>(this.tiposPatrimonio.map(t => [t.id!, t.nome]));
        this.patrimonios = this.patrimonios.map(p => ({
            ...p,
            // adiciona campo auxiliar para filtro global por nome do tipo
            tipoNome: p.tipoPatrimonioId ? (tipoMap.get(p.tipoPatrimonioId) || '') : ''
        })) as any;
    }

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
        this.filterTipoId = null;
        this.filterEstado = null;
        this.filterStatus = null;
        this.dateRange = null;
        this.dateStart = null;
        this.dateEnd = null;
        this.applyFilters();
    }

    private applyFilters() {
        let data = [...this.patrimonios];

        // Texto: busca em id, nome, codigo, tipoNome
        const q = this.searchTerm.toLowerCase();
        if (q) {
            data = data.filter((p: any) => {
                const idMatch = String(p.id).includes(q);
                const nomeMatch = (p.nome || '').toLowerCase().includes(q);
                const codMatch = (p.codigo || '').toLowerCase().includes(q);
                const tipoMatch = (p.tipoNome || '').toLowerCase().includes(q);
                return idMatch || nomeMatch || codMatch || tipoMatch;
            });
        }

        // Tipo
        if (this.filterTipoId) {
            data = data.filter(p => p.tipoPatrimonioId === this.filterTipoId);
        }

        // Estado (critico, danificado, bom)
        if (this.filterEstado) {
            data = data.filter(p => p.estado === this.filterEstado);
        }

        // Status de reserva (reservado, devolvido, cancelado, disponivel)
        if (this.filterStatus) {
            if (this.filterStatus === 'disponivel') {
                data = data.filter(p => !p.status);
            } else {
                data = data.filter(p => p.status === this.filterStatus);
            }
        }

        // Intervalo de datas (campo p.data)
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
            const start = new Date(this.dateRange[0]);
            const end = new Date(this.dateRange[1]);
            // normalizar fim do dia
            end.setHours(23, 59, 59, 999);
            data = data.filter(p => {
                if (!p.data) return false;
                const d = new Date(p.data);
                return d >= start && d <= end;
            });
        }

        this.filteredPatrimonios = data;
    }

    // Indicadores (contadores) com base na lista filtrada
    getTotal(): number {
        return this.filteredPatrimonios.length;
    }

    getTotalGeral(): number {
        return this.patrimonios.length;
    }

    getDisponiveis(): number {
        return this.filteredPatrimonios.filter(p => !p.status).length;
    }

    getReservados(): number {
        return this.filteredPatrimonios.filter(p => p.status === 'reservado').length;
    }

    getDevolvidos(): number {
        return this.filteredPatrimonios.filter(p => p.status === 'devolvido').length;
    }

    getCancelados(): number {
        return this.filteredPatrimonios.filter(p => p.status === 'cancelado').length;
    }

    getCriticos(): number {
        return this.filteredPatrimonios.filter(p => p.estado === 'critico').length;
    }

    getDanificados(): number {
        return this.filteredPatrimonios.filter(p => p.estado === 'danificado').length;
    }

    getBons(): number {
        return this.filteredPatrimonios.filter(p => p.estado === 'bom').length;
    }

    getActiveFiltersCount(): number {
        let n = 0;
        if (this.searchTerm) n++;
        if (this.filterTipoId) n++;
        if (this.filterEstado) n++;
        if (this.filterStatus) n++;
        if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) n++;
        return n;
    }

    openNew() {
        this.patrimonio = { estado: 'danificado' } as Patrimonio;
        this.submitted = false;
        this.isEditMode = false;
        this.patrimonioDialog = true;
    }

    editPatrimonio(patrimonio: Patrimonio) {
        this.patrimonioOriginal = { ...patrimonio };
        this.patrimonio = { ...patrimonio };
        this.isEditMode = true;
        this.patrimonioDialog = true;
    }

    hideDialog() {
        this.patrimonioDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    saveContact() {
        this.submitted = true;

        // Restaurar campos vazios com valores originais durante edição
        if (this.isEditMode) {
            if (!this.patrimonio.nome?.trim()) {
                this.patrimonio.nome = this.patrimonioOriginal.nome;
            }
            if (!this.patrimonio.estado) {
                this.patrimonio.estado = this.patrimonioOriginal.estado;
            }
            if (!this.patrimonio.tipoPatrimonioId) {
                this.patrimonio.tipoPatrimonioId = this.patrimonioOriginal.tipoPatrimonioId;
            }
        }

        // Validação diferenciada: criar requer todos os campos, editar é opcional
        const isValid = this.isEditMode 
            ? true  // Edição: não requer validação (todos os campos são opcionais)
            : (this.patrimonio.nome?.trim() && this.patrimonio.estado && this.patrimonio.tipoPatrimonioId);  // Criação: requer os 3 campos

        if (isValid) {
            if (this.patrimonio.id) {
                // Update
                let patrimonioId: any = this.patrimonio.id;
                
                // Sanitizar ID se vir malformado (ex: "6:1" -> 6)
                if (typeof patrimonioId === 'string') {
                    patrimonioId = parseInt(patrimonioId.split(':')[0], 10);
                } else {
                    patrimonioId = parseInt(patrimonioId, 10);
                }
                
                // Criar objeto limpo com apenas os campos do Patrimonio (sem ID)
                const patrimonioAtualizado: any = {};
                
                // Copiar apenas os campos válidos de Patrimonio
                if (this.patrimonio.nome !== undefined) patrimonioAtualizado.nome = this.patrimonio.nome;
                if (this.patrimonio.estado !== undefined) patrimonioAtualizado.estado = this.patrimonio.estado;
                if (this.patrimonio.tipoPatrimonioId !== undefined) patrimonioAtualizado.tipoPatrimonioId = this.patrimonio.tipoPatrimonioId;
                if (this.patrimonio.valor !== undefined) patrimonioAtualizado.valor = this.patrimonio.valor;
                if (this.patrimonio.codigo !== undefined) patrimonioAtualizado.codigo = this.patrimonio.codigo;
                
                this.patrimonioService.updatePatrimonio(patrimonioId, patrimonioAtualizado).subscribe({
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
        // Validar se está reservado
        if (patrimonio.status === 'reservado') {
            this.messageService.add({
                severity: 'error',
                summary: 'Não é Possível Deletar',
                detail: `O patrimônio "${patrimonio.nome}" está reservado. Cancele a reserva antes de deletar.`,
                life: 5000
            });
            return;
        }
        
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o patrimonio "${patrimonio.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
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

    getTipoNome(tipoId?: number): string {
        if (!tipoId) return 'N/A';
        const tipo = this.tiposPatrimonio.find(t => t.id === tipoId);
        return tipo ? tipo.nome : 'N/A';
    }

    // Helpers para avisos visuais
    isCritico(patrimonio: Patrimonio): boolean {
        return patrimonio.estado === 'critico';
    }

    isDevolucaoProxima(patrimonio: Patrimonio): boolean {
        if (!patrimonio.dataDevolucao || patrimonio.status !== 'reservado') return false;
        const devolucao = new Date(patrimonio.dataDevolucao);
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

    // Atalho Ctrl+N: novo patrimônio
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'n' && this.isAdmin) {
            event.preventDefault();
            this.openNew();
        }
    }

    openReservaDialog() {
        this.router.navigate(['/home/reservas']);
    }
}

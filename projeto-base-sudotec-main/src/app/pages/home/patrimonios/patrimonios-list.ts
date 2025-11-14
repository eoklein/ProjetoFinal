import { Component, inject, OnInit } from '@angular/core';
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
    
    // Filter variables
    selectedTipo: number | null = null;
    selectedEstado: string | null = null;
    selectedStatus: string | null = null;
    globalSearchTerm: string = '';
    
    // Filter options
    tipoFilterOptions: any[] = [];
    estadoFilterOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Danificado', value: 'danificado' },
        { label: 'Bom', value: 'bom' }
    ];
    statusFilterOptions = [
        { label: 'Disponível', value: 'disponivel' },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];
    
    statusOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Danificado', value: 'danificado' },
        { label: 'Bom', value: 'bom' }
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
                // Build filter options for tipo
                this.tipoFilterOptions = tipos.map(t => ({
                    label: t.nome,
                    value: t.id
                }));
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

    onGlobalSearch(value: string) {
        this.globalSearchTerm = value.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        this.filteredPatrimonios = this.patrimonios.filter(p => {
            // Global search filter (nome or codigo)
            const matchesSearch = !this.globalSearchTerm || 
                p.nome?.toLowerCase().includes(this.globalSearchTerm) ||
                p.codigo?.toLowerCase().includes(this.globalSearchTerm);
            
            // Tipo filter
            const matchesTipo = !this.selectedTipo || p.tipoPatrimonioId === this.selectedTipo;
            
            // Estado filter
            const matchesEstado = !this.selectedEstado || p.estado === this.selectedEstado;
            
            // Status filter
            let matchesStatus = true;
            if (this.selectedStatus) {
                if (this.selectedStatus === 'disponivel') {
                    matchesStatus = !p.status || p.status === '';
                } else {
                    matchesStatus = p.status === this.selectedStatus;
                }
            }
            
            return matchesSearch && matchesTipo && matchesEstado && matchesStatus;
        });
    }

    // Summary methods
    getTotalPatrimonios(): number {
        return this.patrimonios.length;
    }

    getPatrimoniosDisponiveis(): number {
        return this.patrimonios.filter(p => !p.status || p.status === '').length;
    }

    getPatrimoniosReservados(): number {
        return this.patrimonios.filter(p => p.status === 'reservado').length;
    }

    getPatrimoniosCriticos(): number {
        return this.patrimonios.filter(p => p.estado === 'critico').length;
    }

    // Check if devolucao is near (within 7 days)
    isNearDevolucao(dataDevolucao: Date): boolean {
        if (!dataDevolucao) return false;
        const today = new Date();
        const devolucao = new Date(dataDevolucao);
        const diffTime = devolucao.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
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
        const statusInfo = patrimonio.status === 'reservado' 
            ? '<br><br><strong class="text-orange-500">⚠️ Atenção:</strong> Este patrimônio está atualmente reservado!' 
            : '';
        
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o patrimônio <strong>"${patrimonio.nome}"</strong>?${statusInfo}<br><br>Esta ação não pode ser desfeita.`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim, deletar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
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

    openReservaDialog() {
        this.router.navigate(['/home/reservas']);
    }
}

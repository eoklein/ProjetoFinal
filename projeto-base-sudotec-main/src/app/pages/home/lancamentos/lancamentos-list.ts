import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { Message } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EstoqueService } from '@/services/estoque.service';
import { TipoPatrimonioService } from '@/services/tipoPatrimonio.service';
import { PatrimonioService } from '@/services/patrimonio.service';
import { AuthService } from '@/services/auth.service';
import { NotificacaoService } from '@/services/notificacao.service';
import { Estoque } from '@/models/estoque.model';
import { TipoPatrimonio } from '@/models/tipoPatrimonio.model';
import { Patrimonio } from '@/models/patrimonio.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-lancamentos-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, DatePicker, RadioButton, Select, Checkbox, Toolbar, TooltipModule, TagModule, IconField, InputIcon, Message],
    templateUrl: './lancamentos-list.html',
    providers: [MessageService, ConfirmationService]
})
export class LancamentosList implements OnInit {
    estoqueService = inject(EstoqueService);
    tipoPatrimonioService = inject(TipoPatrimonioService);
    patrimonioService = inject(PatrimonioService);
    authService = inject(AuthService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);
    notificacaoService = inject(NotificacaoService);

    estoques: Estoque[] = [];
    estoquesFiltrados: Patrimonio[] = [];
    tiposPatrimonio: TipoPatrimonio[] = [];
    patrimonios: Patrimonio[] = [];
    estoqueDialog: boolean = false;
    patrimonioDialog: boolean = false;
    estoque: Estoque = {} as Estoque;
    estoqueOriginal: Estoque = {} as Estoque;
    novoPatrimonio: any = {};
    patrimonioOriginal: any = {};
    submitted: boolean = false;
    patrimonioSubmitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    temRetirada: boolean = false;
    numeroRetiradas: number = 1;
    isAdmin: boolean = false;

    // Filtros
    filtroEstado: string = '';
    filtroStatus: string = '';
    filtroTipo: number = 0;

    estadoFiltros = [
        { label: 'Todos', value: '' },
        { label: 'Crítico', value: 'critico' },
        { label: 'Danificado', value: 'danificado' },
        { label: 'Bom', value: 'bom' }
    ];

    statusFiltros = [
        { label: 'Todos', value: '' },
        { label: 'Disponível', value: null },
        { label: 'Reservado', value: 'reservado' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Cancelado', value: 'cancelado' }
    ];

    statusOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Danificado', value: 'danificado' },
        { label: 'Bom', value: 'bom' }
    ];

    // Controle de navegação por mês/ano
    mesAtual: number = new Date().getMonth();
    anoAtual: number = new Date().getFullYear();
    mesSelecionado: number = this.mesAtual;
    anoSelecionado: number = this.anoAtual;

    mesesNomes: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    ngOnInit() {
        this.checkAdmin();
        this.loadCategorias();
        this.loadPatrimonios();
        
        // Escutar notificações de mudança de reserva
        this.notificacaoService.getReservaAlterada().subscribe(() => {
            this.loadPatrimonios();
        });
    }

    checkAdmin() {
        this.isAdmin = this.authService.isAdmin();
    }

    loadCategorias() {
        this.tipoPatrimonioService.getTiposPatrimonio().subscribe({
            next: (categorias) => {
                this.tiposPatrimonio = categorias;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar categorias'
                });
            }
        });
    }

    loadPatrimonios() {
        this.patrimonioService.getPatrimoniosCompartilhados().subscribe({
            next: (patrimonios) => {
                this.patrimonios = patrimonios;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar patrimonios'
                });
            }
        });
    }

    loadEstoques() {
        this.loading = true;
        console.log('Recarregando estoques...');
        this.estoqueService.getEstoquesCompartilhados().subscribe({
            next: (estoques) => {
                // Os dados já vêm do backend com patrimonioId
                console.log('Estoques carregados:', estoques);
                // Garantir que cada estoque tenha patrimonioId
                this.estoques = (estoques as any[]).map(e => {
                    // Se não tem patrimonioId mas tem patrimonio.id, copiar
                    if (!e.patrimonioId && e.patrimonio?.id) {
                        e.patrimonioId = e.patrimonio.id;
                    }
                    return e;
                });
                this.loading = false;
                console.log('Estoques atualizados na UI');
            },
            error: (err) => {
                console.error('Erro ao carregar estoques:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar estoques'
                });
                this.loading = false;
            }
        });
    }

    filtrarEstoquesPorMesAno() {
        // Método mantido para compatibilidade, mas não faz mais nada
    }

    mesAnterior() {
        // Método mantido para compatibilidade, mas não faz mais nada
    }

    proximoMes() {
        // Método mantido para compatibilidade, mas não faz mais nada
    }

    voltarMesAtual() {
        // Método mantido para compatibilidade, mas não faz mais nada
    }

    get mesAnoSelecionado(): string {
        return `${this.mesesNomes[this.mesSelecionado]} ${this.anoSelecionado}`;
    }

    get isNoPeriodoAtual(): boolean {
        return this.mesSelecionado === this.mesAtual && this.anoSelecionado === this.anoAtual;
    }

    openNew() {
        this.estoque = { valor: 0, data: new Date(), tipo: 'DESPESA', efetivado: false } as Estoque;
        this.submitted = false;
        this.isEditMode = false;
        this.temRetirada = false;
        this.numeroRetiradas = 1;
        this.estoqueDialog = true;
    }

    editEstoque(patrimonio: any) {
        // Abre o diálogo para editar o patrimonio - MESMO PADRÃO DE PATRIMONIOS-LIST
        this.patrimonioOriginal = { ...patrimonio };
        this.novoPatrimonio = { ...patrimonio };
        this.isEditMode = true;
        this.patrimonioSubmitted = false;
        this.patrimonioDialog = true;
    }

    hideDialog() {
        this.estoqueDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    saveEstoque() {
        this.submitted = true;
        console.log('Dados do estoque antes de salvar:', JSON.stringify(this.estoque, null, 2));

        // Restaurar campos vazios com valores originais durante edição
        if (this.isEditMode) {
            if (!this.estoque.descricao?.trim()) {
                this.estoque.descricao = this.estoqueOriginal.descricao;
            }
            if (this.estoque.valor === undefined || this.estoque.valor === null) {
                this.estoque.valor = this.estoqueOriginal.valor;
            }
            if (!this.estoque.data) {
                this.estoque.data = this.estoqueOriginal.data;
            }
            if (!this.estoque.tipo) {
                this.estoque.tipo = this.estoqueOriginal.tipo;
            }
        }

        // Validação diferenciada: criar requer todos os campos, editar é opcional
        const isValid = this.isEditMode 
            ? true  // Edição: não requer validação (todos os campos são opcionais)
            : (this.estoque.descricao?.trim() && this.estoque.valor !== undefined && this.estoque.data && this.estoque.tipo);  // Criação: requer os campos

        if (isValid) {
            // Garante que efetivado seja sempre um booleano
            if (this.estoque.efetivado === undefined || this.estoque.efetivado === null) {
                this.estoque.efetivado = false;
            }

            if (this.estoque.id) {
                // Update - Sanitizar ID e criar objeto limpo
                let estoqueId: any = this.estoque.id;
                
                // Sanitizar ID se vir malformado
                if (typeof estoqueId === 'string') {
                    estoqueId = parseInt(estoqueId.split(':')[0], 10);
                } else {
                    estoqueId = parseInt(estoqueId, 10);
                }
                
                const estoqueParaEnviar: any = {
                    descricao: this.estoque.descricao,
                    valor: this.estoque.valor,
                    data: this.estoque.data,
                    tipo: this.estoque.tipo,
                    tipoPatrimonioId: this.estoque.tipoPatrimonioId,
                    patrimonioId: this.estoque.patrimonioId,
                    efetivado: this.estoque.efetivado
                };
                
                this.estoqueService.updateEstoque(estoqueId, estoqueParaEnviar).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Estoque atualizado com sucesso'
                        });
                        this.loadEstoques();
                        this.estoqueDialog = false;
                        this.estoque = {} as Estoque;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar estoque'
                        });
                    }
                });
            } else {
                // Create - Criar objeto limpo com apenas os campos esperados pelo backend
                const estoqueParaEnviar: any = {
                    descricao: this.estoque.descricao,
                    valor: this.estoque.valor,
                    data: this.estoque.data,
                    tipo: this.estoque.tipo,
                    tipoPatrimonioId: this.estoque.tipoPatrimonioId,
                    patrimonioId: this.estoque.patrimonioId,
                    efetivado: this.estoque.efetivado
                };
                
                this.estoqueService.createEstoque(estoqueParaEnviar).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Estoque criado com sucesso'
                        });
                        this.loadEstoques();
                        this.estoqueDialog = false;
                        this.estoque = {} as Estoque;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao criar estoque'
                        });
                    }
                });
            }
        }
    }

    confirmDelete(patrimonio: any) {
        // Usa o ID direto do patrimonio
        const patrimonioId = patrimonio.id;
        
        if (!patrimonioId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Patrimonio não identificado'
            });
            return;
        }

        const patrimonioNome = patrimonio.nome || 'Patrimonio';

        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o patrimonio "${patrimonioNome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deletePatrimonio(patrimonioId);
            }
        });
    }

    confirmDeleteEstoque(estoque: Estoque) {
        const estoqueId = estoque.id;
        const descricao = estoque.descricao || 'Estoque';

        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o estoque "${descricao}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteEstoque(estoqueId!);
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
                this.loadEstoques();
            },
            error: (err) => {
                console.error('Erro ao deletar patrimonio:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: err.error?.error || 'Erro ao deletar patrimonio'
                });
            }
        });
    }

    deleteEstoque(id: number) {
        this.estoqueService.deleteEstoque(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Estoque deletado com sucesso'
                });
                this.loadEstoques();
            },
            error: (err) => {
                console.error('Erro ao deletar estoque:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: err.error?.error || 'Erro ao deletar estoque'
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

    formatDate(value: Date | string): string {
        const date = typeof value === 'string' ? new Date(value) : value;
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }

    getTipoPatrimonioNome(tipoPatrimonioId?: number): string {
        if (!tipoPatrimonioId) return '-';
        const tipoPatrimonio = this.tiposPatrimonio.find((tp) => tp.id === tipoPatrimonioId);
        return tipoPatrimonio?.nome || '-';
    }

    getPatrimonioNome(patrimonioId?: number): string {
        if (!patrimonioId) return '-';
        const patrimonio = this.patrimonios.find((c) => c.id === patrimonioId);
        return patrimonio?.nome || '-';
    }

    criarEstoquesComRetiradas() {
        const valorRetirada = this.estoque.valor / this.numeroRetiradas;
        const dataBase = new Date(this.estoque.data);
        let retirasRestantes = this.numeroRetiradas;
        let retirasErro = 0;

        for (let i = 0; i < this.numeroRetiradas; i++) {
            const dataRetirada = new Date(dataBase);
            dataRetirada.setDate(dataRetirada.getDate() + i * 30);

            const retirada: Estoque = {
                ...this.estoque,
                valor: valorRetirada,
                data: dataRetirada,
                descricao: `${this.estoque.descricao} (${i + 1}/${this.numeroRetiradas})`,
                numeroRetiradas: this.numeroRetiradas,
                retiradaAtual: i + 1
            };

            this.estoqueService.createEstoque(retirada).subscribe({
                next: () => {
                    retirasRestantes--;
                    if (retirasRestantes === 0 && retirasErro === 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${this.numeroRetiradas} retiradas criadas com sucesso`
                        });
                        this.loadEstoques();
                        this.estoqueDialog = false;
                        this.estoque = {} as Estoque;
                    } else if (retirasRestantes === 0 && retirasErro > 0) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Parcialmente Concluído',
                            detail: `${this.numeroRetiradas - retirasErro} de ${this.numeroRetiradas} retiradas criadas`
                        });
                        this.loadEstoques();
                        this.estoqueDialog = false;
                        this.estoque = {} as Estoque;
                    }
                },
                error: () => {
                    retirasRestantes--;
                    retirasErro++;
                    if (retirasRestantes === 0) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao criar retiradas. ${retirasErro} retirada(s) falharam`
                        });
                        if (retirasErro < this.numeroRetiradas) {
                            this.loadEstoques();
                        }
                    }
                }
            });
        }
    }

    get valorRetirada(): number {
        if (!this.temRetirada || this.numeroRetiradas <= 1) {
            return this.estoque.valor || 0;
        }
        return (this.estoque.valor || 0) / this.numeroRetiradas;
    }

    toggleEfetivado(estoque: Estoque) {
        // Inverte o valor manualmente já que não temos mais ngModel
        estoque.efetivado = !estoque.efetivado;
        const novoStatus = estoque.efetivado;
        const estoqueAtualizado = { ...estoque, efetivado: novoStatus };

        console.log('Toggling efetivado for estoque:', estoque.id);
        console.log('Novo status efetivado:', novoStatus);

        // Atualiza apenas o status do estoque
        this.estoqueService.updateEstoque(estoque.id!, estoqueAtualizado).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: novoStatus ? 'Estoque efetivado com sucesso' : 'Estoque desefetivado com sucesso'
                });
                this.loadEstoques();
                this.loadPatrimonios();
            },
            error: () => {
                // Reverte em caso de erro
                estoque.efetivado = !estoque.efetivado;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao atualizar status do estoque'
                });
            }
        });
    }

    openPatrimonioDialog() {
        this.novoPatrimonio = {};
        this.patrimonioSubmitted = false;
        this.patrimonioDialog = true;
    }

    hidePatrimonioDialog() {
        this.patrimonioDialog = false;
        this.novoPatrimonio = {};
        this.patrimonioSubmitted = false;
        this.isEditMode = false;
    }

    confirmDeletePatrimonio() {
        // Placeholder - o usuário deve selecionar um patrimonio na tabela
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Use o botão de deletar da linha do patrimonio'
        });
    }

    savePatrimonio() {
        this.patrimonioSubmitted = true;

        // Restaurar campos vazios com valores originais durante edição
        if (this.isEditMode) {
            if (!this.novoPatrimonio.nome?.trim()) {
                this.novoPatrimonio.nome = this.patrimonioOriginal.nome;
            }
            if (!this.novoPatrimonio.estado) {
                this.novoPatrimonio.estado = this.patrimonioOriginal.estado;
            }
            if (!this.novoPatrimonio.tipoPatrimonioId) {
                this.novoPatrimonio.tipoPatrimonioId = this.patrimonioOriginal.tipoPatrimonioId;
            }
        }

        // Validação diferenciada: criar requer todos os campos, editar é opcional
        const isValid = this.isEditMode 
            ? true  // Edição: não requer validação (todos os campos são opcionais)
            : (this.novoPatrimonio.nome?.trim() && this.novoPatrimonio.estado && this.novoPatrimonio.tipoPatrimonioId);  // Criação: requer os campos

        if (!isValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validação',
                detail: 'Preencha todos os campos obrigatórios'
            });
            return;
        }

        if (this.isEditMode) {
            // Update - Sanitizar ID e criar objeto limpo
            let patrimonioId: any = this.novoPatrimonio.id;
            
            // Sanitizar ID se vir malformado (ex: "6:1" -> 6)
            if (typeof patrimonioId === 'string') {
                patrimonioId = parseInt(patrimonioId.split(':')[0], 10);
            } else {
                patrimonioId = parseInt(patrimonioId, 10);
            }
            
            const patrimonioParaEnviar: any = {
                nome: this.novoPatrimonio.nome,
                estado: this.novoPatrimonio.estado,
                tipoPatrimonioId: this.novoPatrimonio.tipoPatrimonioId,
                valor: this.novoPatrimonio.valor,
                codigo: this.novoPatrimonio.codigo
            };
            
            this.patrimonioService.updatePatrimonio(patrimonioId, patrimonioParaEnviar).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Patrimonio atualizado com sucesso'
                    });
                    this.hidePatrimonioDialog();
                    this.loadPatrimonios();
                },
                error: (erro) => {
                    console.error('Erro ao atualizar patrimonio:', erro);
                    const mensagemErro = erro.error?.error || erro.message || 'Erro ao atualizar patrimonio';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: mensagemErro
                    });
                }
            });
        } else {
            // Create - Criar objeto limpo com apenas os campos esperados pelo backend
            const patrimonioParaEnviar: any = {
                nome: this.novoPatrimonio.nome,
                estado: this.novoPatrimonio.estado,
                tipoPatrimonioId: this.novoPatrimonio.tipoPatrimonioId,
                valor: this.novoPatrimonio.valor,
                codigo: this.novoPatrimonio.codigo
            };
            
            this.patrimonioService.createPatrimonio(patrimonioParaEnviar).subscribe({
                next: (novoPatrimonio) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Patrimonio criado com sucesso'
                    });
                    this.hidePatrimonioDialog();
                    this.loadPatrimonios();
                    
                    // Aguardar um pouco para garantir que o patrimonio foi criado no banco
                    setTimeout(() => {
                        // Criar um estoque para exibir o patrimonio na tabela
                        const estoqueDoPatrimonio: Estoque = {
                            descricao: this.novoPatrimonio.descricao,
                            valor: 0,
                            data: new Date(),
                            tipo: 'RECEITA',
                            patrimonioId: novoPatrimonio.id,
                            tipoPatrimonioId: undefined,
                            efetivado: false
                        } as Estoque;

                        this.estoqueService.createEstoque(estoqueDoPatrimonio).subscribe({
                            next: () => {
                                console.log('Estoque criado, recarregando lista...');
                                // Forçar recarregar os estoques sem cache
                                this.loading = true;
                                this.loadEstoques();
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Sucesso',
                                    detail: 'Patrimonio e estoque criados com sucesso'
                                });
                            },
                            error: (erro) => {
                                console.error('Erro ao criar estoque do patrimonio:', erro);
                                this.loadEstoques();
                            }
                        });
                    }, 500);
                },
                error: (erro) => {
                    console.error('Erro ao criar patrimonio:', erro);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao criar patrimonio'
                    });
                }
            });
        }
    }

    getTipoNome(tipoId?: number): string {
        if (!tipoId) return 'N/A';
        const tipo = this.tiposPatrimonio.find(t => t.id === tipoId);
        return tipo ? tipo.nome : 'N/A';
    }

    // Métodos para Indicadores
    contarDisponivel(): number {
        return this.patrimonios.filter(p => !p.status || p.status === 'devolvido' || p.status === 'cancelado').length;
    }

    contarReservado(): number {
        return this.patrimonios.filter(p => p.status === 'reservado').length;
    }

    contarCriticos(): number {
        return this.patrimonios.filter(p => p.estado === 'critico').length;
    }

    isDatasProxima(date?: Date): boolean {
        if (!date) return false;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataDev = new Date(date);
        dataDev.setHours(0, 0, 0, 0);
        const diff = (dataDev.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 3;
    }

    temAlerts(): boolean {
        return this.patrimonios.some(p =>
            p.status === 'reservado' && this.isDatasProxima(p.dataDevolucao)
        );
    }

    contarAlertas(): number {
        return this.patrimonios.filter(p =>
            p.status === 'reservado' && this.isDatasProxima(p.dataDevolucao)
        ).length;
    }

    getIconEstado(estado: string): string {
        switch (estado) {
            case 'critico': return 'pi pi-exclamation-triangle';
            case 'danificado': return 'pi pi-wrench';
            case 'bom': return 'pi pi-check';
            default: return '';
        }
    }

    // Métodos para Filtros
    aplicarFiltros() {
        let patrimoniosFiltrados = [...this.patrimonios];

        if (this.filtroEstado) {
            patrimoniosFiltrados = patrimoniosFiltrados.filter(p => p.estado === this.filtroEstado);
        }

        if (this.filtroStatus !== '') {
            patrimoniosFiltrados = patrimoniosFiltrados.filter(p => p.status === this.filtroStatus);
        }

        if (this.filtroTipo) {
            patrimoniosFiltrados = patrimoniosFiltrados.filter(p => p.tipoPatrimonioId === this.filtroTipo);
        }

        this.estoquesFiltrados = patrimoniosFiltrados;
    }

    limparFiltros() {
        this.filtroEstado = '';
        this.filtroStatus = '';
        this.filtroTipo = 0;
        this.estoquesFiltrados = [];
    }

    // Atalhos de Teclado
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // Ctrl/Cmd + N: Novo
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.openNew();
        }
        // Escape: Fechar dialogs
        if (event.key === 'Escape') {
            event.preventDefault();
            this.hideDialog();
            this.hidePatrimonioDialog();
        }
        // Enter: Salvar (quando em dialog)
        if (event.key === 'Enter' && this.estoqueDialog) {
            event.preventDefault();
            this.saveEstoque();
        }
        // Ctrl/Cmd + Shift + C: Limpar filtros
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            this.limparFiltros();
        }
    }
}


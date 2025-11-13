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
import { DatePicker } from 'primeng/datepicker';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LancamentoService } from '@/services/lancamento.service';
import { TipoPatrimonioService } from '@/services/tipoPatrimonio.service';
import { PatrimonioService } from '@/services/patrimonio.service';
import { Estoque } from '@/models/estoque.model';
import { TipoPatrimonio } from '@/models/tipoPatrimonio.model';
import { Patrimonio } from '@/models/patrimonio.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-lancamentos-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, DatePicker, RadioButton, Select, Checkbox, Toolbar, TooltipModule, TagModule, IconField, InputIcon],
    templateUrl: './lancamentos-list.html',
    providers: [MessageService, ConfirmationService]
})
export class LancamentosList implements OnInit {
    lancamentoService = inject(LancamentoService);
    tipoPatrimonioService = inject(TipoPatrimonioService);
    patrimonioService = inject(PatrimonioService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    estoques: Estoque[] = [];
    estoquesFiltrados: Estoque[] = [];
    tiposPatrimonio: TipoPatrimonio[] = [];
    patrimonios: Patrimonio[] = [];
    estoqueDialog: boolean = false;
    patrimonioDialog: boolean = false;
    estoque: Estoque = {} as Estoque;
    novoPatrimonio: any = {};
    submitted: boolean = false;
    patrimonioSubmitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    temRetirada: boolean = false;
    numeroRetiradas: number = 1;

    statusOptions = [
        { label: 'Crítico', value: 'critico' },
        { label: 'Normal', value: 'normal' },
        { label: 'Bom', value: 'bom' }
    ];

    // Controle de navegação por mês/ano
    mesAtual: number = new Date().getMonth();
    anoAtual: number = new Date().getFullYear();
    mesSelecionado: number = this.mesAtual;
    anoSelecionado: number = this.anoAtual;

    mesesNomes: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    ngOnInit() {
        this.loadCategorias();
        this.loadPatrimonios();
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
        this.patrimonioService.getPatrimonios().subscribe({
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
        this.lancamentoService.getLancamentos().subscribe({
            next: (estoques) => {
                this.estoques = estoques;
                this.loading = false;
            },
            error: () => {
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
        // Abre o diálogo para editar o patrimonio
        this.novoPatrimonio = {
            id: patrimonio.id,
            nome: patrimonio.nome,
            status: patrimonio.status
        };
        this.patrimonioSubmitted = false;
        this.patrimonioDialog = true;
    }

    hideDialog() {
        this.estoqueDialog = false;
        this.submitted = false;
    }

    saveEstoque() {
        this.submitted = true;
        console.log('Dados do estoque antes de salvar:', JSON.stringify(this.estoque, null, 2));

        if (this.estoque.descricao?.trim() && this.estoque.valor !== undefined && this.estoque.data && this.estoque.tipo) {
            // Garante que efetivado seja sempre um booleano
            if (this.estoque.efetivado === undefined || this.estoque.efetivado === null) {
                this.estoque.efetivado = false;
            }

            // Log para debug
            console.log('Salvando estoque:', JSON.stringify(this.estoque, null, 2));
            console.log('Campo efetivado:', this.estoque.efetivado, 'Tipo:', typeof this.estoque.efetivado);

            if (this.estoque.id) {
                // Update
                // Guarda o estoque original para comparar mudanças no saldo
                const estoqueOriginalId = this.estoque.id;
                this.lancamentoService.getLancamentoById(estoqueOriginalId).subscribe({
                    next: (estoqueOriginal) => {
                        this.lancamentoService.updateLancamento(estoqueOriginalId, this.estoque).subscribe({
                            next: () => {
                                // Atualiza o saldo se necessário
                                if (
                                    this.estoque.patrimonioId &&
                                    (estoqueOriginal.efetivado !== this.estoque.efetivado ||
                                        estoqueOriginal.valor !== this.estoque.valor ||
                                        estoqueOriginal.patrimonioId !== this.estoque.patrimonioId ||
                                        estoqueOriginal.tipo !== this.estoque.tipo)
                                ) {
                                    // this.atualizarSaldoContaAoSalvar(estoqueOriginal);
                                }

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
                    }
                });
            } else {
                // Create
                console.log('Criando novo estoque');
                if (this.temRetirada && this.numeroRetiradas > 1) {
                    this.criarEstoquesComRetiradas();
                } else {
                    // Guarda uma cópia do estoque antes de salvar
                    const estoqueParaSalvar = { ...this.estoque };

                    this.lancamentoService.createLancamento(estoqueParaSalvar).subscribe({
                        next: () => {
                            // Atualiza o saldo se o lançamento está efetivado e tem Patrimonio
                            // Usa a cópia guardada ao invés de this.lancamento
                            if (estoqueParaSalvar.patrimonioId && estoqueParaSalvar.efetivado) {
                                console.log('Atualizando saldo da Patrimonio após criar estoque efetivado');
                                // this.atualizarSaldoContaParaEstoque(estoqueParaSalvar);
                            }

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
    }

    confirmDelete(estoque: Estoque) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o patrimonio "${(estoque as any).nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deletePatrimonio(estoque.id!);
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

    deleteEstoque(id: number) {
        this.lancamentoService.deleteLancamento(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Estoque deletado com sucesso'
                });
                this.loadEstoques();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar estoque'
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

            this.lancamentoService.createLancamento(retirada).subscribe({
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
        this.lancamentoService.updateLancamento(estoque.id!, estoqueAtualizado).subscribe({
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
    }

    confirmDeletePatrimonio() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Selecione um patrimonio na tabela para deletá-lo'
        });
    }

    savePatrimonio() {
        this.patrimonioSubmitted = true;

        if (!this.novoPatrimonio.descricao || !this.novoPatrimonio.status) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validação',
                detail: 'Preencha todos os campos obrigatórios'
            });
            return;
        }

        this.patrimonioService.createPatrimonio(this.novoPatrimonio).subscribe({
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

                    this.lancamentoService.createLancamento(estoqueDoPatrimonio).subscribe({
                        next: () => {
                            this.loadEstoques();
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Sucesso',
                                detail: 'Estoque criado com sucesso'
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


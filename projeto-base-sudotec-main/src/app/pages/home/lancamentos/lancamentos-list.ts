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
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, DatePicker, RadioButton, Select, Checkbox, Toolbar, TooltipModule, IconField, InputIcon],
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
    estoque: Estoque = {} as Estoque;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    temRetirada: boolean = false;
    numeroRetiradas: number = 1;

    // Controle de navegação por mês/ano
    mesAtual: number = new Date().getMonth();
    anoAtual: number = new Date().getFullYear();
    mesSelecionado: number = this.mesAtual;
    anoSelecionado: number = this.anoAtual;

    mesesNomes: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    ngOnInit() {
        this.loadEstoques();
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
                this.filtrarEstoquesPorMesAno();
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
        this.estoquesFiltrados = this.estoques.filter((estoque) => {
            const dataEstoque = new Date(estoque.data);
            return dataEstoque.getMonth() === this.mesSelecionado && dataEstoque.getFullYear() === this.anoSelecionado;
        });
    }

    mesAnterior() {
        if (this.mesSelecionado === 0) {
            this.mesSelecionado = 11;
            this.anoSelecionado--;
        } else {
            this.mesSelecionado--;
        }
        this.filtrarEstoquesPorMesAno();
    }

    proximoMes() {
        if (this.mesSelecionado === 11) {
            this.mesSelecionado = 0;
            this.anoSelecionado++;
        } else {
            this.mesSelecionado++;
        }
        this.filtrarEstoquesPorMesAno();
    }

    voltarMesAtual() {
        this.mesSelecionado = this.mesAtual;
        this.anoSelecionado = this.anoAtual;
        this.filtrarEstoquesPorMesAno();
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

    editEstoque(estoque: Estoque) {
        this.estoque = {
            ...estoque,
            data: estoque.data ? new Date(estoque.data) : new Date()
        };
        this.isEditMode = true;
        this.temRetirada = false;
        this.numeroRetiradas = 1;
        this.estoqueDialog = true;
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
                                    this.atualizarSaldoContaAoSalvar(lancamentoOriginal);
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
                            if (lancamentoParaSalvar.patrimonioId && lancamentoParaSalvar.efetivado) {
                                console.log('Atualizando saldo da Patrimonio após criar lançamento efetivado');
                                this.atualizarSaldoContaParaLancamento(lancamentoParaSalvar);
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
            message: `Tem certeza que deseja deletar o estoque "${estoque.descricao}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteEstoque(estoque.id!);
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
        return patrimonio?.descricao || '-';
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

        // Se tem Patrimonio associada, atualiza o saldo
        if (lancamento.patrimonioId) {
            this.patrimonioService.getPatrimonioById(lancamento.patrimonioId).subscribe({
                next: (patrimonio) => {
                    let novoSaldo = patrimonio.saldo;

                    if (novoStatus) {
                        // Está efetivando o lançamento
                        if (lancamento.tipo === 'RECEITA') {
                            novoSaldo += lancamento.valor;
                        } else {
                            novoSaldo -= lancamento.valor;
                        }
                    } else {
                        // Está desefetivando o lançamento
                        if (lancamento.tipo === 'RECEITA') {
                            novoSaldo -= lancamento.valor;
                        } else {
                            novoSaldo += lancamento.valor;
                        }
                    }

                    const patrimonioAtualizado = { ...patrimonio, saldo: novoSaldo };

                    // Atualiza a Patrimonio
                    this.patrimonioService.updatePatrimonio(patrimonio.id!, patrimonioAtualizado).subscribe({
                        next: () => {
                            // Atualiza o lançamento
                            this.lancamentoService.updateLancamento(lancamento.id!, lancamentoAtualizado).subscribe({
                                next: () => {
                                    this.messageService.add({
                                        severity: 'success',
                                        summary: 'Sucesso',
                                        detail: novoStatus ? 'Lançamento efetivado com sucesso' : 'Lançamento desefetivado com sucesso'
                                    });
                                    this.loadLancamentos();
                                    this.loadPatrimonios(); // Atualiza a lista de patrimonios
                                },
                                error: () => {
                                    // Reverte em caso de erro
                                    lancamento.efetivado = !lancamento.efetivado;
                                    this.messageService.add({
                                        severity: 'error',
                                        summary: 'Erro',
                                        detail: 'Erro ao atualizar status do lançamento'
                                    });
                                }
                            });
                        },
                        error: () => {
                            // Reverte em caso de erro
                            lancamento.efetivado = !lancamento.efetivado;
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erro',
                                detail: 'Erro ao atualizar saldo da Patrimonio'
                            });
                        }
                    });
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao buscar informações da Patrimonio'
                    });
                }
            });
        } else {
            // Se não tem Patrimonio, apenas atualiza o status do lançamento
            this.lancamentoService.updateLancamento(lancamento.id!, lancamentoAtualizado).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: novoStatus ? 'Lançamento efetivado com sucesso' : 'Lançamento desefetivado com sucesso'
                    });
                    this.loadLancamentos();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao atualizar status do lançamento'
                    });
                }
            });
        }
    }

    atualizarSaldoContaAoSalvar(lancamentoOriginal?: Lancamento) {
        console.log('=== atualizarSaldoContaAoSalvar ===');
        console.log('Lançamento atual:', JSON.stringify(this.lancamento, null, 2));
        console.log('Lançamento original:', lancamentoOriginal ? JSON.stringify(lancamentoOriginal, null, 2) : 'null');
        console.log('Campo efetivado:', this.lancamento.efetivado, 'Tipo:', typeof this.lancamento.efetivado);

        // Se não tem Patrimonio, não faz nada
        if (!this.lancamento.patrimonioId) {
            console.log('Sem Patrimonio associada, pulando atualização');
            return;
        }

        this.patrimonioService.getPatrimonioById(this.lancamento.patrimonioId).subscribe({
            next: (patrimonio) => {
                console.log('Patrimonio atual:', JSON.stringify(patrimonio, null, 2));
                let novoSaldo = patrimonio.saldo;
                console.log('Saldo inicial:', novoSaldo);

                // Se está editando, primeiro reverte o valor anterior
                if (lancamentoOriginal && lancamentoOriginal.efetivado && lancamentoOriginal.patrimonioId === this.lancamento.patrimonioId) {
                    console.log('Revertendo lançamento original efetivado');
                    if (lancamentoOriginal.tipo === 'RECEITA') {
                        novoSaldo -= lancamentoOriginal.valor;
                        console.log(`Removendo RECEITA: ${novoSaldo} = ${patrimonio.saldo} - ${lancamentoOriginal.valor}`);
                    } else {
                        novoSaldo += lancamentoOriginal.valor;
                        console.log(`Devolvendo DESPESA: ${novoSaldo} = ${patrimonio.saldo} + ${lancamentoOriginal.valor}`);
                    }
                }

                // Aplica o novo valor se estiver efetivado
                if (this.lancamento.efetivado) {
                    console.log('Aplicando novo lançamento efetivado');
                    if (this.lancamento.tipo === 'RECEITA') {
                        novoSaldo += this.lancamento.valor;
                        console.log(`Adicionando RECEITA: ${novoSaldo} = saldo anterior + ${this.lancamento.valor}`);
                    } else {
                        novoSaldo -= this.lancamento.valor;
                        console.log(`Subtraindo DESPESA: ${novoSaldo} = saldo anterior - ${this.lancamento.valor}`);
                    }
                } else {
                    console.log('Lançamento NÃO está efetivado, não aplicando ao saldo');
                }

                console.log('Saldo final calculado:', novoSaldo);
                const patrimonioAtualizado = { ...patrimonio, saldo: novoSaldo };

                this.patrimonioService.updatePatrimonio(patrimonio.id!, patrimonioAtualizado).subscribe({
                    next: () => {
                        console.log('Saldo do Patrimonio atualizado com sucesso');
                        this.loadPatrimonios();
                    },
                    error: () => {
                        console.error('Erro ao atualizar saldo da Patrimonio');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar saldo da Patrimonio'
                        });
                    }
                });
            },
            error: (err) => {
                console.error('Erro ao buscar Patrimonio:', err);
            }
        });
    }

    atualizarSaldoContaParaLancamento(lancamento: Lancamento, lancamentoOriginal?: Lancamento) {
        console.log('=== atualizarSaldoContaParaLancamento ===');
        console.log('Lançamento:', JSON.stringify(lancamento, null, 2));
        console.log('Lançamento original:', lancamentoOriginal ? JSON.stringify(lancamentoOriginal, null, 2) : 'null');
        console.log('Campo efetivado:', lancamento.efetivado, 'Tipo:', typeof lancamento.efetivado);

        // Se não tem Patrimonio, não faz nada
        if (!lancamento.patrimonioId) {
            console.log('Sem Patrimonio associada, pulando atualização');
            return;
        }

        this.patrimonioService.getPatrimonioById(lancamento.patrimonioId).subscribe({
            next: (patrimonio) => {
                console.log('Patrimonio atual:', JSON.stringify(patrimonio, null, 2));
                let novoSaldo = patrimonio.saldo;
                console.log('Saldo inicial:', novoSaldo);

                // Se está editando, primeiro reverte o valor anterior
                if (lancamentoOriginal && lancamentoOriginal.efetivado && lancamentoOriginal.patrimonioId === lancamento.patrimonioId) {
                    console.log('Revertendo lançamento original efetivado');
                    if (lancamentoOriginal.tipo === 'RECEITA') {
                        novoSaldo -= lancamentoOriginal.valor;
                        console.log(`Removendo RECEITA: ${novoSaldo} = ${patrimonio.saldo} - ${lancamentoOriginal.valor}`);
                    } else {
                        novoSaldo += lancamentoOriginal.valor;
                        console.log(`Devolvendo DESPESA: ${novoSaldo} = ${patrimonio.saldo} + ${lancamentoOriginal.valor}`);
                    }
                }

                // Aplica o novo valor se estiver efetivado
                if (lancamento.efetivado) {
                    console.log('Aplicando novo lançamento efetivado');
                    if (lancamento.tipo === 'RECEITA') {
                        novoSaldo += lancamento.valor;
                        console.log(`Adicionando RECEITA: ${novoSaldo} = saldo anterior + ${lancamento.valor}`);
                    } else {
                        novoSaldo -= lancamento.valor;
                        console.log(`Subtraindo DESPESA: ${novoSaldo} = saldo anterior - ${lancamento.valor}`);
                    }
                } else {
                    console.log('Lançamento NÃO está efetivado, não aplicando ao saldo');
                }

                console.log('Saldo final calculado:', novoSaldo);
                const patrimonioAtualizado = { ...patrimonio, saldo: novoSaldo };

                this.patrimonioService.updatePatrimonio(patrimonio.id!, patrimonioAtualizado).subscribe({
                    next: () => {
                        console.log('Saldo da Patrimonio atualizado com sucesso!');
                        this.loadPatrimonios();
                    },
                    error: () => {
                        console.error('Erro ao atualizar saldo da Patrimonio');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar saldo da Patrimonio'
                        });
                    }
                });
            },
            error: (err) => {
                console.error('Erro ao buscar Patrimonio:', err);
            }
        });
    }
}


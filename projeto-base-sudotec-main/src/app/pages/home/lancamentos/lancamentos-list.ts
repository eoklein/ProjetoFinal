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
import { CategoryService } from '@/services/category.service';
import { ContaService } from '@/services/conta.service';
import { Lancamento } from '@/models/lancamento.model';
import { Category } from '@/models/category.model';
import { Conta } from '@/models/conta.model';
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
    categoryService = inject(CategoryService);
    contaService = inject(ContaService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    lancamentos: Lancamento[] = [];
    lancamentosFiltrados: Lancamento[] = [];
    categorias: Category[] = [];
    contas: Conta[] = [];
    lancamentoDialog: boolean = false;
    lancamento: Lancamento = {} as Lancamento;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    isParcelado: boolean = false;
    numeroParcelas: number = 1;

    // Controle de navegação por mês/ano
    mesAtual: number = new Date().getMonth();
    anoAtual: number = new Date().getFullYear();
    mesSelecionado: number = this.mesAtual;
    anoSelecionado: number = this.anoAtual;

    mesesNomes: string[] = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    ngOnInit() {
        this.loadLancamentos();
        this.loadCategorias();
        this.loadContas();
    }

    loadCategorias() {
        this.categoryService.getCategories().subscribe({
            next: (categorias) => {
                this.categorias = categorias;
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

    loadContas() {
        this.contaService.getContas().subscribe({
            next: (contas) => {
                this.contas = contas;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar contas'
                });
            }
        });
    }

    loadLancamentos() {
        this.loading = true;
        this.lancamentoService.getLancamentos().subscribe({
            next: (lancamentos) => {
                this.lancamentos = lancamentos;
                this.filtrarLancamentosPorMesAno();
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar lançamentos'
                });
                this.loading = false;
            }
        });
    }

    filtrarLancamentosPorMesAno() {
        this.lancamentosFiltrados = this.lancamentos.filter((lancamento) => {
            const dataLancamento = new Date(lancamento.data);
            return dataLancamento.getMonth() === this.mesSelecionado && dataLancamento.getFullYear() === this.anoSelecionado;
        });
    }

    mesAnterior() {
        if (this.mesSelecionado === 0) {
            this.mesSelecionado = 11;
            this.anoSelecionado--;
        } else {
            this.mesSelecionado--;
        }
        this.filtrarLancamentosPorMesAno();
    }

    proximoMes() {
        if (this.mesSelecionado === 11) {
            this.mesSelecionado = 0;
            this.anoSelecionado++;
        } else {
            this.mesSelecionado++;
        }
        this.filtrarLancamentosPorMesAno();
    }

    voltarMesAtual() {
        this.mesSelecionado = this.mesAtual;
        this.anoSelecionado = this.anoAtual;
        this.filtrarLancamentosPorMesAno();
    }

    get mesAnoSelecionado(): string {
        return `${this.mesesNomes[this.mesSelecionado]} ${this.anoSelecionado}`;
    }

    get isNoPeriodoAtual(): boolean {
        return this.mesSelecionado === this.mesAtual && this.anoSelecionado === this.anoAtual;
    }

    openNew() {
        this.lancamento = { valor: 0, data: new Date(), tipo: 'DESPESA', efetivado: false } as Lancamento;
        this.submitted = false;
        this.isEditMode = false;
        this.isParcelado = false;
        this.numeroParcelas = 1;
        this.lancamentoDialog = true;
    }

    editLancamento(lancamento: Lancamento) {
        this.lancamento = {
            ...lancamento,
            data: lancamento.data ? new Date(lancamento.data) : new Date()
        };
        this.isEditMode = true;
        this.isParcelado = false;
        this.numeroParcelas = 1;
        this.lancamentoDialog = true;
    }

    hideDialog() {
        this.lancamentoDialog = false;
        this.submitted = false;
    }

    saveLancamento() {
        this.submitted = true;
        console.log('Dados do lançamento antes de salvar:', JSON.stringify(this.lancamento, null, 2));

        if (this.lancamento.descricao?.trim() && this.lancamento.valor !== undefined && this.lancamento.data && this.lancamento.tipo) {
            // Garante que efetivado seja sempre um booleano
            if (this.lancamento.efetivado === undefined || this.lancamento.efetivado === null) {
                this.lancamento.efetivado = false;
            }

            // Log para debug
            console.log('Salvando lançamento:', JSON.stringify(this.lancamento, null, 2));
            console.log('Campo efetivado:', this.lancamento.efetivado, 'Tipo:', typeof this.lancamento.efetivado);

            if (this.lancamento.id) {
                // Update
                // Guarda o lançamento original para comparar mudanças no saldo
                const lancamentoOriginalId = this.lancamento.id;
                this.lancamentoService.getLancamentoById(lancamentoOriginalId).subscribe({
                    next: (lancamentoOriginal) => {
                        this.lancamentoService.updateLancamento(lancamentoOriginalId, this.lancamento).subscribe({
                            next: () => {
                                // Atualiza o saldo se necessário
                                if (
                                    this.lancamento.contaId &&
                                    (lancamentoOriginal.efetivado !== this.lancamento.efetivado ||
                                        lancamentoOriginal.valor !== this.lancamento.valor ||
                                        lancamentoOriginal.contaId !== this.lancamento.contaId ||
                                        lancamentoOriginal.tipo !== this.lancamento.tipo)
                                ) {
                                    this.atualizarSaldoContaAoSalvar(lancamentoOriginal);
                                }

                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Sucesso',
                                    detail: 'Lançamento atualizado com sucesso'
                                });
                                this.loadLancamentos();
                                this.lancamentoDialog = false;
                                this.lancamento = {} as Lancamento;
                            },
                            error: () => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Erro',
                                    detail: 'Erro ao atualizar lançamento'
                                });
                            }
                        });
                    }
                });
            } else {
                // Create
                console.log('Criando novo lançamento');
                if (this.isParcelado && this.numeroParcelas > 1) {
                    this.criarLancamentosParcelados();
                } else {
                    // Guarda uma cópia do lançamento antes de salvar
                    const lancamentoParaSalvar = { ...this.lancamento };

                    this.lancamentoService.createLancamento(lancamentoParaSalvar).subscribe({
                        next: () => {
                            // Atualiza o saldo se o lançamento está efetivado e tem conta
                            // Usa a cópia guardada ao invés de this.lancamento
                            if (lancamentoParaSalvar.contaId && lancamentoParaSalvar.efetivado) {
                                console.log('Atualizando saldo da conta após criar lançamento efetivado');
                                this.atualizarSaldoContaParaLancamento(lancamentoParaSalvar);
                            }

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Sucesso',
                                detail: 'Lançamento criado com sucesso'
                            });
                            this.loadLancamentos();
                            this.lancamentoDialog = false;
                            this.lancamento = {} as Lancamento;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erro',
                                detail: 'Erro ao criar lançamento'
                            });
                        }
                    });
                }
            }
        }
    }

    confirmDelete(lancamento: Lancamento) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o lançamento "${lancamento.descricao}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteLancamento(lancamento.id!);
            }
        });
    }

    deleteLancamento(id: number) {
        this.lancamentoService.deleteLancamento(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Lançamento deletado com sucesso'
                });
                this.loadLancamentos();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar lançamento'
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

    getCategoriaNome(categoriaId?: number): string {
        if (!categoriaId) return '-';
        const categoria = this.categorias.find((c) => c.id === categoriaId);
        return categoria?.nome || '-';
    }

    getContaNome(contaId?: number): string {
        if (!contaId) return '-';
        const conta = this.contas.find((c) => c.id === contaId);
        return conta?.descricao || '-';
    }

    criarLancamentosParcelados() {
        const valorParcela = this.lancamento.valor / this.numeroParcelas;
        const dataBase = new Date(this.lancamento.data);
        let parcelasRestantes = this.numeroParcelas;
        let parcelasErro = 0;

        for (let i = 0; i < this.numeroParcelas; i++) {
            const dataParcela = new Date(dataBase);
            dataParcela.setDate(dataParcela.getDate() + i * 30);

            const parcela: Lancamento = {
                ...this.lancamento,
                valor: valorParcela,
                data: dataParcela,
                descricao: `${this.lancamento.descricao} (${i + 1}/${this.numeroParcelas})`,
                numeroParcelas: this.numeroParcelas,
                parcelaAtual: i + 1
            };

            this.lancamentoService.createLancamento(parcela).subscribe({
                next: () => {
                    parcelasRestantes--;
                    if (parcelasRestantes === 0 && parcelasErro === 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${this.numeroParcelas} parcelas criadas com sucesso`
                        });
                        this.loadLancamentos();
                        this.lancamentoDialog = false;
                        this.lancamento = {} as Lancamento;
                    } else if (parcelasRestantes === 0 && parcelasErro > 0) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Parcialmente Concluído',
                            detail: `${this.numeroParcelas - parcelasErro} de ${this.numeroParcelas} parcelas criadas`
                        });
                        this.loadLancamentos();
                        this.lancamentoDialog = false;
                        this.lancamento = {} as Lancamento;
                    }
                },
                error: () => {
                    parcelasRestantes--;
                    parcelasErro++;
                    if (parcelasRestantes === 0) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao criar parcelas. ${parcelasErro} parcela(s) falharam`
                        });
                        if (parcelasErro < this.numeroParcelas) {
                            this.loadLancamentos();
                        }
                    }
                }
            });
        }
    }

    get valorParcela(): number {
        if (!this.isParcelado || this.numeroParcelas <= 1) {
            return this.lancamento.valor || 0;
        }
        return (this.lancamento.valor || 0) / this.numeroParcelas;
    }

    toggleEfetivado(lancamento: Lancamento) {
        // Inverte o valor manualmente já que não temos mais ngModel
        lancamento.efetivado = !lancamento.efetivado;
        const novoStatus = lancamento.efetivado;
        const lancamentoAtualizado = { ...lancamento, efetivado: novoStatus };

        console.log('Toggling efetivado for lancamento:', lancamento.id);
        console.log('Novo status efetivado:', novoStatus);

        // Se tem conta associada, atualiza o saldo
        if (lancamento.contaId) {
            this.contaService.getContaById(lancamento.contaId).subscribe({
                next: (conta) => {
                    let novoSaldo = conta.saldo;

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

                    const contaAtualizada = { ...conta, saldo: novoSaldo };

                    // Atualiza a conta
                    this.contaService.updateConta(conta.id!, contaAtualizada).subscribe({
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
                                    this.loadContas(); // Atualiza a lista de contas
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
                                detail: 'Erro ao atualizar saldo da conta'
                            });
                        }
                    });
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao buscar informações da conta'
                    });
                }
            });
        } else {
            // Se não tem conta, apenas atualiza o status do lançamento
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

        // Se não tem conta, não faz nada
        if (!this.lancamento.contaId) {
            console.log('Sem conta associada, pulando atualização');
            return;
        }

        this.contaService.getContaById(this.lancamento.contaId).subscribe({
            next: (conta) => {
                console.log('Conta atual:', JSON.stringify(conta, null, 2));
                let novoSaldo = conta.saldo;
                console.log('Saldo inicial:', novoSaldo);

                // Se está editando, primeiro reverte o valor anterior
                if (lancamentoOriginal && lancamentoOriginal.efetivado && lancamentoOriginal.contaId === this.lancamento.contaId) {
                    console.log('Revertendo lançamento original efetivado');
                    if (lancamentoOriginal.tipo === 'RECEITA') {
                        novoSaldo -= lancamentoOriginal.valor;
                        console.log(`Removendo RECEITA: ${novoSaldo} = ${conta.saldo} - ${lancamentoOriginal.valor}`);
                    } else {
                        novoSaldo += lancamentoOriginal.valor;
                        console.log(`Devolvendo DESPESA: ${novoSaldo} = ${conta.saldo} + ${lancamentoOriginal.valor}`);
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
                const contaAtualizada = { ...conta, saldo: novoSaldo };

                this.contaService.updateConta(conta.id!, contaAtualizada).subscribe({
                    next: () => {
                        console.log('Saldo da conta atualizado com sucesso!');
                        this.loadContas();
                    },
                    error: () => {
                        console.error('Erro ao atualizar saldo da conta');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar saldo da conta'
                        });
                    }
                });
            },
            error: (err) => {
                console.error('Erro ao buscar conta:', err);
            }
        });
    }

    atualizarSaldoContaParaLancamento(lancamento: Lancamento, lancamentoOriginal?: Lancamento) {
        console.log('=== atualizarSaldoContaParaLancamento ===');
        console.log('Lançamento:', JSON.stringify(lancamento, null, 2));
        console.log('Lançamento original:', lancamentoOriginal ? JSON.stringify(lancamentoOriginal, null, 2) : 'null');
        console.log('Campo efetivado:', lancamento.efetivado, 'Tipo:', typeof lancamento.efetivado);

        // Se não tem conta, não faz nada
        if (!lancamento.contaId) {
            console.log('Sem conta associada, pulando atualização');
            return;
        }

        this.contaService.getContaById(lancamento.contaId).subscribe({
            next: (conta) => {
                console.log('Conta atual:', JSON.stringify(conta, null, 2));
                let novoSaldo = conta.saldo;
                console.log('Saldo inicial:', novoSaldo);

                // Se está editando, primeiro reverte o valor anterior
                if (lancamentoOriginal && lancamentoOriginal.efetivado && lancamentoOriginal.contaId === lancamento.contaId) {
                    console.log('Revertendo lançamento original efetivado');
                    if (lancamentoOriginal.tipo === 'RECEITA') {
                        novoSaldo -= lancamentoOriginal.valor;
                        console.log(`Removendo RECEITA: ${novoSaldo} = ${conta.saldo} - ${lancamentoOriginal.valor}`);
                    } else {
                        novoSaldo += lancamentoOriginal.valor;
                        console.log(`Devolvendo DESPESA: ${novoSaldo} = ${conta.saldo} + ${lancamentoOriginal.valor}`);
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
                const contaAtualizada = { ...conta, saldo: novoSaldo };

                this.contaService.updateConta(conta.id!, contaAtualizada).subscribe({
                    next: () => {
                        console.log('Saldo da conta atualizado com sucesso!');
                        this.loadContas();
                    },
                    error: () => {
                        console.error('Erro ao atualizar saldo da conta');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar saldo da conta'
                        });
                    }
                });
            },
            error: (err) => {
                console.error('Erro ao buscar conta:', err);
            }
        });
    }
}

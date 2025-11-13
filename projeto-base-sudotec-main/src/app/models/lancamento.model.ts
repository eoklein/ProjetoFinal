export interface Lancamento {
    id?: number;
    descricao: string;
    valor: number;
    data: Date | string;
    tipo: 'RECEITA' | 'DESPESA';
    tipoPatrimonioId?: number;
    patrimonioId?: number;
    numeroParcelas?: number;
    parcelaAtual?: number;
    lancamentoPaiId?: number;
    efetivado: boolean;
}


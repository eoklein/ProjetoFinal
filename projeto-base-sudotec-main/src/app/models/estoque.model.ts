export interface Estoque {
    id?: number;
    descricao: string;
    valor: number;
    data: Date | string;
    tipo: 'RECEITA' | 'DESPESA';
    tipoPatrimonioId?: number;
    patrimonioId?: number;
    numeroRetiradas?: number;
    retiradaAtual?: number;
    estoquePaiId?: number;
    efetivado: boolean;
    status?: string; // Reservado / devolvido / cancelado
}

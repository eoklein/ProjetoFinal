export interface SolicitacaoLancamento {
    id?: number;
    descricao: string;
    valor: number;
    data: Date;
    tipo: string;
    usuarioId?: number;
    usuario?: {
        username: string;
    };
    adminId: number;
    admin?: {
        username: string;
    };
    status: string;
    tipoPatrimonioId?: number;
    tipoPatrimonio?: any;
    patrimonioId?: number;
    patrimonio?: any;
    motivo_rejeicao?: string;
    data_criacao?: Date;
    data_atualizacao?: Date;
}

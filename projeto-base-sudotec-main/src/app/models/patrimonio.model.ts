export interface Patrimonio {
    id?: number;
    nome: string;
    codigo?: string;
    estado: string;
    valor?: number;
    data?: Date;
    tipoPatrimonioId?: number;
    status?: string; // Reservado / devolvido / cancelado
    dataDevolucao?: Date; // Data de devolução da reserva ativa
}

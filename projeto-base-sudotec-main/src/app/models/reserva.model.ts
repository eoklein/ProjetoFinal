export interface Reserva {
    id?: number;
    patrimonioId: number;
    userId?: number;
    dataReserva?: Date;
    dataDevolucao: Date;
    status?: string;
    criadoEm?: Date;
    prioridade?: 'normal' | 'alta' | 'urgente';
    motivo?: string;
    observacoes?: string;
    patrimonio?: {
        id: number;
        nome: string;
        codigo?: string;
        estado: string;
        valor?: number;
    };
    user?: {
        username: string;
    };
}

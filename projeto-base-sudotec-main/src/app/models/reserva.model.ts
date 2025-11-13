export interface Reserva {
    id?: number;
    patrimonioId: number;
    userId?: number;
    dataReserva?: Date;
    dataDevolucao: Date;
    status?: string;
    criadoEm?: Date;
    patrimonio?: {
        id: number;
        nome: string;
        codigo?: string;
        status: string;
        valor?: number;
    };
    user?: {
        username: string;
    };
}

export interface Reserva {
    id?: number;
    patrimonioId: number;
    userId?: number;
    dataReserva?: Date;
    dataDevolucao: Date;
    estado?: string;
    criadoEm?: Date;
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

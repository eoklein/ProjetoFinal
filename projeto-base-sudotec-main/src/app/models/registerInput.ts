export interface RegisterInput {
    username: string;
    password: string;
    email?: string; // NOVO: Email opcional
}

export interface RegisterResponse {
    message: string;
    userId: number;
    isAdmin: boolean;
}


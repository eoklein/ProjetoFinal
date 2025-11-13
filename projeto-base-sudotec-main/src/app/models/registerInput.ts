export interface RegisterInput {
    username: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    userId: number;
    isAdmin: boolean;
}


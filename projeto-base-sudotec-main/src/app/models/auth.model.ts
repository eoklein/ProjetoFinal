export interface AuthModel {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user: UserData;
}

export interface UserData {
    id: number;
    username: string;
    email?: string;
    isAdmin: boolean;
    token: string;
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterInput, RegisterResponse } from '@/models/registerInput';

@Injectable()
export class RegisterService {
    private registerApi: string = 'http://localhost:3000/auth/register';

    http = inject(HttpClient);

    register(registerInput: RegisterInput) {
        return this.http.post<RegisterResponse>(this.registerApi, registerInput);
    }
}


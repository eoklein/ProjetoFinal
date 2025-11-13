import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthModel, LoginResponse, UserData } from '@/models/auth.model';
import { map, Observable } from 'rxjs';

@Injectable()
export class LoginService {
    private loginApi: string = 'http://localhost:3000/auth';

    http = inject(HttpClient);

    login(loginInput: AuthModel): Observable<UserData> {
        const credentials = `${loginInput.username}:${loginInput.password}`;
        const encodedCredentials = btoa(credentials);

        const headers = new HttpHeaders({
            Authorization: `Basic ${encodedCredentials}`
        });

        return this.http.post<LoginResponse>(this.loginApi + '/login', {}, { headers }).pipe(
            map((response) => ({
                id: response.user.id,
                username: response.user.username,
                isAdmin: response.user.isAdmin,
                token: encodedCredentials
            }))
        );
    }
}

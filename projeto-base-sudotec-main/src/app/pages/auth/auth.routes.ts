import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login/login';
import { Register } from './register/register';
import { Error } from './error';

export default [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'register', component: Register }
] as Routes;

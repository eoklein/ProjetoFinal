import { Routes } from '@angular/router';
import { Notfound } from '@/pages/notfound/notfound';
import { authGuard } from '@/guards/auth.guard';

export const appRoutes: Routes = [
    { path: '', loadChildren: () => import('./app/pages/auth/auth.routes').then((m) => m.default) },
    { path: 'home', loadChildren: () => import('./app/pages/home/home.routes').then((m) => m.homeRoutes), canActivate: [authGuard] },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];

import { Routes } from '@angular/router';
import { Dashboard } from '@/pages/home/dashboard/dashboard';
import { UsersList } from '@/pages/home/users/users-list';
import { CategoriesList } from '@/pages/home/categories/categories-list';
import { ContasList } from '@/pages/home/contas/contas-list';
import { LancamentosList } from '@/pages/home/lancamentos/lancamentos-list';
import { AppLayout } from '@/layout/component/app.layout';
import { adminGuard } from '@/guards/auth.guard';

export const homeRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'users', component: UsersList, canActivate: [adminGuard] },
            { path: 'categories', component: CategoriesList },
            { path: 'contas', component: ContasList },
            { path: 'lancamentos', component: LancamentosList }
        ]
    }
];

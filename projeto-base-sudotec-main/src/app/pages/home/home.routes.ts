import { Routes } from '@angular/router';
import { UsersList } from '@/pages/home/users/users-list';
import { TiposPatrimonioList } from '@/pages/home/tiposPatrimonio/tiposPatrimonio-list';
import { PatrimoniosList } from '@/pages/home/patrimonios/patrimonios-list';
import { LancamentosList } from '@/pages/home/lancamentos/lancamentos-list';
import { ReservasComponent } from '@/pages/home/reservas/reservas';
import { AppLayout } from '@/layout/component/app.layout';
import { adminGuard } from '@/guards/auth.guard';

export const homeRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: 'lancamentos', pathMatch: 'full' },
            { path: 'users', component: UsersList, canActivate: [adminGuard] },
            { path: 'tiposPatrimonio', component: TiposPatrimonioList },
            { path: 'patrimonios', component: PatrimoniosList },
            { path: 'lancamentos', component: LancamentosList },
            { path: 'reservas', component: ReservasComponent }
        ]
    }
];

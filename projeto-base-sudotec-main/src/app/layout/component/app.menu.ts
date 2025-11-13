import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    authService = inject(AuthService);
    model: MenuItem[] = [];

    ngOnInit() {
        const isAdmin = this.authService.isAdmin();

        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Estoque', icon: 'pi pi-fw pi-money-bill', routerLink: ['/home/lancamentos'] },
                    ...(isAdmin ? [{ label: 'Users', icon: 'pi pi-fw pi-users', routerLink: ['/home/users'] }] : [])
                ]
            },
            {
                label: 'Cadastros',
                items: [
                    { label: 'Tipos de Patrimonio', icon: 'pi pi-fw pi-tag', routerLink: ['/home/tiposPatrimonio'] },
                    { label: 'Patrimonios', icon: 'pi pi-fw pi-wallet', routerLink: ['/home/patrimonios'] },
                    { label: 'Reservas', icon: 'pi pi-fw pi-calendar', routerLink: ['/home/reservas'] }
                ]
            }
        ];
    }
}

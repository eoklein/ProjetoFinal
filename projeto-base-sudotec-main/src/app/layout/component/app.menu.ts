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
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/home/dashboard'] },
                    { label: 'Lançamentos', icon: 'pi pi-fw pi-money-bill', routerLink: ['/home/lancamentos'] }
                ]
            },
            {
                label: 'Cadastros',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    { label: 'Categorias', icon: 'pi pi-fw pi-tags', routerLink: ['/home/categories'] },
                    { label: 'Contas', icon: 'pi pi-fw pi-wallet', routerLink: ['/home/contas'] },
                    ...(isAdmin ? [{ label: 'Usuários', icon: 'pi pi-fw pi-users', routerLink: ['/home/users'] }] : [])
                ]
            }
        ];
    }
}

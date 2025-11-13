import { Component, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { Menu } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, Menu],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <svg viewBox="0 0 200 200" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    <!-- Fundo círculo magenta -->
                    <circle cx="100" cy="100" r="95" fill="#D239DE"/>
                    <!-- Caixa branca -->
                    <rect x="50" y="70" width="100" height="60" rx="8" fill="white"/>
                    <!-- Linhas verticais -->
                    <line x1="60" y1="80" x2="60" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="72" y1="80" x2="72" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="84" y1="80" x2="84" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="96" y1="80" x2="96" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="108" y1="80" x2="108" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="120" y1="80" x2="120" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <line x1="132" y1="80" x2="132" y2="120" stroke="#2c3e8f" stroke-width="3" stroke-linecap="round"/>
                    <!-- Círculo pequeno -->
                    <circle cx="145" cy="100" r="6" fill="#2c3e8f"/>
                </svg>
                <span>CAPSA DESK</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button class="layout-topbar-action " pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                        <i class="pi pi-user"></i>
                    </button>
                    <p-menu #userMenu [model]="userMenuItems" [popup]="true" [style]="{ width: '200px' }"></p-menu>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    @ViewChild('userMenu') userMenu!: Menu;

    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    router = inject(Router);

    userMenuItems: MenuItem[] = [];

    constructor() {
        this.initializeUserMenu();
    }

    get currentUser() {
        return this.authService.getUserData();
    }

    initializeUserMenu() {
        this.userMenuItems = [
            {
                label: 'Nome: ' + (this.currentUser?.username || 'Usuário'),
                items: [
                    {
                        label: 'Perfil',
                        icon: 'pi pi-user',
                        command: () => {
                            console.log('Ir para perfil');
                        }
                    },
                    {
                        separator: true
                    },
                    {
                        label: 'Sair',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.logout();
                        }
                    }
                ]
            }
        ];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}

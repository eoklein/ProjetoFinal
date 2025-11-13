import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/interceptors/auth.interceptor';
import { LayoutService } from './app/layout/service/layout.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        {
            provide: APP_INITIALIZER,
            useFactory: (layoutService: LayoutService) => () => {
                // Força a configuração para fuchsia e dark theme
                layoutService.layoutConfig.set({
                    preset: 'Aura',
                    primary: 'fuchsia',
                    surface: null,
                    darkTheme: true,
                    menuMode: 'static'
                });
                layoutService.toggleDarkMode({
                    preset: 'Aura',
                    primary: 'fuchsia',
                    surface: null,
                    darkTheme: true,
                    menuMode: 'static'
                });
            },
            deps: [LayoutService],
            multi: true
        }
    ]
};

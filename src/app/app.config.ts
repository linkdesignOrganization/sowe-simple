import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { provideScrollRestoration } from './scroll-restoration';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Scroll custom (ver scroll-restoration.ts): 'disabled' apaga la
    // restauración automática pero el router SIGUE emitiendo los eventos
    // Scroll con la posición — nuestro servicio decide (top en navegación
    // nueva; back con reintentos porque la altura se asienta tarde).
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'disabled',
      anchorScrolling: 'disabled',
    })),
    provideScrollRestoration(),
    provideHttpClient(withFetch()),
    // El sitio se sirve prerenderizado (angular.json → outputMode: "static"). Sin hidratación
    // Angular DESCARTA ese HTML y reconstruye el DOM entero: medido en prod, el <app-root> se
    // vaciaba a los 6,1 s en móvil (LCP 6,4 s, CLS 0,39 en escritorio) y hasta el video ya
    // descargado se volvía a pedir. withEventReplay reproduce los clics hechos antes de que la
    // app quede interactiva, que hasta ahora se perdían.
    provideClientHydration(withEventReplay())
  ]
};

import {
  EnvironmentProviders,
  Injectable,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Scroll de navegación del sitio, con una regla por caso:
 *
 * - Navegación NUEVA (click a otra ruta): la página entra desde ARRIBA.
 *   Sin esto, Angular deja el scroll donde estaba y /software aparecía por la
 *   mitad al venir del home.
 * - BACK/FORWARD: vuelve a donde el visitante estaba DE VERDAD. La restauración
 *   simple no alcanza acá: la altura del documento sigue moviéndose después del
 *   render (los pósters del portafolio miden su proporción al cargar, y el
 *   scroll-hijack de industrias ajusta su alto por JS), así que la posición se
 *   re-aplica en un bucle corto de frames hasta que queda clavada — y se aborta
 *   al instante si el visitante scrollea por su cuenta, para no pelearle el
 *   control.
 *
 * El router emite los eventos `Scroll` aunque `scrollPositionRestoration` esté
 * en 'disabled' (patrón oficial para scroll custom); este servicio es la única
 * fuente de verdad — sin parches de scrollTo por página.
 */
@Injectable({ providedIn: 'root' })
export class ScrollRestorationService {
  private readonly router = inject(Router);
  private readonly viewport = inject(ViewportScroller);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Cuánto tiempo re-aplicamos la posición del back mientras la página se asienta. */
  private static readonly RESTORE_WINDOW_MS = 800;
  /** Con este margen de error damos la posición por clavada. */
  private static readonly SETTLE_TOLERANCE_PX = 2;
  private static readonly SETTLE_FRAMES = 2;

  private cancelActive: (() => void) | null = null;

  init(): void {
    if (!this.isBrowser) return;

    // El navegador no compite con la restauración propia.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.router.events
      .pipe(filter((e): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        this.cancelActive?.();

        if (e.position) {
          this.restoreWithRetries(e.position);
        } else if (e.anchor) {
          this.viewport.scrollToAnchor(e.anchor);
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      });
  }

  private restoreWithRetries([x, y]: [number, number]): void {
    const started = performance.now();
    let settledFrames = 0;
    let rafId = 0;
    let aborted = false;

    const abort = () => {
      aborted = true;
      cancelAnimationFrame(rafId);
      removeListeners();
      this.cancelActive = null;
    };

    // Si el visitante toma el control, la restauración se corre a un lado.
    const onUserScroll = () => abort();
    const listenerOpts: AddEventListenerOptions = { passive: true };
    const removeListeners = () => {
      window.removeEventListener('wheel', onUserScroll, listenerOpts);
      window.removeEventListener('touchstart', onUserScroll, listenerOpts);
      window.removeEventListener('keydown', onUserScroll);
    };
    window.addEventListener('wheel', onUserScroll, listenerOpts);
    window.addEventListener('touchstart', onUserScroll, listenerOpts);
    window.addEventListener('keydown', onUserScroll);

    this.cancelActive = abort;

    const tick = () => {
      if (aborted) return;

      const drift = Math.abs(window.scrollY - y);
      if (drift > ScrollRestorationService.SETTLE_TOLERANCE_PX) {
        window.scrollTo({ top: y, left: x, behavior: 'instant' });
        settledFrames = 0;
      } else {
        settledFrames++;
      }

      const elapsed = performance.now() - started;
      const settled = settledFrames >= ScrollRestorationService.SETTLE_FRAMES;
      if (settled || elapsed > ScrollRestorationService.RESTORE_WINDOW_MS) {
        abort();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.scrollTo({ top: y, left: x, behavior: 'instant' });
    rafId = requestAnimationFrame(tick);
  }
}

/** Se registra en app.config: arranca con la app y vive lo que ella viva. */
export function provideScrollRestoration(): EnvironmentProviders {
  return provideAppInitializer(() => {
    inject(ScrollRestorationService).init();
  });
}

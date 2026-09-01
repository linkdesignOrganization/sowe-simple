import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  computed,
  effect,
  inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  LucideBriefcase,
  LucideCode,
  LucideDumbbell,
  LucideFactory,
  LucideGraduationCap,
  LucideHandshake,
  LucideHeartPulse,
  LucideTruck,
  LucideUserRound,
  LucideWrench
} from '@lucide/angular';

import { ContactFooterComponent, ContactInfo, SystemContext } from '../components/contact-footer.component';
import { BuildCard, IndustryBuildComponent } from '../components/industry-build.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { TrackSectionDirective } from '../directives/track-section.directive';
import { LanguageService } from '../services/language.service';
import { BuildKind, getIndustryDetail } from './industries-content';

// Página de detalle de una industria (/industrias/:slug). Página "terminal": header backOnly
// (resuelto en app.ts/app.html), artefacto de grilla del shell en el hero, footer al cierre.
// Layout PROPIO (no reusa el de /software/:slug): guiado por el lenguaje de los landings.
// Sin imágenes: tipografía + iconos + color de marca + zonas oscuras + reveals.
@Component({
  selector: 'app-industry-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactFooterComponent,
    IndustryBuildComponent,
    DarkZoneDirective,
    TrackSectionDirective,
    LucideBriefcase,
    LucideCode,
    LucideDumbbell,
    LucideFactory,
    LucideGraduationCap,
    LucideHandshake,
    LucideHeartPulse,
    LucideTruck,
    LucideUserRound,
    LucideWrench
  ],
  template: `
    @if (d(); as s) {
      <article class="id">
        <!-- 01 — HERO sobre el artefacto de grilla del shell -->
        <header class="id-hero" appTrackSection="industria-intro">
          <div class="id-hero__text">
            <p class="id-hero__eyebrow">{{ L().eyebrow }}</p>
            <h1 class="id-hero__title">{{ s.pageTitle }}</h1>
            <p class="id-hero__subtitle">{{ s.subtitle }}</p>
            <ul class="id-hero__covers">
              @for (c of s.covers; track c) {
                <li>{{ c }}</li>
              }
            </ul>
          </div>
          <div class="id-hero__art" aria-hidden="true">
            <span class="id-hero__icon">
              @switch (s.icon) {
                @case ('factory') { <svg lucideFactory [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('truck') { <svg lucideTruck [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('health') { <svg lucideHeartPulse [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('briefcase') { <svg lucideBriefcase [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('wrench') { <svg lucideWrench [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('dumbbell') { <svg lucideDumbbell [size]="168" [strokeWidth]="0.6"></svg> }
                @case ('education') { <svg lucideGraduationCap [size]="168" [strokeWidth]="0.6"></svg> }
              }
            </span>
          </div>
        </header>

        <!-- 02 — Lo que hacemos (statement a 2 columnas) -->
        <section class="id-section id-do" appTrackSection="industria-quehacemos">
          <header class="id-section__head">
            <span class="id-num">02</span>
            <h2 class="id-label">{{ L().whatWeDo }}</h2>
          </header>
          <div class="id-do__body id-reveal">
            <p>{{ s.whatWeDo[0] }}</p>
            <p>{{ s.whatWeDo[1] }}</p>
            <p>{{ s.whatWeDo[2] }}</p>
          </div>
        </section>

        <!-- 03 — Cómo se ve esto en el sector + disclaimer (ZONA OSCURA) -->
        <div class="id-dark" appDarkZone>
          <section class="id-section id-sector">
            <header class="id-section__head">
              <span class="id-num">03</span>
              <h2 class="id-label">{{ L().inTheSector }}</h2>
            </header>
            <div class="id-sector__body">
              <div class="id-sector__paras id-reveal">
                <p>{{ s.inTheSector.paragraphs[0] }}</p>
                <p>{{ s.inTheSector.paragraphs[1] }}</p>
              </div>
              <aside class="id-disclaimer id-reveal id-reveal--right">
                <span class="id-disclaimer__eyebrow">{{ L().withRespect }}</span>
                <div class="id-disclaimer__row">
                  <span class="id-disclaimer__icon" aria-hidden="true">
                    <svg lucideHandshake [size]="26" [strokeWidth]="1.25"></svg>
                  </span>
                  <p>{{ s.inTheSector.disclaimer }}</p>
                </div>
              </aside>
            </div>
          </section>
        </div>

        <!-- 04 — Cómo trabajamos juntos (roles: vos / nosotros) -->
        <section class="id-section id-roles">
          <header class="id-section__head">
            <span class="id-num">04</span>
            <h2 class="id-label">{{ L().roles }}</h2>
          </header>
          <div class="id-roles__grid id-reveal">
            <article class="id-role">
              <span class="id-role__icon" aria-hidden="true">
                <svg lucideUserRound [size]="60" [strokeWidth]="1"></svg>
              </span>
              <span class="id-role__tag">{{ L().youBring }}</span>
              <p>{{ s.roles.yours }}</p>
            </article>
            <article class="id-role id-role--ours">
              <span class="id-role__icon id-role__icon--accent" aria-hidden="true">
                <svg lucideCode [size]="60" [strokeWidth]="1"></svg>
              </span>
              <span class="id-role__tag">{{ L().weBring }}</span>
              <p>{{ s.roles.ours }}</p>
            </article>
          </div>
        </section>

        <!-- 05 — Algunas cosas que podríamos construir (scroll horizontal con título+intro fijos en el pin) -->
        <section class="id-section id-build" appTrackSection="industria-build">
          <app-industry-build
            [num]="'05'"
            [label]="L().couldBuild"
            [intro]="s.couldBuild.intro"
            [items]="buildCards()"
          />
        </section>
      </article>

      <!-- Cierre: el footer ya es el CTA + formulario (sin sección de CTA aparte). -->
      <app-contact-footer appDarkZone id="hablemos" appTrackSection="hablemos" [info]="info" [industryContext]="industryContext()" />
    }
  `,
  styles: `
    :host {
      display: block;
    }

    /* Cada sección tapa el artefacto del shell con un fondo full-bleed opaco. El hero NO lo lleva. */
    .id-section {
      position: relative;
      z-index: 1;
      padding-block: var(--section-py);
    }

    .id-section::before {
      content: '';
      position: absolute;
      inset: 0;
      left: calc(50% - 50vw);
      width: 100vw;
      z-index: -1;
      background: var(--surface);
      transition: background-color 450ms ease;
    }

    /* ── 01 HERO ───────────────────────────────────────────────────────────── */
    .id-hero {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
      align-items: center;
      gap: clamp(1.5rem, 4vw, 3rem);
      min-height: clamp(22rem, 56vh, 34rem);
      padding-block: clamp(3rem, 7vw, 6rem) clamp(2rem, 5vw, 4rem);
    }

    /* Gradiente al pie: funde la grilla del shell hacia el gris de la primera sección. */
    .id-hero::after {
      content: '';
      position: absolute;
      left: calc(50% - 50vw);
      bottom: 0;
      width: 100vw;
      height: clamp(4rem, 9vw, 8rem);
      z-index: -1;
      pointer-events: none;
      background: linear-gradient(180deg, transparent, var(--surface));
    }

    .id-hero__eyebrow {
      margin: 0 0 1rem;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .id-hero__title {
      margin: 0;
      max-width: 20ch;
      color: var(--ink);
      font-size: clamp(2.4rem, 5vw, 4.2rem);
      font-weight: 600;
      letter-spacing: -0.05em;
      line-height: 0.98;
      text-wrap: balance;
    }

    .id-hero__subtitle {
      margin: 1.4rem 0 0;
      max-width: 48ch;
      color: var(--ink);
      font-size: var(--hero-lead-size);
      font-weight: 400;
      line-height: var(--hero-lead-leading);
      text-wrap: pretty;
    }

    .id-hero__covers {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.7rem 0 0;
      padding: 0;
      list-style: none;
    }

    .id-hero__covers li {
      padding: 0.45rem 0.66rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(17, 17, 17, 0.09);
      background: rgba(17, 17, 17, 0.045);
      color: #3a3a3a;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      line-height: 1;
      text-transform: uppercase;
    }

    .id-hero__art {
      display: flex;
      align-items: center;
      justify-content: center; /* centrado en su propia columna */
    }

    .id-hero__icon {
      display: inline-flex;
      color: var(--ink);
      opacity: 0.85;
      will-change: transform;
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ── Rótulos / números de sección ─────────────────────────────────────── */
    .id-section__head {
      display: grid;
      grid-template-columns: 2.6rem minmax(0, 1fr);
      align-items: baseline;
      gap: 1rem;
      margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    }

    .id-num {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .id-label {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.5rem, 3vw, 2.1rem);
      font-weight: 400;
      letter-spacing: -0.04em;
      line-height: 1.05;
      text-wrap: balance;
    }

    /* ── 02 Lo que hacemos (columna única, ancho de lectura; todos los bloques al mismo tamaño) ───── */
    .id-do__body {
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      max-width: 68ch;
    }

    .id-do__body p {
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ── 03 Cómo se ve esto en el sector (zona oscura) ─────────────────────── */
    .id-dark .id-label {
      color: #f4f4f4;
    }

    .id-dark .id-num {
      color: rgba(255, 255, 255, 0.5);
    }

    .id-sector__body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: start;
    }

    .id-sector__paras {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      max-width: 56ch;
    }

    .id-sector__paras p {
      margin: 0;
      color: #e9e9e9;
      font-size: 1.08rem;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* Borde neutro (sin filete de acento, esquinas rectas) para destacarlo del texto de al lado.
       Entra deslizándose desde la derecha (id-reveal--right). */
    .id-disclaimer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: clamp(1.4rem, 2.4vw, 1.9rem);
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .id-disclaimer__eyebrow {
      color: rgba(255, 255, 255, 0.55);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .id-disclaimer__row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .id-disclaimer__icon {
      display: inline-flex;
      flex-shrink: 0;
      padding-top: 0.1rem;
      color: var(--accent);
    }

    .id-disclaimer__row p {
      margin: 0;
      color: #cfcfcf; /* un punto por debajo del cuerpo principal (#e9e9e9): el disclaimer no le gana */
      font-size: 1.02rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 04 Roles (vos / nosotros) ─────────────────────────────────────────── */
    /* Misma lógica: grilla de líneas, sin cajas. "Nosotros" se distingue por el icono en acento. */
    .id-roles__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-top: 1px solid var(--line);
      border-left: 1px solid var(--line);
    }

    .id-role {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'tag  icon'
        'body icon';
      column-gap: clamp(1rem, 2.5vw, 2rem);
      row-gap: 0.9rem;
      align-items: start;
      padding: clamp(1.6rem, 2.6vw, 2.2rem);
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    /* Icono grande, a la derecha y centrado vertical: ancla visual del bloque (ink en "vos",
       acento en "nosotros"). El texto fluye en la columna izquierda sin pelearse con el icono. */
    .id-role__icon {
      grid-area: icon;
      align-self: center;
      display: inline-flex;
      color: var(--ink);
    }

    .id-role__icon--accent {
      color: var(--accent);
    }

    .id-role__tag {
      grid-area: tag;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .id-role p {
      grid-area: body;
      margin: 0;
      color: var(--ink);
      font-size: 1.05rem;
      line-height: 1.55;
      text-wrap: pretty;
    }

    /* ── 05 Podríamos construir (3 + 2) ────────────────────────────────────── */
    /* ── Reveals (SSG-safe; el TS agrega .is-in vía IO, o de inmediato si no hay IO) ───── */
    .id-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 600ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Variante: entra deslizándose desde la derecha (bloque "Con respeto"). */
    .id-reveal--right {
      transform: translateX(48px);
    }

    .id-reveal.is-in {
      opacity: 1;
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .id-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }

      .id-hero__icon {
        transition: none;
      }
    }

    /* ── Responsive ────────────────────────────────────────────────────────── */
    @media (max-width: 860px) {
      .id-hero {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .id-hero__art {
        display: none;
      }
    }

    @media (max-width: 760px) {
      .id-sector__body {
        grid-template-columns: 1fr;
        gap: 1.6rem;
      }

      .id-roles__grid {
        grid-template-columns: 1fr;
      }

      .id-section__head {
        grid-template-columns: 2rem minmax(0, 1fr);
        gap: 0.75rem;
      }
    }
  `
})
export class IndustryDetailPageComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(LanguageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly lang = this.i18n.lang;

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), {
    initialValue: this.route.snapshot.paramMap.get('slug')
  });

  // Contenido resuelto por slug + idioma. null si el slug no existe.
  protected readonly d = computed(() => getIndustryDetail(this.slug(), this.lang()));
  protected readonly L = computed(() => LABELS[this.lang()]);

  // Cards de "podríamos construir" con el kicker resuelto, para el componente de scroll horizontal.
  protected readonly buildCards = computed<BuildCard[]>(() => {
    const detail = this.d();
    if (!detail) return [];
    const labels = BUILD_LABELS[this.lang()];
    return detail.couldBuild.items.map((it) => ({ kind: it.kind, kicker: labels[it.kind], text: it.text }));
  });

  // Contexto para el footer: identifica del lado del CRM de qué industria vino el lead.
  protected readonly industryContext = computed<SystemContext | null>(() => {
    const detail = this.d();
    const slug = this.slug();
    return detail && slug ? { name: detail.name, slug } : null;
  });

  // Footer del sitio (mismos datos que system-detail / contact-page).
  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  private io: IntersectionObserver | null = null;
  private removeMove: (() => void) | null = null;
  private rafId = 0;

  constructor() {
    // Slug inexistente → 404 con marca.
    effect(() => {
      if (this.slug() !== null && this.d() === null) {
        this.router.navigateByUrl('/404', { replaceUrl: true });
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const host = this.host.nativeElement as HTMLElement;

    // Reveals: IO agrega .is-in al entrar; sin IO se muestran de inmediato (degradación).
    const revealEls = host.querySelectorAll<HTMLElement>('.id-reveal');
    if (typeof IntersectionObserver === 'undefined') {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else {
      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              this.io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => this.io!.observe(el));
    }

    this.setupParallax(host);
  }

  // Parallax suave del icono del hero al mover el mouse (off en mobile / reduced-motion).
  private setupParallax(host: HTMLElement): void {
    const icon = host.querySelector<HTMLElement>('.id-hero__icon');
    if (!icon) return;
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || window.innerWidth <= 860) return;

    const AMP = 22;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * AMP;
      ty = (e.clientY / window.innerHeight - 0.5) * AMP;
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          icon.style.transform = `translate(${tx}px, ${ty}px)`;
          this.rafId = 0;
        });
      }
    };

    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', onMove, { passive: true });
    });
    this.removeMove = () => window.removeEventListener('mousemove', onMove);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.io = null;
    this.removeMove?.();
    this.removeMove = null;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Rótulos de UI por idioma (no es copy nuevo: son los encabezados del documento aprobado + textos de interfaz).
const LABELS = {
  es: {
    eyebrow: 'Industrias',
    whatWeDo: 'Lo que hacemos',
    inTheSector: 'Cómo se ve esto en el sector',
    withRespect: 'Para ser claros',
    roles: 'Cómo trabajamos juntos',
    youBring: 'Lo que vos ponés',
    weBring: 'Lo que ponemos nosotros',
    couldBuild: 'Algunas cosas que podríamos construir'
  },
  en: {
    eyebrow: 'Industries',
    whatWeDo: 'What we do',
    inTheSector: 'How this looks in your sector',
    withRespect: 'To be clear',
    roles: 'How we work together',
    youBring: 'What you bring',
    weBring: 'What we bring',
    couldBuild: 'Some things we could build'
  }
} as const;

// Etiqueta de categoría (UI) por tipo de pieza "podríamos construir". No es copy del cliente.
const BUILD_LABELS: Record<'es' | 'en', Record<BuildKind, string>> = {
  es: {
    internal: 'Sistema interno',
    portal: 'Portal',
    mobile: 'App móvil',
    billing: 'Cobros y facturación',
    web: 'Sitio web',
    scheduling: 'Agenda y reservas',
    records: 'Gestión y registros',
    crm: 'CRM'
  },
  en: {
    internal: 'Internal system',
    portal: 'Portal',
    mobile: 'Mobile app',
    billing: 'Billing',
    web: 'Website',
    scheduling: 'Scheduling',
    records: 'Records',
    crm: 'CRM'
  }
};

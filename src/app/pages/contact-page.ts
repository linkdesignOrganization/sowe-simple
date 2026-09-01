import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowUpRight,
  LucideCalendar,
  LucideCheck,
  LucideCopy,
  LucideMail,
  LucideMessageCircle
} from '@lucide/angular';

import { ContactFooterComponent, ContactInfo } from '../components/contact-footer.component';
import { DarkZoneDirective } from '../directives/dark-zone.directive';
import { TrackSectionDirective } from '../directives/track-section.directive';
import { LanguageService } from '../services/language.service';
import { AdsService } from '../services/ads.service';
import { LocalizeUrlPipe } from '../services/localize-url.pipe';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LocalizeUrlPipe,
    ContactFooterComponent,
    DarkZoneDirective,
    TrackSectionDirective,
    LucideMail,
    LucideMessageCircle,
    LucideCalendar,
    LucideArrowUpRight,
    LucideCopy,
    LucideCheck
  ],
  template: `
    <section class="contact" appTrackSection="contacto" [attr.aria-label]="t().aria">
      <div class="contact-grid">
        <div class="ct-brand">
          <h1 class="ct-title">nolõ</h1>
        </div>

        <div class="ct-cards">
          <article class="ct-card">
            <span class="ct-card__label">{{ t().channels }}</span>
            <ul class="ct-list">
              <li class="ct-mail">
                <a class="ct-row" [href]="'mailto:' + info.email">
                  <span class="ct-row__icon" aria-hidden="true">
                    <svg lucideMail [size]="20" [strokeWidth]="1"></svg>
                  </span>
                  <span class="ct-row__text">{{ info.email }}</span>
                </a>
                <button
                  type="button"
                  class="ct-copy"
                  [attr.aria-label]="copied() ? t().copied : t().copy"
                  (click)="copyEmail()"
                >
                  @if (copied()) {
                    <svg lucideCheck [size]="16" [strokeWidth]="1.5"></svg>
                  } @else {
                    <svg lucideCopy [size]="16" [strokeWidth]="1"></svg>
                  }
                </button>
              </li>
              <li>
                <a class="ct-row" [href]="info.whatsappLink" target="_blank" rel="noopener noreferrer" (click)="onWhatsapp()">
                  <span class="ct-row__icon" aria-hidden="true">
                    <svg lucideMessageCircle [size]="20" [strokeWidth]="1"></svg>
                  </span>
                  <span class="ct-row__text">{{ t().whatsapp }}</span>
                </a>
              </li>
              <li>
                <a class="ct-row" [href]="lang() === 'en' && info.calendarLinkEn ? info.calendarLinkEn : info.calendarLink" target="_blank" rel="noopener noreferrer" (click)="onSchedule()">
                  <span class="ct-row__icon" aria-hidden="true">
                    <svg lucideCalendar [size]="20" [strokeWidth]="1"></svg>
                  </span>
                  <span class="ct-row__text">{{ t().calendar }}</span>
                </a>
              </li>
            </ul>
          </article>

          <article class="ct-card">
            <span class="ct-card__label">{{ t().info }}</span>
            <ul class="ct-info">
              <li>{{ info.location }}</li>
              <li>{{ t().schedule }}</li>
              <li>{{ t().response }}</li>
            </ul>
          </article>

          <article class="ct-card">
            <span class="ct-card__label">{{ t().areas }}</span>
            <ul class="ct-list">
              <li>
                <a class="ct-area" [routerLink]="'/software' | localizeUrl">
                  <span class="ct-area__text">{{ t().software }}</span>
                  <span class="ct-area__arrow" aria-hidden="true">
                    <svg lucideArrowUpRight [size]="22" [strokeWidth]="1"></svg>
                  </span>
                </a>
              </li>
              <li>
                <a class="ct-area" [routerLink]="'/web' | localizeUrl">
                  <span class="ct-area__text">{{ t().web }}</span>
                  <span class="ct-area__arrow" aria-hidden="true">
                    <svg lucideArrowUpRight [size]="22" [strokeWidth]="1"></svg>
                  </span>
                </a>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <app-contact-footer appDarkZone id="hablemos" appTrackSection="hablemos" [info]="info" />
  `,
  styles: `
    :host {
      display: block;
    }

    /* La primera pantalla (título + recuadro) ocupa el alto del viewport menos el topbar,
       así todo entra en ~100vh y el footer queda debajo. */
    .contact {
      /* Por encima del artefacto de grilla del shell (z-index 0). El artefacto está
         posicionado, así que sin esto se pinta SOBRE el contenido estático y la grilla queda
         encima del card. Al subir la sección, el card opaco tapa la grilla y las zonas vacías
         (transparentes) la siguen dejando ver en el fondo. */
      position: relative;
      z-index: 1;
      display: grid;
      min-height: calc(100svh - 5.25rem);
      padding: 0 0 clamp(2rem, 4vw, 3.5rem);
    }

    /* Desktop: título gigante a la izquierda (toda su columna), recuadro de cards a la derecha. */
    .contact-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 26rem);
      gap: clamp(2rem, 4vw, 4rem);
      align-items: stretch;
      width: 100%;
    }

    .ct-brand {
      display: flex;
      align-items: flex-end;
      /* Container query: el título se mide contra el ancho de SU columna, no del viewport,
         así "nolo" llena la columna sin desbordar hacia el recuadro. */
      container-type: inline-size;
    }

    /* "nolo" llena el ancho de su columna (≈42% del ancho de columna por glifo del wordmark). */
    .ct-title {
      margin: 0;
      color: var(--ink);
      font-size: 44cqw;
      font-weight: 600;
      letter-spacing: -0.06em;
      line-height: 0.8;
      /* Wordmark decorativo: no se selecciona ni se copia con el cursor. */
      cursor: default;
      user-select: none;
      -webkit-user-select: none;
    }

    /* Cards unidas en vertical: radio solo en los extremos del bloque, borde compartido
       (mismo patrón que dev-types / portfolio). */
    .ct-cards {
      display: flex;
      flex-direction: column;
      align-self: start;
    }

    .ct-card {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      padding: clamp(1.5rem, 2.4vw, 2.1rem);
      border: 1px solid var(--line-strong);
      border-radius: 0.9rem;
      /* Opaco a propósito: tapa la grilla técnica del fondo. Cambia de color con el tema
         (claro↔oscuro) de forma suave junto con el resto de la página. */
      background: #fafafa;
      transition: background-color 450ms ease, border-color 450ms ease;
    }

    .ct-card + .ct-card {
      border-top: 0;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    .ct-card:not(:last-child) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* Tema oscuro (cuando el footer activa la dark-zone): card elevado oscuro + borde claro,
       para que el cambio a negro sea cuidado y no quede un panel claro sobre fondo oscuro. */
    :host-context(.app-dark) .ct-card {
      background: #161616;
      border-color: rgba(255, 255, 255, 0.16);
    }

    .ct-card__label {
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .ct-list,
    .ct-info {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* Filas de canales (icono + texto). */
    .ct-row {
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
      color: var(--ink);
      font-size: 1.05rem;
      text-decoration: none;
      transition: color 180ms ease;
    }

    .ct-row__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--muted);
      transition: color 180ms ease;
    }

    .ct-row:hover .ct-row__icon,
    .ct-row:focus-visible .ct-row__icon {
      color: var(--accent);
    }

    .ct-row:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: 2px;
    }

    /* Fila del correo: link mailto + botón de copiar al portapapeles. */
    .ct-mail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .ct-copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 0.3rem;
      border: 0;
      background: none;
      color: var(--muted);
      cursor: pointer;
      transition: color 180ms ease;
    }

    .ct-copy:hover,
    .ct-copy:focus-visible {
      color: var(--ink);
      outline: none;
    }

    /* Información: líneas de texto. */
    .ct-info li {
      color: var(--ink);
      font-size: 1.02rem;
      line-height: 1.5;
    }

    /* Áreas de trabajo: link con flecha. */
    .ct-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      color: var(--ink);
      font-size: 1.15rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      text-decoration: none;
      transition: color 180ms ease;
    }

    .ct-area__arrow {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--muted);
      transition: color 180ms ease, transform 200ms ease;
    }

    .ct-area:hover .ct-area__arrow,
    .ct-area:focus-visible .ct-area__arrow {
      color: var(--accent);
      transform: translate(2px, -2px);
    }

    .ct-area:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
      border-radius: 2px;
    }

    /* Mobile / tablet: una sola columna; título arriba, cards debajo. */
    @media (max-width: 900px) {
      .contact {
        display: block;
        min-height: 0;
        padding: clamp(1.5rem, 4vw, 2.5rem) 0 var(--section-py);
      }

      .contact-grid {
        grid-template-columns: 1fr;
        gap: clamp(2rem, 6vw, 3rem);
      }

      .ct-brand {
        align-items: flex-start;
      }

      .ct-title {
        font-size: clamp(5rem, 36vw, 13rem);
      }
    }
  `
})
export class ContactPageComponent {
  private readonly i18n = inject(LanguageService);
  private readonly ads = inject(AdsService);
  protected readonly lang = this.i18n.lang;
  protected readonly t = computed(() => CONTACT_TEXT[this.lang()]);

  protected readonly info: ContactInfo = {
    email: 'hola@nolo.ar',
    whatsappLink: 'https://wa.me/5491133337180',
    calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
    calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team',
    location: 'Buenos Aires, Argentina'
  };

  protected readonly copied = signal(false);

  // Copia el correo al portapapeles y muestra el check por un instante.
  protected copyEmail(): void {
    this.ads.emailCopy();
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clip) {
      return;
    }
    clip
      .writeText(this.info.email)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 1800);
      })
      .catch(() => {});
  }

  protected onWhatsapp(): void {
    this.ads.whatsapp();
  }

  protected onSchedule(): void {
    this.ads.scheduleMeeting();
  }
}

const CONTACT_TEXT = {
  es: {
    aria: 'Contacto',
    channels: 'Canales',
    info: 'Información',
    areas: 'Áreas de trabajo',
    whatsapp: 'Escribinos por WhatsApp',
    calendar: 'Agendá una reunión',
    schedule: 'Lunes a viernes, 9 a 18',
    response: 'Respuesta dentro de las 24 horas hábiles',
    software: 'Software a medida',
    web: 'Sitios web',
    copy: 'Copiar correo',
    copied: 'Correo copiado'
  },
  en: {
    aria: 'Contact',
    channels: 'Channels',
    info: 'Information',
    areas: 'What we do',
    whatsapp: 'Message us on WhatsApp',
    calendar: 'Book a meeting',
    schedule: 'Monday to Friday, 9am–6pm',
    response: 'Reply within one business day',
    software: 'Custom software',
    web: 'Websites',
    copy: 'Copy email',
    copied: 'Email copied'
  }
} as const;

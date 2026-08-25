import { z } from "zod";
import { posDemoSchema, type PosDemoProps, type Rect } from "../template/schema";

/**
 * Mobile UI variant of Video 01 — same cue sheet, audio, captions, and CTA
 * copy as Corte, with the mobile selects filling the upper half of the frame.
 */
const MOBILE_TOP_CROP = {
  x: 0,
  y: 0,
  width: 1,
  // 860x1864 source cropped to the 1080x960 upper-half box without distortion.
  height: 0.41,
} as const;

const MOBILE_CLOSING_DIALOG_CROP = {
  x: 0,
  // The dialog sits below the mobile header; keep its controls inside the
  // 1080x960 upper-half viewport.
  y: 0.2,
  width: 1,
  height: 0.41,
} as const;

const MOBILE_FOLIO_DETAIL_CROP = {
  x: 0,
  y: 0.22,
  width: 1,
  height: 0.41,
} as const;

interface MobileClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const mobileClip = (clip: string, options: MobileClipOptions = {}) => ({
  clip,
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? MOBILE_TOP_CROP,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/corte-v1.mp3",
  captionStyle: "paper",

  hook: {
    text: "¿Te ha faltado dinero en la caja?",
    subline: "…y nadie sabe por qué.",
    until: 4.2,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.2,
      layout: "mobile-upper-half",
      panes: [
        mobileClip(
          "videos/punto-listo/mobile-selects/01-hook-caja-mobile-v4.mp4",
          { playbackRate: 0.4 },
        ),
      ],
    },
    {
      name: "Esperado",
      from: 4.2,
      to: 9.9,
      layout: "mobile-upper-half",
      panes: [
        mobileClip(
          "videos/punto-listo/mobile-selects/04-corte-de-caja-mobile-v4.mp4",
          { playbackRate: 0.3 },
        ),
      ],
    },
    {
      name: "Diferencia",
      from: 9.9,
      to: 14.82,
      layout: "mobile-upper-half",
      panes: [
        mobileClip(
          "videos/punto-listo/mobile-selects/04-corte-de-caja-mobile-v4.mp4",
          {
            // Begin on the confirmed 562 / $0.00 state and hold it through
            // the difference narration without reaching the closed-history card.
            trimBefore: 3.5,
            playbackRate: 0.15,
            frame: MOBILE_CLOSING_DIALOG_CROP,
          },
        ),
      ],
    },
    {
      name: "Folio",
      from: 14.82,
      to: 18.44,
      layout: "mobile-upper-half",
      panes: [
        mobileClip(
          "videos/punto-listo/mobile-selects/03-folio-y-cambio-mobile-v4.mp4",
          { trimBefore: 2.8, frame: MOBILE_FOLIO_DETAIL_CROP },
        ),
      ],
    },
    {
      name: "Dispositivos",
      from: 18.44,
      to: 21.72,
      layout: "mobile-upper-half",
      panes: [
        mobileClip(
          "videos/punto-listo/mobile-selects/05-celular-dashboard-mobile-v4.mp4",
          { trimBefore: 2.8 },
        ),
      ],
    },
  ],

  cta: {
    from: 21.72,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta, sin instalar nada",
    pill: "El link está en la bio",
    revealAt: { line2: 22.93, note: 23.99, pill: 25.28 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const corteMobileProps: PosDemoProps = posDemoSchema.parse(input);

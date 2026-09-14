import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  uiWindow,
  type PosDemoProps,
  type Rect,
} from "../template/schema";

/**
 * Video 08 — Devoluciones con autorización
 * (PLV-20260907-devoluciones-autorizadas), cut from the single take
 * `01-devoluciones-autorizadas.mp4` (1170x2532, 51.43s, 30fps), recorded in
 * Mariana's cashier session.
 *
 * The whole point is that the cashier gets as far as the dialog and no
 * further, so beats 2 and 3 stay on that dialog: the empty credential fields,
 * then the credentials being entered. The password is a masked field in the
 * recording and never legible.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.9  /dashboard/venta de la cajera
 *   1.0– 8.9  Devoluciones y cancelaciones: 1037 ventas con Devolver y Cancelar
 *   9.0–13.5  se teclea el folio 2082 → 1 venta, Bonafont 1 L, $26.00
 *  14.0–17.5  diálogo Devolver venta completa y se escribe el correo
 *  18.0–19.5  la contraseña se captura enmascarada
 *  20.0–20.9  Procesando…
 *  21.0–24.5  la venta queda Devuelta; aviso "Reverso creado con folio 2109"
 *  25.0–32.5  Historial de ventas: folio 2082 expandido con su reverso ligado
 *  33.0–36.5  Existencias del producto en la sesión de la cajera
 *  37.0–39.5  Historial: movimiento Devolución +2.000, folio 2109
 *  40.0–51.4  Corte de caja de Mariana con Devoluciones: $26.00 bajo efectivo
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** La lista de ventas con sus botones Devolver y Cancelar. */
const REVERSALS = windowAt(500);

/** El diálogo de autorización, con sus dos campos. */
const DIALOG = windowAt(700);

/** El detalle de la venta devuelta y, después, el movimiento que la sigue. */
const LINKED = windowAt(1145);

/** El corte abierto: inicial, esperado y el desglose por método de pago. */
const CASH_CUT = windowAt(400);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip:
    "videos/punto-listo/plv-20260907-devoluciones-autorizadas/01-devoluciones-autorizadas.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? REVERSALS,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260907-devoluciones-autorizadas.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Quién puede cancelar?",
    subline: "¿Cualquiera en tu tienda?",
    until: 3.79,
  },

  beats: [
    {
      name: "Cualquiera cancela",
      from: 0,
      to: 3.79,
      layout: "mobile-ui",
      // A day of sales, every one of them with a Devolver and a Cancelar
      // button: the question the hook asks, already on screen.
      panes: [take({ trimBefore: 5.2 })],
    },
    {
      name: "No puede solo",
      from: 3.79,
      to: 9.73,
      layout: "mobile-ui",
      // The folio is searched and the dialog opens right as the line reaches
      // "pero no puede solo".
      panes: [take({ trimBefore: 9.0 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Autoriza un administrador",
      from: 9.73,
      to: 15.81,
      layout: "mobile-ui",
      // Credentials entered in the dialog, in the cashier's own session. The
      // password field is masked in the source and stays masked here.
      panes: [take({ trimBefore: 14.5, playbackRate: 1.07, frame: DIALOG })],
      callout: {
        text: "Autoriza el dueño o encargado",
        left: 40,
        top: 1120,
        at: 1.6,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 5.2, volume: 0.22 },
      ],
    },
    {
      name: "Queda ligado y regresa",
      from: 15.81,
      to: 22.6,
      layout: "mobile-ui",
      // Two proofs inside one line: the sale marked Devuelta with its linked
      // folio, then the Devolución movement putting the product back.
      panes: [take({ trimBefore: 29.0, playbackRate: 1.47, frame: LINKED })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 6.2, volume: 0.28 },
      ],
    },
    {
      name: "Cuadra en el corte",
      from: 22.6,
      to: 28.61,
      layout: "mobile-ui",
      // Mariana's own open cut, with Devoluciones broken out under efectivo.
      // The cut is never closed here — that belongs to video 01.
      panes: [take({ trimBefore: 40.0, frame: CASH_CUT })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 28.61,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 29.68, note: 30.87, pill: 32.0 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const devolucionesAutorizadasProps: PosDemoProps =
  posDemoSchema.parse(input);

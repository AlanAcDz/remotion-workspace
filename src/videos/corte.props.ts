import { z } from "zod";
import { posDemoSchema, type PosDemoProps } from "../template/schema";

/**
 * Video 01 — "Corte de caja".
 *
 * Beat times are the Whisper transcript of the voiceover
 * (public/captions/corte-v1.json), not estimates. Crop rectangles are
 * fractions of each clip's own frame; the desktop masters are 1280x720 and
 * the phone recording is 860x1864, so the same 0–1 numbers work for both.
 */
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
      panes: [
        {
          clip: "videos/punto-listo/corte-desktop.mp4",
          trimBefore: 0.6,
          // x 285–1045, y 0–543 — la pantalla de corte, sin la barra lateral
          frame: { x: 0.2227, y: 0, width: 0.5938, height: 0.7542 },
        },
      ],
    },
    {
      name: "Esperado",
      from: 4.2,
      to: 9.9,
      panes: [
        {
          clip: "videos/punto-listo/corte-desktop.mp4",
          trimBefore: 1.6,
          playbackRate: 0.56, // el beat llega al segundo 4.8, antes de que abra el modal
          // x 560–1180, y 20–463 — Inicial $500 y Esperado $562
          frame: { x: 0.4375, y: 0.0278, width: 0.4844, height: 0.6153 },
        },
      ],
      // coordenadas relativas al panel, justo debajo de "Esperado $562.00"
      callout: { text: "Esperado $562.00", left: 566, top: 210, at: 1.4 },
    },
    {
      name: "Diferencia",
      from: 9.9,
      to: 14.82,
      panes: [
        {
          clip: "videos/punto-listo/corte-desktop.mp4",
          trimBefore: 4.833,
          playbackRate: 2, // la resolución "Diferencia $0.00" cae en la palabra "diferencia"
          frame: { x: 0.2344, y: 0.0833, width: 0.5938, height: 0.7542 },
          // push-in al modal "Cerrar mi corte"
          zoomTo: { x: 0.2695, y: 0.2069, width: 0.4609, height: 0.5861 },
          zoomStart: 0.5,
          zoomEnd: 3,
        },
      ],
    },
    {
      name: "Folio",
      from: 14.82,
      to: 18.44,
      panes: [
        {
          clip: "videos/punto-listo/folio.mp4",
          trimBefore: 0.9,
          playbackRate: 0.6, // quedan 2.18s de clip para un beat de 3.6s
          // x 288–1062, y 40–594 — el ticket con su folio
          frame: { x: 0.225, y: 0.0556, width: 0.6047, height: 0.7694 },
        },
      ],
    },
    {
      name: "Dispositivos",
      from: 18.44,
      to: 21.72,
      panes: [
        {
          clip: "videos/punto-listo/corte-cerrado.png",
          still: true,
          // x 288–1250, y 0–309 — el corte cerrado con Diferencia $0.00
          frame: { x: 0.225, y: 0, width: 0.7516, height: 0.4292 },
          box: { left: 20, top: 258, width: 690, height: 222, radius: 28 },
        },
        {
          clip: "videos/punto-listo/corte-mobile.mp4",
          // grabación nativa del viewport móvil, sin recorte
          box: { left: 716, top: 55, width: 290, height: 628, radius: 40 },
        },
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

export const corteProps: PosDemoProps = posDemoSchema.parse(input);

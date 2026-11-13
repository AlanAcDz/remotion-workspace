import type { z } from "zod";
import { bonSchema, type BonProps } from "../bon/schema";

/**
 * "Una tarde en BON" — Private Soft Opening de BON Luxury Theme Park
 * (VidantaWorld Vallarta - Nuevo Nayarit), Nov 11 2026. Rally piece 1 for a
 * VidantaWorld Vacation Planner: entrance → sunset at the lagoon → carousel →
 * the park at night → "apenas la primera etapa" → call to action.
 *
 * Final cut, driven by her voice note (WhatsApp Ptt Nov 12 2026.ogg), edited
 * into `audio/bon-una-tarde-voz.mp3`: "Hola," dropped, pauses tightened,
 * levelled to about -16 LUFS. Each segment's `start` and each chunk's `at`
 * are seconds of that edited file (see src/bon/README.md). Captions follow
 * her words, including "aguas" and "con nuestras atracciones".
 *
 * Shots use the original phone recordings' seconds; `sourceOffset` maps them
 * onto the trimmed copies in public/bon/ (upright 1080x1920, 30 fps, muted).
 * Avoided on purpose: staff by the merch kiosk (sunset 3–8 s, 33.5 s on), the
 * guest at 19 s of the sunset walk, the guest on the path in (19) at
 * 32.5–33.3 s, guests on the terrace in (19), guests at the carousel fence in
 * (17) at 0–1.5 s and 24–26.5 s, the rider in (18) from 36 s, the "KIDS COVE"
 * sign in (18) from 17 s and in (17) at 19.5–21 s, and the PELIGRO sign in
 * (13), cropped out of montana.mp4. Labels name only the confirmed rides.
 *
 * Music: `bon-una-tarde-bed-long.mp3`, Eleven Music (80 s, -14.6 LUFS,
 * -1.2 dBFS), generated once for this cut. It opens up at ~0:20 (the lagoon),
 * lifts at ~0:38 (the night) and resolves from ~1:02 to a ringing chord.
 */
const input = {
  // Shown in her introduction; her second surname is unconfirmed.
  plannerName: "Guadalupe Díaz",
  clips: {
    entrada: {
      // WhatsApp Video Nov 11 2026 (11).mp4
      src: "bon/entrada.mp4",
    },
    atardecer: {
      // 20261111_182450.mp4 — its audio has a commercial song: never used.
      src: "bon/atardecer.mp4",
      sourceOffset: 9,
    },
    carruselAtardecer: {
      // WhatsApp Video Nov 11 2026 (18).mp4
      src: "bon/carrusel-atardecer.mp4",
      sourceOffset: 14,
    },
    carruselNoche: {
      // WhatsApp Video Nov 11 2026 (17).mp4
      src: "bon/carrusel-noche.mp4",
      sourceOffset: 2,
    },
    lagunaNoche: {
      // WhatsApp Video Nov 11 2026 (19).mp4
      src: "bon/laguna-noche.mp4",
    },
    senderoNoche: {
      // WhatsApp Video Nov 11 2026 (19).mp4
      src: "bon/sendero-noche.mp4",
      sourceOffset: 32.5,
    },
    skyShip: {
      // WhatsApp Video Nov 11 2026 (16).mp4
      src: "bon/sky-ship.mp4",
      sourceOffset: 4.5,
    },
    juegoGiratorio: {
      // WhatsApp Video Nov 11 2026 (19).mp4 — the ride seen from the garden
      // path; (15) frames guests at tables in the foreground.
      src: "bon/juego-giratorio.mp4",
      sourceOffset: 20,
    },
    juegoGiratorioCerca: {
      // WhatsApp Video Nov 11 2026 (1).mp4 — 576x1024 original, upscaled.
      src: "bon/juego-giratorio-cerca.mp4",
      sourceOffset: 3.5,
    },
    montana: {
      // WhatsApp Video Nov 11 2026 (13).mp4 — top 74 % only (no PELIGRO sign).
      src: "bon/montana.mp4",
      sourceOffset: 19,
    },
  },
  segments: [
    {
      kind: "footage",
      name: "01 Gancho",
      start: 0,
      chunks: [
        { text: "Este parque todavía\nno abre al público…", at: 0.08 },
        { text: "y yo ya lo recorrí.", at: 2.81 },
      ],
      duration: 4.6,
      isEmphasized: true,
      shots: [
        { clip: "atardecer", from: 25.8, to: 27.8 },
        { clip: "entrada", from: 0, to: 2.0 },
      ],
    },
    {
      kind: "footage",
      name: "02 Presentación",
      start: 4.02,
      chunks: [
        { text: "Soy {plannerName},", at: 4.25 },
        { text: "Vacation Planner\nde VidantaWorld,", at: 5.82 },
        { text: "y te llevo conmigo", at: 7.54 },
        { text: "al BON Luxury\nTheme Park.", at: 9.27 },
      ],
      duration: 5.1,
      chapter: "I · La entrada",
      shots: [
        { clip: "entrada", from: 2.4, to: 5.9 },
        { clip: "entrada", from: 9.5, to: 13.0, label: "Private Soft Opening" },
      ],
    },
    {
      kind: "footage",
      name: "03 Beauty of Nature",
      start: 11.05,
      chunks: [
        { text: "BON significa\nBeauty of Nature,", at: 11.24 },
        { text: "y se nota\ndesde la entrada:", at: 14.63 },
        { text: "todo está rodeado\nde selva, flores y aguas.", at: 16.59 },
      ],
      duration: 7.7,
      shots: [
        { clip: "entrada", from: 14.5, to: 18.3 },
        { clip: "entrada", from: 6.0, to: 9.2 },
        { clip: "atardecer", from: 14.0, to: 16.3 },
      ],
    },
    {
      kind: "footage",
      name: "04 La laguna",
      start: 20.43,
      chunks: [
        { text: "Llegamos al atardecer.", at: 20.59 },
        {
          text: "Esta es la laguna,\ncon las góndolas\npasando por arriba",
          at: 22.45,
        },
        { text: "y Floresta Drop al fondo.", at: 26.23 },
      ],
      duration: 7.8,
      chapter: "II · El atardecer",
      shots: [
        { clip: "atardecer", from: 16.3, to: 18.45 },
        { clip: "atardecer", from: 20.1, to: 24.0 },
        { clip: "atardecer", from: 24.0, to: 25.8, label: "Floresta Drop" },
      ],
    },
    {
      kind: "footage",
      name: "05 El carrusel",
      start: 28.28,
      chunks: [
        {
          text: "Es un universo inspirado\nen la naturaleza y la\nmitología de México.",
          at: 28.41,
        },
        { text: "Mira este carrusel:", at: 33.28 },
        { text: "aquí no hay caballos,\nhay criaturas\nllenas de color,", at: 34.51 },
      ],
      duration: 10.6,
      chapter: "III · El carrusel",
      shots: [
        { clip: "carruselAtardecer", from: 14.0, to: 16.3, label: "Carousel of Colors" },
        { clip: "carruselNoche", from: 6.0, to: 8.6, label: "Carousel of Colors" },
        { clip: "carruselNoche", from: 2.6, to: 4.4, label: "Carousel of Colors" },
        { clip: "carruselNoche", from: 27.2, to: 30.1, label: "Carousel of Colors" },
      ],
    },
    {
      kind: "footage",
      name: "06 La noche",
      start: 37.86,
      chunks: [
        { text: "y cuando cae la noche,\nel parque se transforma", at: 37.93 },
        { text: "en luces, música\ny fuentes.", at: 41.59 },
      ],
      duration: 5.5,
      chapter: "IV · La noche",
      shots: [
        { clip: "senderoNoche", from: 33.4, to: 35.8 },
        { clip: "lagunaNoche", from: 0.7, to: 4.7 },
      ],
    },
    {
      kind: "footage",
      name: "07 Sky Ship",
      start: 44.25,
      chunks: [
        { text: "Hay atracciones para\ntodas las generaciones,", at: 44.44 },
        { text: "como el Sky Ship,", at: 47.74 },
        { text: "que se balancea\nde lado a lado.", at: 49.19 },
      ],
      duration: 7.2,
      shots: [
        { clip: "skyShip", from: 5.0, to: 7.0, label: "Warrior Sky Ship" },
        { clip: "skyShip", from: 19.8, to: 24.6, label: "Warrior Sky Ship" },
      ],
    },
    {
      kind: "footage",
      name: "08 Primera etapa",
      start: 51.02,
      chunks: [
        { text: "Y esto es apenas la\nprimera etapa de BON.", at: 51.19 },
        { text: "Y se va a ir revelando\npor capítulos,", at: 53.88 },
        { text: "con nuestras atracciones,\npersonajes e historias.", at: 56.44 },
      ],
      duration: 9.2,
      shots: [
        { clip: "juegoGiratorio", from: 20.8, to: 23.3 },
        { clip: "juegoGiratorioCerca", from: 4.0, to: 6.0 },
        { clip: "montana", from: 19.8, to: 22.5, label: "Tecuani Beast" },
        { clip: "carruselNoche", from: 9.2, to: 11.2, label: "Carousel of Colors" },
      ],
    },
    {
      kind: "footage",
      name: "09 Exclusiva para huéspedes",
      start: 60.25,
      chunks: [
        { text: "Por ahora, la experiencia\nes exclusiva\npara huéspedes", at: 60.44 },
        { text: "de VidantaWorld Vallarta -\nNuevo Nayarit.", at: 63.63 },
      ],
      duration: 7.2,
      shots: [
        { clip: "atardecer", from: 11.6, to: 13.6 },
        { clip: "atardecer", from: 29.3, to: 31.4 },
        { clip: "entrada", from: 18.0, to: 19.95 },
      ],
    },
    {
      kind: "end-card",
      name: "10 Escríbeme",
      start: 66.3,
      chunks: [{ text: "Si quieres vivirlo,\nescríbeme y planeamos\ntu visita." }],
      duration: 5.0,
    },
  ],
  voiceover: {
    src: "audio/bon-una-tarde-voz.mp3",
    endHold: 4.0,
  },
  music: {
    src: "music/bon-una-tarde-bed-long.mp3",
    trimBefore: 0.35,
    // The bed runs about -16.5 LUFS short-term to 0:26 and -13.5 after:
    // 0.17 keeps it 12-15 dB under the voice (-16.3 LUFS).
    volume: 0.6,
    underVoiceVolume: 0.17,
    endCardVolume: 0.34,
    fadeOut: 2.5,
  },
  endCard: {
    logo: "bon/logo-vacation-planner.png",
    tags: ["@vwvacationplanner", "@vidantaworld", "@bon.vidantaworld"],
  },
} satisfies z.input<typeof bonSchema>;

export const bonUnaTardeProps: BonProps = bonSchema.parse(input);

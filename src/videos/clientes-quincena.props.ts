import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Video 31 — Los de siempre: clientes de quincena
 * (PLV-20261023-clientes-quincena). A new format: five customers every
 * tendero knows, made to be sent to one. Each gets an illustration and two
 * bands — the setup, then the punchline on its word — and the first one (a
 * big bill for one chicle) bridges to the change Punto Listo works out.
 *
 * Illustrations: generated with Codex (1024x1536), the same counter in all
 * five. Cover-fitted they scale 1.25x and lose 100px a side; their upper
 * third (frame y < 600) is plain cream, where the bands sit.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it): "El que paga" 2.88, "billete"
 * 4.11, "La que pide" 5.55, "pero del bueno" 7.32, "El que ya trae" 8.32, "y
 * está mal" 10.13, "El de" 11.08, "¿me lo deja" 11.73, "Y el que pregunta"
 * 13.27, "cuando ya" 15.39, "Para el del billete" 17.03, "tecleas" 19.49,
 * "el cambio sale solo" 21.34, "Pruébalo" 22.76, "14" 23.75, "sin tarjeta"
 * 25.00, end 25.78.
 *
 * Proof: `cambio-62.png`, `plv-20260903-cobro-rapido/01-cobro-rapido.mp4` at
 * 15.5s (1170x2532): Efectivo recibido 100, Cambio $62.00. A still, because
 * while the 100 is typed (14.6–15.0) the app briefly flags "El efectivo
 * recibido no cubre el total" and the rows shift. The take is paid with $100,
 * so the voice says "billete grande", not "500".
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const ART = "videos/punto-listo/plv-20261023-clientes-quincena";
const SETUP_Y = 150;
const PUNCH_Y = 400;

interface Customer {
  name: string;
  photo: string;
  from: number;
  to: number;
  setup: string;
  punch: string;
  punchAt: number;
}

const CUSTOMERS: Customer[] = [
  {
    name: "#1 El billete",
    photo: `${ART}/01-billete.jpg`,
    from: 2.85,
    to: 5.5,
    setup: "El que paga un chicle…",
    punch: "con billete de *$500*",
    punchAt: 4.1,
  },
  {
    name: "#2 El jamón",
    photo: `${ART}/02-jamon.jpg`,
    from: 5.5,
    to: 8.25,
    setup: "La que pide un cuarto de jamón…",
    punch: "*pero del bueno*",
    punchAt: 7.3,
  },
  {
    name: "#3 La cuenta",
    photo: `${ART}/03-cuenta.jpg`,
    from: 8.25,
    to: 11.0,
    setup: "El que ya trae la cuenta hecha…",
    punch: "*y está mal*",
    punchAt: 10.1,
  },
  {
    name: "#4 El descuento",
    photo: `${ART}/04-descuento.jpg`,
    from: 11.0,
    to: 13.2,
    setup: "El de…",
    punch: "*“¿me lo deja\nen cuarenta?”*",
    punchAt: 11.7,
  },
  {
    name: "#5 La tarjeta",
    photo: `${ART}/05-tarjeta.jpg`,
    from: 13.2,
    to: 16.95,
    setup: "El que pregunta si aceptas tarjeta…",
    punch: "*cuando ya le cobraste*",
    punchAt: 15.35,
  },
];

const PROOF_AT = 16.95;
const CARD_AT = 19.3;
const CTA_AT = 22.7;

const customerScenes = CUSTOMERS.map((customer, index) => ({
  name: customer.name,
  // The first customer is already on screen under the title card.
  from: index === 0 ? 0 : customer.from,
  to: customer.to,
  photo: customer.photo,
  zoom: { from: 1, to: 1.06, originX: 0.5, originY: 0.7 },
}));

const customerBands = CUSTOMERS.flatMap((customer, index) => [
  {
    type: "title" as const,
    text: customer.setup,
    kicker: `#${index + 1}`,
    y: SETUP_Y,
    size: 60,
    from: customer.from,
    until: customer.to,
  },
  {
    type: "title" as const,
    text: customer.punch,
    y: PUNCH_Y,
    size: 84,
    from: customer.punchAt,
    until: customer.to,
  },
]);

const input = {
  audioFile: "audio/plv-20261023-clientes-quincena-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    ...customerScenes,
    {
      name: "Para el del billete grande",
      from: PROOF_AT,
      to: CARD_AT,
      photo: CUSTOMERS[0].photo,
      zoom: { from: 1.06, to: 1.08, originX: 0.5, originY: 0.7 },
      dim: 0.3,
    },
    {
      name: "Punto Listo · cambio",
      from: CARD_AT,
      to: CTA_AT,
      photo: CUSTOMERS[0].photo,
      zoom: { from: 1.08, to: 1.1, originX: 0.5, originY: 0.7 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: `${ART}/cambio-62.png`,
        still: true,
        source: SOURCE,
        // Efectivo recibido down to the Cambio row.
        crop: { left: 30, top: 1460, width: 1110, height: 730 },
        ring: { left: 50, top: 2045, width: 1070, height: 120, at: 2.1 },
        top: 300,
      },
    },
  ],

  overlays: [
    {
      type: "title",
      text: "Clientes de *quincena*\nque todo tendero conoce",
      kicker: "LOS DE SIEMPRE",
      y: SETUP_Y + 40,
      size: 76,
      animate: false,
      from: 0,
      until: CUSTOMERS[0].from,
    },
    ...customerBands,
    {
      type: "title",
      text: "Para el del *billete grande*…",
      kicker: "#1",
      y: SETUP_Y,
      size: 64,
      from: PROOF_AT,
      until: CARD_AT,
    },
  ],

  sfx: [
    ...CUSTOMERS.map((customer) => ({
      sound: SFX.whoosh,
      at: customer.from - 0.05,
      volume: 0.3,
    })),
    ...CUSTOMERS.map((customer) => ({
      sound: SFX.pop,
      at: customer.punchAt,
      volume: 0.45,
    })),
    { sound: SFX.whoosh, at: CARD_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: CARD_AT + 2.1, volume: 0.5 },
  ],

  // The bands carry the words until the proof; captions take over there.
  captions: { from: PROOF_AT, until: CTA_AT },

  cta: {
    from: CTA_AT,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 23.75, note: 25.0, pill: 25.4 },
  },
  end: 27.0,
} satisfies z.input<typeof photoStorySchema>;

export const clientesQuincenaProps: PhotoStoryProps =
  photoStorySchema.parse(input);

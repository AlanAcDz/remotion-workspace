import { z } from "zod";
import { slideSchema, type CarouselSlide } from "../carousel/schema";

/**
 * C05 — Lo que se te va a acabar el 1 de noviembre
 * (PLC-20261023-dia-de-muertos). A save-it checklist posted Monday 26 Oct,
 * a week before Día de Muertos. Slides 2–7 are shop advice, not app features;
 * only the closing slide speaks for Punto Listo (vendes por kilo, filtras lo
 * que va bajo, registras la compra). No alcohol or tobacco, per platform rules.
 *
 * Photos: generated with Codex (1536x1024, unbranded, no text), except
 * `06-existencias-bajas.jpg`, the demo store's Existencias filtered to Bajos o
 * negativos (`plv-20260907-existencias-bajas/coca-negativa.png`, 1170x862
 * from y 118).
 */

const PHOTOS = "videos/punto-listo/plc-20261023-dia-de-muertos";

const input = [
  {
    type: "cover",
    photo: `${PHOTOS}/00-portada.jpg`,
    title: "Lo que se te va\na acabar el\n*1 de noviembre*",
    subtitle: "6 cosas que una tiendita surte\nantes de Día de Muertos.",
    pill: "Guárdalo para tu pedido",
  },
  {
    type: "tip",
    number: 1,
    photo: `${PHOTOS}/01-veladoras.jpg`,
    title: "Veladoras y *cerillos*",
    body: "Se van por caja, no por pieza.\nTen chicas y de vaso.",
  },
  {
    type: "tip",
    number: 2,
    photo: `${PHOTOS}/02-pan.jpg`,
    title: "Pan de muerto",
    body: "Apártalo hoy con tu panadero:\nel 31 ya no alcanza.",
  },
  {
    type: "tip",
    number: 3,
    photo: `${PHOTOS}/03-despensa.jpg`,
    title: "Azúcar, chocolate\nde mesa y café",
    body: "Para la ofrenda… y para la visita.",
  },
  {
    type: "tip",
    number: 4,
    photo: `${PHOTOS}/04-fruta.jpg`,
    title: "Fruta de temporada,\n*por kilo*",
    body: "Mandarina, guayaba, tejocote y caña.",
  },
  {
    type: "tip",
    number: 5,
    photo: `${PHOTOS}/05-dulces.jpg`,
    title: "Calaveritas y\ndulce de calabaza",
    body: "El 1 y el 2 son los días fuertes:\npídelos desde ya.",
  },
  {
    type: "tip",
    number: 6,
    photo: `${PHOTOS}/06-existencias-bajas.jpg`,
    title: "Revisa hoy\n*lo que va bajo*",
    body: "Haz tu pedido antes del jueves,\nno cuando ya te lo pidieron.",
  },
  {
    type: "cta",
    logo: "videos/punto-listo/logo.png",
    title: "Vende por kilo, filtra\nlo que va bajo y\n*registra tu compra*",
    body: "Todo en Punto Listo · puntolisto.com",
    pill: "Pruébalo 14 días sin tarjeta",
  },
] satisfies z.input<typeof slideSchema>[];

export const diaDeMuertosSlides: CarouselSlide[] = input.map((slide) =>
  slideSchema.parse(slide),
);

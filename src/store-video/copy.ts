import type { Lang } from "./schema";

/**
 * On-screen copy. Previews autoplay muted, so these lines carry the story on
 * their own: max two lines each, and every claim matches a shipped feature.
 */
export interface Headline {
  lines: [string] | [string, string];
  /** Words (within one line) underlined in teal. */
  accent?: string;
}

export type HeadlineId =
  | "notify"
  | "dose"
  | "pets"
  | "calendar"
  | "frequency"
  | "widget"
  | "refill"
  | "sleep";

export const HEADLINES: Record<Lang, Record<HeadlineId, Headline>> = {
  en: {
    notify: { lines: ["Pet meds,", "never forgotten"], accent: "never forgotten" },
    dose: { lines: ["One tap.", "Done."], accent: "Done." },
    pets: { lines: ["Every pet,", "every med"], accent: "every med" },
    calendar: { lines: ["Vet visits & vaccines,", "on time"], accent: "on time" },
    frequency: { lines: ["Daily, weekly,", "monthly"] },
    widget: { lines: ["Right from your", "Home Screen"], accent: "Home Screen" },
    refill: { lines: ["Refill before", "you run out"], accent: "Refill" },
    sleep: { lines: ["Doses planned", "around your sleep"], accent: "your sleep" },
  },
  es: {
    notify: {
      lines: ["Las medicinas de tu", "mascota, sin olvidos"],
      accent: "sin olvidos",
    },
    dose: { lines: ["Un toque.", "Listo."], accent: "Listo." },
    pets: { lines: ["Cada mascota,", "cada medicina"], accent: "cada medicina" },
    calendar: { lines: ["Citas y vacunas,", "siempre a tiempo"], accent: "a tiempo" },
    frequency: { lines: ["Diario, semanal,", "mensual"] },
    widget: { lines: ["Desde tu", "pantalla de inicio"], accent: "pantalla de inicio" },
    refill: { lines: ["Reabastece antes", "de que se acabe"], accent: "Reabastece" },
    sleep: { lines: ["Dosis planeadas", "según tu descanso"], accent: "tu descanso" },
  },
};

export const END_CARD: Record<Lang, { name: string; tagline: [string, string] }> = {
  en: { name: "Arya", tagline: ["Calm care", "for every pet"] },
  es: { name: "Arya", tagline: ["Cuidado tranquilo", "para cada mascota"] },
};

/** The app's dose reminder (arya-tracker notifications.medicationTimeForPet). */
export const NOTIFICATION: Record<
  Lang,
  { app: string; time: string; title: string; body: string }
> = {
  en: {
    app: "Arya",
    time: "now",
    title: "Time for Maya's medication!",
    body: "Maya: Magic Drops (1 drop)",
  },
  es: {
    app: "Arya",
    time: "ahora",
    title: "¡Hora de darle sus medicamentos a Maya!",
    body: "Maya: Magic Drops (1 gota)",
  },
};

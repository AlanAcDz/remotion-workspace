import type { z } from "zod";
import {
  vidantaFamiliaSchema,
  type VidantaFamiliaProps,
} from "../vidanta-familia/schema";

/**
 * "Un día en familia en VidantaWorld" — rally piece 2 for a VidantaWorld
 * Vacation Planner (VidantaWorld Vallarta - Nuevo Nayarit), filmed Nov 12
 * 2026. Seven numbered family spaces as one day: breakfast at Café del Lago →
 * La Plaza → the children's pool → lunch at Ola Mulata → the beach → back to
 * Celebrate Park (pool, room, balcony view) → sunset at Grand Luxxe → call
 * to action.
 *
 * Voice: the planner's own voice note (Nov 13), cleaned, levelled to -16 LUFS
 * and cut into one file per segment in public/vidanta-familia/voz/. Each
 * segment lasts its audio plus `voicePadding`; captions follow what she says.
 *
 * Copy comes from the footage and the planner's own words in the clips: "Café
 * del Lago… aquí se reúnen las familias", "La Plaza… donde encuentras desde un
 * súper hasta ropa, farmacia", "Hotel Celebrate Park", "el restaurant Ola
 * Mulata". The children's pool has no confirmed name, so it is described.
 *
 * Shots use the original phone recordings' seconds; `sourceOffset` maps them
 * onto the trimmed copies in public/vidanta-familia/ (upright 1080x1920,
 * 30 fps, muted). Avoided on purpose: the waiter clip, the reception staff in
 * the boardwalk clip before 12 s, the seated guests and the mobility scooter
 * by the "Ola Mulata Snack Bar" sign (ola mulata.mp4 9–26 s), the guests and
 * staff on its terrace (26–47 s) and in its dining room (from 98 s), the
 * guests walking past at 63–67 s, the
 * children in the water (ola mulata.mp4 84–93 s), the swimwear price tags in
 * La Plaza (38–41 s), the reflections of passers-by at the La Plaza door (from
 * 11.6 s), the bottles in the room's kitchenette, and every clip's audio
 * (it carries strangers' conversations).
 *
 * Music: `vidanta-familia-bed.mp3`, Eleven Music (72 s, -13.6 LUFS, -1.1 dBTP
 * raw), generated once for this video. It starts at full level and resolves
 * on its own from ~65 s, under the end card.
 */
const input = {
  clips: {
    cafeEntrada: {
      // cafe del lago/WhatsApp Video Nov 12 2026 (1).mp4 — the carved sign.
      src: "vidanta-familia/cafe-entrada.mp4",
      sourceOffset: 12,
    },
    cafeBuffet: {
      // cafe del lago/WhatsApp Video Nov 12 2026 (2).mp4 — 120 fps original.
      src: "vidanta-familia/cafe-buffet.mp4",
      sourceOffset: 80,
    },
    plazaEntrada: {
      // la plaza/WhatsApp Video Nov 12 2026 (3).mp4 — the "LA PLAZA" sign.
      src: "vidanta-familia/plaza-entrada.mp4",
      sourceOffset: 9,
    },
    plazaChocolate: {
      // la plaza/WhatsApp Video Nov 12 2026 (3).mp4 — chocolate showpiece.
      src: "vidanta-familia/plaza-chocolate.mp4",
      sourceOffset: 74,
    },
    plazaJuguetes: {
      // la plaza/20261112_123748.mp4 — beach toys and kids' clothes.
      src: "vidanta-familia/plaza-juguetes.mp4",
      sourceOffset: 22.5,
    },
    plazaBoutique: {
      // la plaza/20261112_123748.mp4 — clothing and the jewelry kiosk.
      src: "vidanta-familia/plaza-boutique.mp4",
      sourceOffset: 55.5,
    },
    albercaHongo: {
      // ola mulata.mp4 — water mushroom; two children far off, backs turned.
      src: "vidanta-familia/alberca-hongo.mp4",
    },
    albercaHotel: {
      // ola mulata.mp4 — the pool with the towers behind; one adult far off.
      src: "vidanta-familia/alberca-hotel.mp4",
      sourceOffset: 79.5,
    },
    albercaToboganes: {
      // ola mulata.mp4 — slides and striped fence over the planters.
      src: "vidanta-familia/alberca-toboganes.mp4",
      sourceOffset: 93.8,
    },
    olaCamino: {
      // ola mulata.mp4 — the walk from the pool into the Ola Mulata
      // restaurant ("todo esto es el restaurant Ola Mulata", 102 s).
      src: "vidanta-familia/ola-camino.mp4",
      sourceOffset: 95.5,
    },
    playa: {
      // ola mulata.mp4 — from the terrace down the steps to the beach.
      src: "vidanta-familia/playa.mp4",
      sourceOffset: 47.5,
    },
    playaJardin: {
      // ola mulata.mp4 — the beach past the garden.
      src: "vidanta-familia/playa-jardin.mp4",
      sourceOffset: 60.5,
    },
    celebrateLlegada: {
      // hotel celebrate park.mp4 — arrival, gondolas over the sierra.
      src: "vidanta-familia/celebrate-llegada.mp4",
      sourceOffset: 6.5,
    },
    celebrateLobby: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-lobby.mp4",
      sourceOffset: 39.5,
    },
    celebratePiscina: {
      // hotel celebrate park.mp4 — the pool from the deck, nobody in view.
      src: "vidanta-familia/celebrate-piscina.mp4",
      sourceOffset: 79.5,
    },
    celebrateAlberca: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-alberca.mp4",
      sourceOffset: 95.5,
    },
    celebrateRecamara: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-recamara.mp4",
      sourceOffset: 105.5,
    },
    celebrateSala: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-sala.mp4",
      sourceOffset: 122.5,
    },
    celebrateComedor: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-comedor.mp4",
      sourceOffset: 129,
    },
    celebrateBalcon: {
      // hotel celebrate park.mp4 — the bridge and gondolas from the balcony.
      src: "vidanta-familia/celebrate-balcon.mp4",
      sourceOffset: 156.5,
    },
    celebrateVista: {
      // hotel celebrate park.mp4
      src: "vidanta-familia/celebrate-vista.mp4",
      sourceOffset: 163.5,
    },
    luxxeLobby: {
      // gran luxxe torre 5.mp4 — the lobby's blue vases; guests far behind.
      src: "vidanta-familia/luxxe-lobby.mp4",
      sourceOffset: 10,
    },
    luxxeAtardecer: {
      // gran luxxe torre 5.mp4 — sunset from the rooftop garden. The pool
      // (from 66 s) is left out: guests in the water and staff walking by.
      src: "vidanta-familia/luxxe-atardecer.mp4",
      sourceOffset: 57,
    },
  },
  segments: [
    {
      kind: "footage",
      name: "01 Gancho",
      chunks: [
        "Así se vive\nun día en familia",
        "en VidantaWorld\nVallarta -\nNuevo Nayarit.",
      ],
      duration: 5.43,
      voice: "vidanta-familia/voz/01.mp3",
      isEmphasized: true,
      shots: [
        { clip: "albercaHongo", from: 0.2, to: 2.9 },
        { clip: "celebratePiscina", from: 80.4, to: 83.0 },
      ],
    },
    {
      kind: "footage",
      name: "02 Café del Lago",
      chunks: [
        "Empezamos con el desayuno\nen Café del Lago,",
        "donde se reúnen\nlas familias:",
        "buffets y murales\nllenos de color.",
      ],
      duration: 6.92,
      voice: "vidanta-familia/voz/02.mp3",
      chapter: "1 · Café del Lago",
      shots: [
        { clip: "cafeEntrada", from: 12.2, to: 13.95 },
        { clip: "cafeBuffet", from: 99.0, to: 101.8 },
        { clip: "cafeBuffet", from: 80.5, to: 83.0 },
      ],
    },
    {
      kind: "footage",
      name: "03 La Plaza",
      chunks: [
        "Después, una vuelta\npor La Plaza,",
        "donde encuentras desde\nun súper hasta ropa,",
        "chocolates y antojos\npara todos.",
      ],
      duration: 7.15,
      voice: "vidanta-familia/voz/03.mp3",
      chapter: "2 · La Plaza",
      shots: [
        { clip: "plazaEntrada", from: 9.4, to: 11.0 },
        { clip: "plazaBoutique", from: 56.0, to: 57.9 },
        { clip: "plazaJuguetes", from: 23.0, to: 24.9 },
        { clip: "plazaChocolate", from: 74.4, to: 76.3 },
      ],
    },
    {
      kind: "footage",
      name: "04 Alberca infantil",
      chunks: ["Para los más pequeños,", "alberca con toboganes\ny juegos de agua."],
      duration: 5.38,
      voice: "vidanta-familia/voz/04.mp3",
      chapter: "3 · Alberca infantil",
      shots: [
        { clip: "albercaHotel", from: 79.6, to: 82.9 },
        { clip: "albercaToboganes", from: 94.0, to: 95.6 },
      ],
    },
    {
      kind: "footage",
      name: "05 Ola Mulata",
      chunks: ["Luego, a comer\nen Ola Mulata,", "con la playa enfrente."],
      duration: 3.76,
      voice: "vidanta-familia/voz/05.mp3",
      chapter: "4 · Ola Mulata",
      shots: [
        { clip: "olaCamino", from: 95.9, to: 97.5 },
        { clip: "playa", from: 47.8, to: 50.0 },
      ],
    },
    {
      kind: "footage",
      name: "06 La playa",
      chunks: ["Y para la tarde,\nla playa:", "palapas y camastros\nfrente al mar."],
      duration: 5.48,
      voice: "vidanta-familia/voz/06.mp3",
      chapter: "5 · La playa",
      shots: [
        { clip: "playa", from: 50.4, to: 53.6 },
        { clip: "playaJardin", from: 60.95, to: 62.6 },
      ],
    },
    {
      kind: "footage",
      name: "07 Celebrate Park",
      chunks: [
        "Y para descansar,\nel hotel Celebrate Park,",
        "con su alberca\nentre palmeras y jardines.",
      ],
      duration: 7.3,
      voice: "vidanta-familia/voz/07.mp3",
      chapter: "6 · Celebrate Park",
      shots: [
        { clip: "celebrateLlegada", from: 8.3, to: 10.1 },
        { clip: "celebrateLobby", from: 40.2, to: 41.6 },
        { clip: "celebrateAlberca", from: 95.8, to: 99.0 },
      ],
    },
    {
      kind: "footage",
      name: "08 La habitación",
      chunks: [
        "Esta habitación tiene\ndos camas, sala,\ncomedor",
        "y espacio para\ntoda la familia.",
      ],
      duration: 6.98,
      voice: "vidanta-familia/voz/08.mp3",
      shots: [
        { clip: "celebrateRecamara", from: 105.8, to: 108.2 },
        { clip: "celebrateSala", from: 123.0, to: 125.2 },
        { clip: "celebrateComedor", from: 129.3, to: 131.5 },
      ],
    },
    {
      kind: "footage",
      name: "09 El balcón",
      chunks: ["Y desde el balcón,\nesta vista."],
      duration: 3.06,
      voice: "vidanta-familia/voz/09.mp3",
      shots: [
        { clip: "celebrateBalcon", from: 157.0, to: 158.0 },
        { clip: "celebrateVista", from: 163.9, to: 165.6 },
      ],
    },
    {
      kind: "footage",
      name: "10 Grand Luxxe",
      chunks: [
        "Y para cerrar el día,\nel atardecer\ndesde Grand Luxxe.",
        "Muchos espacios para convivir,\nen un mismo lugar.",
      ],
      duration: 8.39,
      voice: "vidanta-familia/voz/10.mp3",
      chapter: "7 · Grand Luxxe",
      shots: [
        { clip: "luxxeLobby", from: 11.0, to: 13.9 },
        { clip: "luxxeAtardecer", from: 58.2, to: 62.7 },
      ],
    },
    {
      kind: "end-card",
      name: "11 Escríbeme",
      chunks: ["Escríbeme y planeamos\njuntos tus próximas\nvacaciones."],
      duration: 6.02,
      voice: "vidanta-familia/voz/11.mp3",
      voicePadding: 2,
    },
  ],
  music: {
    src: "music/vidanta-familia-bed.mp3",
    trimBefore: 0,
    volume: 0.68,
    underVoiceVolume: 0.16,
    fadeOut: 2.5,
  },
  endCard: {
    title: "VidantaWorld",
    subtitle: "Vallarta - Nuevo Nayarit",
    logo: "vidanta-familia/logo-vacation-planner.png",
    tags: ["@vwvacationplanner", "@vidantaworld"],
  },
} satisfies z.input<typeof vidantaFamiliaSchema>;

export const vidantaFamiliaProps: VidantaFamiliaProps = vidantaFamiliaSchema.parse(input);

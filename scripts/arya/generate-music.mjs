/* global AbortSignal, URL, console, fetch */

import { Buffer } from "node:buffer";
import { access, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseApiError } from "../punto-listo/generate-voice.mjs";

const MUSIC_ENDPOINT = "https://api.elevenlabs.io/v1/music";
const MODEL_ID = "music_v2_5";
const OUTPUT_FORMAT = "mp3_44100_192";
const REQUEST_TIMEOUT_MS = 300_000;
const MIN_SECONDS = 3;
const MAX_SECONDS = 600;

function printUsage() {
  console.log(`
Genera una pista instrumental con Eleven Music y la guarda en public/music.

Uso:
  pnpm arya:music --slug <nombre> --seconds <duración> --prompt "<descripción>" [--force]

Opciones:
  --slug       Nombre en minúsculas y guiones, por ejemplo: arya-story-bed
  --seconds    Duración de la pista, entre ${MIN_SECONDS} y ${MAX_SECONDS} segundos
  --prompt     Descripción de la pista en inglés
  --force      Reemplaza una pista existente
  --dry-run    Valida sin llamar a ElevenLabs
  --help       Muestra esta ayuda
`);
}

function parseArguments(argv) {
  const options = { dryRun: false, force: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (argument === "--force") {
      options.force = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (
      argument === "--slug" ||
      argument === "--seconds" ||
      argument === "--prompt"
    ) {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`Falta el valor de ${argument}.`);
      }

      options[argument.slice(2)] = value;
      index += 1;
      continue;
    }

    throw new Error(`Opción desconocida: ${argument}`);
  }

  return options;
}

function validateOptions(options) {
  if (!options.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug)) {
    throw new Error(
      "--slug es obligatorio y solo acepta minúsculas, números y guiones.",
    );
  }

  const seconds = Number(options.seconds);

  if (
    !Number.isFinite(seconds) ||
    seconds < MIN_SECONDS ||
    seconds > MAX_SECONDS
  ) {
    throw new Error(
      `--seconds debe estar entre ${MIN_SECONDS} y ${MAX_SECONDS}.`,
    );
  }

  if (!options.prompt?.trim()) {
    throw new Error("--prompt es obligatorio.");
  }

  return { seconds, prompt: options.prompt.trim() };
}

async function assertOutputIsAvailable(outputPath, force) {
  if (force) {
    return;
  }

  const exists = await access(outputPath).then(
    () => true,
    () => false,
  );

  if (exists) {
    throw new Error(
      `Ya existe ${path.relative(process.cwd(), outputPath)}. Usa --force para reemplazarla.`,
    );
  }
}

async function composeMusic({ prompt, seconds, apiKey }) {
  const endpoint = new URL(MUSIC_ENDPOINT);
  endpoint.searchParams.set("output_format", OUTPUT_FORMAT);

  let response;

  try {
    // Not retried automatically: the track may already be generated and charged.
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: Math.round(seconds * 1000),
        model_id: MODEL_ID,
        force_instrumental: true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "error de red desconocido";
    throw new Error(`No se pudo conectar con ElevenLabs: ${reason}`);
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const audio = Buffer.from(await response.arrayBuffer());

  if (audio.length === 0) {
    throw new Error("ElevenLabs no devolvió audio.");
  }

  return { audio, requestId: response.headers.get("request-id") };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const { seconds, prompt } = validateOptions(options);
  const outputPath = path.join(
    process.cwd(),
    "public",
    "music",
    `${options.slug}.mp3`,
  );
  await assertOutputIsAvailable(outputPath, options.force);

  console.log(`Modelo: ${MODEL_ID}`);
  console.log(`Duración: ${seconds} s`);
  console.log(`Pista: ${path.relative(process.cwd(), outputPath)}`);

  if (options.dryRun) {
    console.log("Validación terminada. No se consumieron créditos.");
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("Falta ELEVENLABS_API_KEY en .env o en el entorno.");
  }

  console.log("Generando la pista…");
  const { audio, requestId } = await composeMusic({ prompt, seconds, apiKey });
  await mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, audio);
  await rename(temporaryPath, outputPath);

  console.log("Pista generada correctamente.");

  if (requestId) {
    console.log(`ID de solicitud: ${requestId}`);
  }
}

main().catch((error) => {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});

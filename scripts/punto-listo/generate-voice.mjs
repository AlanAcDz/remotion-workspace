/* global AbortSignal, URL, console, fetch */

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { alignmentToCaptions } from "./alignment-to-captions.mjs";
import { puntoListoVoiceConfig } from "./voice-config.mjs";

const API_BASE_URL = "https://api.elevenlabs.io/v1";
const REQUEST_TIMEOUT_MS = 120_000;

function printUsage() {
  console.log(`
Genera la locución y los subtítulos de un video de Punto Listo.

Uso:
  pnpm punto-listo:voice --slug <nombre> --script <archivo.txt> [--force]
  pnpm punto-listo:voice --slug <nombre> --script <archivo.txt> --dry-run

Opciones:
  --slug       Nombre en minúsculas y guiones, por ejemplo: inventario-rapido
  --script     Ruta al guion en español
  --force      Reemplaza archivos de audio y subtítulos existentes
  --dry-run    Valida y muestra el costo estimado sin llamar a ElevenLabs
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

    if (argument === "--slug" || argument === "--script") {
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

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertOutputsAreAvailable(paths, force) {
  if (force) {
    return;
  }

  const existingPaths = [];

  for (const filePath of paths) {
    if (await pathExists(filePath)) {
      existingPaths.push(path.relative(process.cwd(), filePath));
    }
  }

  if (existingPaths.length === 0) {
    return;
  }

  throw new Error(
    `Ya existen estos archivos: ${existingPaths.join(", ")}. Usa --force para reemplazarlos.`,
  );
}

async function readScript(scriptPath) {
  const absoluteScriptPath = path.resolve(process.cwd(), scriptPath);
  let text;

  try {
    text = (await readFile(absoluteScriptPath, "utf8")).trim();
  } catch (error) {
    throw new Error(
      `No se pudo leer el guion ${scriptPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!text) {
    throw new Error("El guion está vacío.");
  }

  return text;
}

async function parseApiError(response) {
  const body = await response.json().catch(() => null);
  const detail = body?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail?.message === "string") {
    return detail.message;
  }

  return `ElevenLabs respondió con HTTP ${response.status}.`;
}

export async function generateSpeech(
  text,
  apiKey,
  { fetchImplementation = fetch } = {},
) {
  const { voiceId, modelId, outputFormat, voiceSettings } =
    puntoListoVoiceConfig;
  const endpoint = new URL(
    `${API_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`,
  );
  endpoint.searchParams.set("output_format", outputFormat);

  let response;

  try {
    // A failed paid request is not retried automatically because the server may
    // have generated and charged for the audio before the connection failed.
    response = await fetchImplementation(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings,
        apply_text_normalization: "auto",
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

  const result = await response.json();
  const alignment = result.normalized_alignment ?? result.alignment;
  const audio = Buffer.from(result.audio_base64 ?? "", "base64");

  if (audio.length === 0) {
    throw new Error("ElevenLabs no devolvió audio.");
  }

  return {
    audio,
    captions: alignmentToCaptions(alignment),
    characterCost: response.headers.get("character-cost"),
    requestId: response.headers.get("request-id"),
  };
}

async function writeOutputs({ audio, captions, audioPath, captionsPath }) {
  await mkdir(path.dirname(audioPath), { recursive: true });
  await mkdir(path.dirname(captionsPath), { recursive: true });

  const nonce = randomUUID();
  const temporaryAudioPath = `${audioPath}.${nonce}.tmp`;
  const temporaryCaptionsPath = `${captionsPath}.${nonce}.tmp`;

  try {
    await writeFile(temporaryAudioPath, audio);
    await writeFile(
      temporaryCaptionsPath,
      `${JSON.stringify(captions, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryAudioPath, audioPath);
    await rename(temporaryCaptionsPath, captionsPath);
  } catch (error) {
    await Promise.all([
      rm(temporaryAudioPath, { force: true }),
      rm(temporaryCaptionsPath, { force: true }),
    ]);
    throw error;
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug)) {
    throw new Error(
      "--slug es obligatorio y solo acepta minúsculas, números y guiones.",
    );
  }

  if (!options.script) {
    throw new Error("--script es obligatorio.");
  }

  const text = await readScript(options.script);
  const audioPath = path.join(
    process.cwd(),
    "public",
    "audio",
    `${options.slug}.mp3`,
  );
  const captionsPath = path.join(
    process.cwd(),
    "public",
    "captions",
    `${options.slug}.json`,
  );
  await assertOutputsAreAvailable([audioPath, captionsPath], options.force);

  console.log(`Voz: ${puntoListoVoiceConfig.voiceName}`);
  console.log(`Modelo: ${puntoListoVoiceConfig.modelId}`);
  console.log(`Caracteres del guion: ${Array.from(text).length}`);
  console.log(`Audio: ${path.relative(process.cwd(), audioPath)}`);
  console.log(`Subtítulos: ${path.relative(process.cwd(), captionsPath)}`);

  if (options.dryRun) {
    console.log("Validación terminada. No se consumieron créditos.");
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("Falta ELEVENLABS_API_KEY en .env o en el entorno.");
  }

  console.log("Generando una sola toma con audio y tiempos…");
  const result = await generateSpeech(text, apiKey);
  await writeOutputs({
    ...result,
    audioPath,
    captionsPath,
  });

  console.log("Locución y subtítulos generados correctamente.");

  if (result.characterCost) {
    console.log(
      `Costo reportado por ElevenLabs: ${result.characterCost} caracteres.`,
    );
  }

  if (result.requestId) {
    console.log(`ID de solicitud: ${result.requestId}`);
  }
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  main().catch((error) => {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  });
}

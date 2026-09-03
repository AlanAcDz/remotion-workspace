import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";
import { alignmentToCaptions } from "./alignment-to-captions.mjs";
import { generateSpeech } from "./generate-voice.mjs";
import { puntoListoVoiceConfig } from "./voice-config.mjs";

function createAlignment(text, { usesDurations = false } = {}) {
  const characters = Array.from(text);
  const characterStartTimes = characters.map((_, index) => index * 0.1);
  const characterEndTimes = characters.map((_, index) => {
    return usesDurations ? 0.1 : (index + 1) * 0.1;
  });

  return {
    characters,
    character_start_times_seconds: characterStartTimes,
    character_end_times_seconds: characterEndTimes,
  };
}

test("converts absolute character timings to Remotion word captions", () => {
  const captions = alignmentToCaptions(
    createAlignment("¿Qué tal?\n\nPunto Listo."),
  );

  assert.deepEqual(
    captions.map(({ text, startMs, endMs }) => ({ text, startMs, endMs })),
    [
      { text: "¿Qué", startMs: 0, endMs: 500 },
      { text: " tal?", startMs: 500, endMs: 1100 },
      { text: " Punto", startMs: 1100, endMs: 1700 },
      { text: " Listo.", startMs: 1700, endMs: 2300 },
    ],
  );
});

test("accepts duration values returned by ElevenLabs history alignments", () => {
  const captions = alignmentToCaptions(
    createAlignment("Hola mundo", { usesDurations: true }),
  );

  assert.deepEqual(captions, [
    {
      text: "Hola",
      startMs: 0,
      endMs: 500,
      timestampMs: 0,
      confidence: null,
    },
    {
      text: " mundo",
      startMs: 500,
      endMs: 1000,
      timestampMs: 500,
      confidence: null,
    },
  ]);
});

test("rejects mismatched alignment arrays", () => {
  assert.throws(
    () =>
      alignmentToCaptions({
        characters: ["a"],
        character_start_times_seconds: [],
        character_end_times_seconds: [],
      }),
    /no coinciden/,
  );
});

test("generates audio and captions in one request with the pinned preset", async () => {
  let callCount = 0;
  const fetchImplementation = async (endpoint, options) => {
    callCount += 1;
    const requestBody = JSON.parse(options.body);

    assert.equal(
      endpoint.toString(),
      `https://api.elevenlabs.io/v1/text-to-speech/${puntoListoVoiceConfig.voiceId}/with-timestamps?output_format=${puntoListoVoiceConfig.outputFormat}`,
    );
    assert.equal(options.method, "POST");
    assert.equal(options.headers["xi-api-key"], "test-key");
    assert.deepEqual(requestBody, {
      text: "Hola",
      model_id: puntoListoVoiceConfig.modelId,
      voice_settings: puntoListoVoiceConfig.voiceSettings,
      apply_text_normalization: "auto",
    });

    return {
      ok: true,
      headers: {
        get: (name) => {
          if (name === "character-cost") {
            return "4";
          }

          if (name === "request-id") {
            return "request-123";
          }

          return null;
        },
      },
      json: async () => ({
        audio_base64: Buffer.from("audio").toString("base64"),
        normalized_alignment: createAlignment("Hola"),
      }),
    };
  };

  const result = await generateSpeech("Hola", "test-key", {
    fetchImplementation,
  });

  assert.equal(callCount, 1);
  assert.equal(result.audio.toString(), "audio");
  assert.equal(result.characterCost, "4");
  assert.equal(result.requestId, "request-123");
  assert.deepEqual(result.captions, [
    {
      text: "Hola",
      startMs: 0,
      endMs: 400,
      timestampMs: 0,
      confidence: null,
    },
  ]);
});

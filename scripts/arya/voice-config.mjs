// The fixed English narrator for Arya's "Problem and demo" and "Quick answer"
// videos.
export const aryaVoiceConfig = Object.freeze({
  voiceId: "EXAVITQu4vr4xnSDxMaL",
  voiceName: "Sarah - Mature, Reassuring, Confident",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  voiceSettings: Object.freeze({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
    speed: 1,
  }),
});

// Alan's cloned voice for "Arya's story" videos. The clone only sounds like him
// on the v4 model; eleven_v3 produces a different voice.
export const aryaStoryVoiceConfig = Object.freeze({
  voiceId: "6tBIFMQYkATw1rsRuECj",
  voiceName: "Alan (clone)",
  modelId: "eleven_v4_exp",
  outputFormat: "mp3_44100_128",
  voiceSettings: Object.freeze({
    stability: 0.5,
    similarity_boost: 0.75,
  }),
});

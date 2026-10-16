// The fixed English narrator for Arya's "Problem and demo" and "Quick answer"
// videos. "Arya's story" videos are meant to use Alan's own cloned voice
// instead; add it as a second preset here once the clone exists.
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

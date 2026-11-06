export const puntoListoVoiceConfig = Object.freeze({
  voiceId: "HxRDsm0E8jdUUrG0lqbK",
  voiceName: "Javi - Social Media",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  voiceSettings: Object.freeze({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
    speed: 1,
  }),
  sourceHistoryItemId: "izB9DEm8UT2PE2NbOcAg",
});

// La Carrera's commentator: an experimental format, so it leaves the pinned
// narrator. Low stability and a faster pace keep it sounding like a live call.
export const puntoListoCarreraVoiceConfig = Object.freeze({
  voiceId: "qKiF0EEU7wtRm1G2mLMh",
  voiceName: "Pablo - Energetic Mexican Spanish",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  voiceSettings: Object.freeze({
    stability: 0.3,
    similarity_boost: 0.75,
    style: 0.6,
    use_speaker_boost: true,
    speed: 1.1,
  }),
});

// Mariana's voice notes in El Chat.
export const puntoListoChatVoiceConfig = Object.freeze({
  voiceId: "45awEU2ZYXZdWPFsUd43",
  voiceName: "Tamara",
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  voiceSettings: Object.freeze({
    stability: 0.4,
    similarity_boost: 0.75,
    style: 0.2,
    use_speaker_boost: true,
    speed: 1,
  }),
});

function assertAlignment(alignment) {
  if (!alignment || typeof alignment !== "object") {
    throw new Error("ElevenLabs no devolvió datos de alineación.");
  }

  const {
    characters,
    character_start_times_seconds: startTimes,
    character_end_times_seconds: endTimes,
  } = alignment;

  if (!Array.isArray(characters) || characters.length === 0) {
    throw new Error("La alineación de ElevenLabs no contiene caracteres.");
  }

  if (!Array.isArray(startTimes) || !Array.isArray(endTimes)) {
    throw new Error("La alineación de ElevenLabs no contiene tiempos válidos.");
  }

  if (
    characters.length !== startTimes.length ||
    characters.length !== endTimes.length
  ) {
    throw new Error("Los caracteres y tiempos de ElevenLabs no coinciden.");
  }

  for (let index = 0; index < characters.length; index += 1) {
    if (
      typeof characters[index] !== "string" ||
      !Number.isFinite(startTimes[index]) ||
      !Number.isFinite(endTimes[index])
    ) {
      throw new Error(
        "La alineación de ElevenLabs contiene valores inválidos.",
      );
    }

    if (index > 0 && startTimes[index] < startTimes[index - 1]) {
      throw new Error("Los tiempos de ElevenLabs no están ordenados.");
    }
  }

  return { characters, startTimes, endTimes };
}

function getCharacterEndTimes(startTimes, endTimes) {
  const durationLikeValues = endTimes.reduce((count, endTime, index) => {
    return count + (endTime < startTimes[index] ? 1 : 0);
  }, 0);
  const usesDurations = durationLikeValues > endTimes.length / 2;

  return endTimes.map((endTime, index) => {
    const absoluteEndTime = usesDurations
      ? startTimes[index] + endTime
      : endTime;

    if (absoluteEndTime < startTimes[index]) {
      throw new Error("ElevenLabs devolvió un tiempo final inválido.");
    }

    return absoluteEndTime;
  });
}

export function alignmentToCaptions(alignment) {
  const { characters, startTimes, endTimes } = assertAlignment(alignment);
  const absoluteEndTimes = getCharacterEndTimes(startTimes, endTimes);
  const words = [];
  let currentWord = null;

  const flushWord = () => {
    if (!currentWord) {
      return;
    }

    words.push(currentWord);
    currentWord = null;
  };

  characters.forEach((character, index) => {
    if (/\s/u.test(character)) {
      flushWord();
      return;
    }

    if (!currentWord) {
      currentWord = {
        text: character,
        startSeconds: startTimes[index],
        endSeconds: absoluteEndTimes[index],
      };
      return;
    }

    currentWord.text += character;
    currentWord.endSeconds = absoluteEndTimes[index];
  });
  flushWord();

  if (words.length === 0) {
    throw new Error("La alineación de ElevenLabs no contiene palabras.");
  }

  return words.map((word, index) => {
    const startMs = Math.round(word.startSeconds * 1000);
    const nextWord = words[index + 1];
    const naturalEndMs = Math.round(word.endSeconds * 1000);
    const endMs = nextWord
      ? Math.round(nextWord.startSeconds * 1000)
      : naturalEndMs;

    return {
      text: `${index === 0 ? "" : " "}${word.text}`,
      startMs,
      endMs: Math.max(startMs + 1, endMs),
      timestampMs: startMs,
      confidence: null,
    };
  });
}

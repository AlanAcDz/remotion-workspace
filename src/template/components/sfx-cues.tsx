import { Audio } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import type { Sfx } from "../schema";

interface SfxCuesProps {
  cues: Sfx[];
}

/**
 * Sounds attached to on-screen events. Rendered inside the scene that owns
 * them, so each cue inherits that scene's clock — retime the beat and the
 * sound follows it.
 */
export function SfxCues({ cues }: SfxCuesProps) {
  const { fps } = useVideoConfig();

  return (
    <>
      {cues.map((cue) => {
        const label = cue.sound.split("/").pop() ?? cue.sound;

        return (
          <Sequence
            key={`${cue.sound}-${cue.at}`}
            name={`SFX ${label}`}
            from={Math.round(cue.at * fps)}
          >
            {/* Callback form: a bare number would be read as a per-frame
                value by Remotion's volume lint rule. */}
            <Audio
              name={label}
              src={staticFile(cue.sound)}
              volume={() => cue.volume}
            />
          </Sequence>
        );
      })}
    </>
  );
}

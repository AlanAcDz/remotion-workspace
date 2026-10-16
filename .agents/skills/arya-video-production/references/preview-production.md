# Preview production

Run this phase only after the parent skill has confirmed the gates in its phase table — `Clips listos` (or a resumed `En edición`) with `Claims revisados` checked for a new edit, or an explicitly requested re-edit — and has set `Estado` to `En edición`.

The same reference covers re-edits. On a re-edit, scope the work to what the user asked to change and reuse every artifact that is still correct; the steps below still describe how each artifact is produced and verified.

## 1. Establish local inputs

1. Inspect the repository, current worktree, `src/template/README.md`, package scripts, and any existing artifacts for this `Video ID` before editing.
2. Read the [`remotion-best-practices`](../../remotion-best-practices/SKILL.md) router and follow the relevant creation, markup, multimedia, caption, and render branches before changing Remotion code.
3. Read the record's `Notas de edición` and claims notes as constraints, not background. A withdrawn or qualified claim tells you what the edit must not show; an editing note often dictates what the first second has to be.

## 2. Ingest and verify the media

The record reached `Clips listos` because the capture step already produced its media: app screen recordings (from Alan's iPhone or the iOS Simulator) and, for `Historia de Arya`, photos or videos of Arya. This phase reads them; it does not record them.

1. Locate the media from `Ruta de clips` or the record body. If neither names a location, ask where they are instead of guessing.
2. Create `public/videos/arya/<video-slug>/` without deleting or replacing existing media. Transcode each recording into it as H.264 mp4 at a constant 30 fps, and convert photos to JPEG (HEIC included), with ordered, zero-padded, descriptive names. Leave the source files untouched: the repo copy is a derivative, not a move. Both iPhone `.mov` files and simulator captures are variable frame rate, and a simulator take stops growing when the screen goes still, so its final state may be a single frame: hold the last frame (e.g. `tpad=stop_mode=clone`) for as long as the beat needs it.
3. Probe every file for readable media, dimensions, frame rate, and duration. Recordings belonging to one video should share a geometry — a mismatch means crop windows will not carry across them.
4. Inspect frames across the full length of every recording, not only its opening. A labelled contact sheet at 1 fps is the cheapest way to read a take: confirm the expected screens, the actions the plan calls for, English UI, demo data, and a clean status bar with no personal notifications.
5. Record the source landmarks while you have them on screen — the second each action happens, and the source pixel rows each UI region occupies. Every beat's `trimBefore` and crop window is derived from those two numbers, so measure once and write them into the props module's header comment.
6. Check each numbered capture instruction, and the parent skill's health and product guardrails, against what the media actually shows. Report a mismatch instead of inventing missing data, and carry every unresolved mismatch into the Notion handoff so the human review gate sees it.

If a recording is missing or unusable, stop and report it. Recording belongs to the `UI por grabar` step. Record a clip yourself only when the user explicitly asks, with the seeded-simulator toolkit in `scripts/arya/capture/` (read its README first), matching the existing clips' device and geometry.

## 3. Generate the voiceover

The repository command owns each pinned voice, model, output format, and generation settings in `scripts/arya/voice-config.mjs`. Do not duplicate or override those values here. Pick the preset by `Pilar`:

| `Pilar` | Command |
| --- | --- |
| `Problema y demo`, `Respuesta breve` | `pnpm arya:voice` (fixed English narrator) |
| `Historia de Arya` | `pnpm arya:voice --brand arya-story` (Alan's cloned voice) |

If the command rejects `--brand arya-story`, the clone has not been added to the config yet: stop and report it, unless the record body explicitly approves the narrator voice for this story video.

1. Copy the final approved script exactly from the Notion body into a securely created temporary UTF-8 text file. The Notion page remains the source of truth; do not add a permanent duplicate script file.
2. Verify that `.env` defines `ELEVENLABS_API_KEY` without revealing its value.
3. Run the no-cost validation first, with the preset from the table:

   ```bash
   pnpm arya:voice --slug <video-slug> --script <temporary-script-path> --dry-run
   ```

4. Resolve every validation error before making the paid request. Then run exactly one generation request with the same arguments minus `--dry-run`.
5. Verify the MP3 is readable and that the caption JSON has aligned words spanning the narration. Compare the generated narration text with the approved script.
6. Remove the temporary script after successful verification. Do not expose the voice response, headers, or credentials in logs.

If voice files already exist, inspect them and their timestamps. Reuse them only when they belong to the same approved script. Never use `--force` without explicit user approval.

## 4. Assemble the Remotion composition

1. Build on the shared PosDemo template with `theme: "arya"`. It supplies Poppins, the Arya palette, the caption system, SFX, music ducking, and the CTA treatment; read `src/template/README.md` for layouts and framing.
2. Create a focused props module at `src/videos/<video-slug>.props.ts` and validate it through `posDemoSchema`. Register it inside an `arya` `<Folder>` in `src/Root.tsx` (create the folder beside `punto-listo` the first time) with an ID of `Arya` plus the PascalCase slug words after the date, e.g. `AryaDidIGiveIt`.
3. Map the ordered media to the numbered capture plan. Derive beat boundaries from the ElevenLabs alignment and keep visible actions synchronized with their narration.
4. Frame every pane explicitly with `uiWindow(source, topPx)` — photos included. A pane without `frame` is stretched to its box. Photos in story videos get a slow push-in with `zoomTo`.
5. Use the exact approved hook, script, and CTA. On-screen summaries may be shortened for legibility only when their meaning is unchanged. The CTA logo is `videos/arya/logo.png`.
6. Music: use the Arya bed from `MUSIC` in `src/template/schema.ts` when one is defined. Until Alan approves a track, omit `music` and say so in the handoff.
7. Arya's personality is calm and reassuring: keep SFX sparse and soft, and keep the vertical format, frame rate, safe areas, and transition style of the template unless the approved record requires a supported variation.
8. Do not bake credentials, absolute machine paths, Notion IDs, or production-only data into the composition.

## 5. Verify and render the preview

Run the repository checks plus focused media QA:

1. `pnpm lint`
2. `pnpm test:punto-listo` (it covers the voice generator both brands share)
3. `npx remotion compositions src/index.ts`
4. Render and inspect stills at the hook, each beat transition, important UI action, and CTA.
5. Render the complete review file as H.264/AAC at `out/arya/<video-slug>/preview.mp4`. Use review-quality compression such as CRF 28.
6. Probe the rendered file. Confirm 1080×1920 at 30 fps, an audio stream, expected duration, synchronized voice and UI, legible captions, correct CTA, subordinate music if present, and intentional SFX.
7. Watch or visually sample the entire preview closely enough to catch blank frames, frozen UI, clipped or distorted media, bad transitions, and audio problems.

Do not advance Notion when any required check fails.

## 6. Hand off for human review

After successful verification:

1. Update `Ruta de clips` and the `## Producción de video` page section according to the parent skill's Notion write contract.
2. Upload or link the preview only when the connector and file size support it; always record the repo-relative preview path.
3. Record every mismatch found in step 2.6, the voice preset used, and any missing music in that section, marked clearly enough that Alan sees it before he checks `Video aprobado`. A preview that contradicts its own narration must say so in writing.
4. Move `Estado` from `En edición` to `Render para revisión`.
5. Refetch and verify the Notion record: paths, attachment or URL, `Estado`, and that `Claims revisados` and `Video aprobado` are untouched.
6. Stop. Tell the user where the preview is and that final rendering requires Alan to review it and check `Video aprobado` in Notion.

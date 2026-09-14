# Preview production

Run this phase only after the parent skill has confirmed the gates in its phase table — `Clips listos` (or a resumed `En edición`) with `Claims revisados` checked for a new edit, or an explicitly requested re-edit — and has set `Estado` to `En edición`.

The same reference covers re-edits. On a re-edit, scope the work to what the user asked to change and reuse every artifact that is still correct; the steps below still describe how each artifact is produced and verified.

## 1. Establish local inputs

1. Inspect the repository, current worktree, existing Punto Listo template, package scripts, and any artifacts for this `Video ID` before editing.
2. Read the existing [`remotion-best-practices`](../../remotion-best-practices/SKILL.md) router and follow the relevant creation, markup, multimedia, caption, and render branches before changing Remotion code.
3. Read the record's `Notas de edición` and `Revisión de claims` as constraints, not background. A withdrawn or qualified claim tells you what the edit must not show; an editing note often dictates what the first second has to be.

## 2. Ingest and verify the clips

The record reached `Clips listos` because the capture step already produced the clips. This phase reads them; it does not record them.

1. Locate the clips for this `Video ID`. They usually arrive as `.webm` files under the Punto Listo repo's `artifacts/clips/`, named for the video they belong to. If nothing there matches, ask where they are instead of guessing.
2. Create `public/videos/punto-listo/<video-slug>/` without deleting or replacing existing media, and transcode each clip into it as H.264 mp4 with ordered, zero-padded, descriptive names such as `01-cobro-rapido.mp4`. Leave the source files untouched: the repo copy is a derivative, not a move.
3. Probe every clip for readable video, dimensions, frame rate, and duration. Clips belonging to one video should share a geometry — a mismatch means crop windows will not carry across them.
4. Inspect frames across the full length of every clip, not only its opening. A labelled contact sheet at 1 fps is the cheapest way to read a take: confirm the expected screens, the actions the plan calls for, and the absence of accidental overlays or sensitive data.
5. Record the source landmarks while you have them on screen — the second each action happens, and the source pixel rows each UI region occupies. Every beat's `trimBefore` and crop window is derived from those two numbers, so measure once and write them into the props module's header comment.
6. Check each numbered capture instruction against what the clips actually show. Report a mismatch instead of inventing missing data, and carry every unresolved mismatch into the Notion handoff so the human review gate sees it.

If a clip is missing or unusable, stop and report it. Recording the flow belongs to the `UI por grabar` step, not to this skill. Re-record a single clip only when the user explicitly asks: use `agent-browser` against the seeded demo (load `agent-browser skills get core` first, and resolve the demo URL from Notion or repository configuration rather than guessing it or substituting production), matching the existing clips' viewport and geometry exactly.

## 3. Generate the standard voiceover

The repository command owns the pinned Punto Listo voice, model, output format, and generation settings. Do not duplicate or override those values in the skill.

1. Copy the final approved script exactly from the Notion body into a securely created temporary UTF-8 text file. The Notion page remains the source of truth; do not add a permanent duplicate script file.
2. Verify that `.env` defines `ELEVENLABS_API_KEY` without revealing its value.
3. Run the no-cost validation first:

   ```bash
   pnpm punto-listo:voice --slug <video-slug> --script <temporary-script-path> --dry-run
   ```

4. Resolve every validation error before making the paid request. Then run exactly one generation request:

   ```bash
   pnpm punto-listo:voice --slug <video-slug> --script <temporary-script-path>
   ```

5. Verify the MP3 is readable and that the caption JSON has aligned words spanning the narration. Compare the generated narration text with the approved script.
6. Remove the temporary script after successful verification. Do not expose the voice response, headers, or credentials in logs.

If voice files already exist, inspect them and their timestamps. Reuse them only when they belong to the same approved script. Never use `--force` without explicit user approval.

## 4. Assemble the Remotion composition

1. Use the current Punto Listo composition, schema, layout, background music, SFX, caption system, and CTA treatment as the reusable template.
2. Create a focused props module under `src/videos/<video-slug>.props.ts` and validate it through the existing schema. Register a composition in `src/Root.tsx` using an ID derived consistently from `Video ID`.
3. Map the ordered UI clips to the numbered capture plan. Derive beat boundaries from the ElevenLabs alignment and keep visible actions synchronized with their narration.
4. Use the exact approved hook, script, and CTA. On-screen summaries may be shortened for legibility only when their meaning is unchanged.
5. Keep the existing vertical format, frame rate, brand layout, music bed, SFX vocabulary, audio ducking, safe areas, and transition style unless the approved record explicitly requires a supported variation.
6. Do not bake credentials, absolute machine paths, Notion IDs, or production-only data into the composition.

## 5. Verify and render the preview

Run the repository checks plus focused media QA:

1. `pnpm lint`
2. `pnpm test:punto-listo`
3. `npx remotion compositions src/index.ts`
4. Render and inspect stills at the hook, each clip transition, important UI action, and CTA.
5. Render the complete review file as H.264/AAC at `out/punto-listo/<video-slug>/preview.mp4`. Use review-quality compression such as CRF 28 unless the repository defines a different preview preset.
6. Probe the rendered file. Confirm 1080×1920 at 30 fps unless the approved record requires otherwise, an audio stream, expected duration, synchronized voice and UI, legible captions, correct CTA, audible but subordinate music, and intentional SFX.
7. Watch or visually sample the entire preview closely enough to catch blank frames, frozen UI, clipped text, bad transitions, and audio problems.

Do not advance Notion when any required check fails.

## 6. Hand off for human review

After successful verification:

1. Update `Ruta de clips` and the `## Producción de video` page section according to the parent skill's Notion write contract.
2. Upload or link the preview only when the connector and file size support it; always record the repo-relative preview path.
3. Record every mismatch found in step 2.6 in that section, marked clearly enough that Alan sees it before he checks `Video aprobado`. A preview that contradicts its own narration must say so in writing.
4. Move `Estado` from `En edición` to `Render para revisión`.
5. Refetch and verify the Notion record: paths, attachment or URL, `Estado`, and that `Claims revisados` and `Video aprobado` are untouched.
6. Stop. Tell the user where the preview is and that final rendering requires Alan to review it and check `Video aprobado` in Notion.

Do not set `Video aprobado`, render the final file, or begin distribution in this phase.


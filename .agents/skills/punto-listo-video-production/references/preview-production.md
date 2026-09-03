# Preview production

Run this phase only after the parent skill has confirmed `Aprobado para grabar` and `Claims revisados`.

## 1. Establish local inputs

1. Inspect the repository, current worktree, existing Punto Listo template, package scripts, and any artifacts for this `Video ID` before editing.
2. Read the existing [`remotion-best-practices`](../../remotion-best-practices/SKILL.md) router and follow the relevant creation, markup, multimedia, caption, and render branches before changing Remotion code.
3. Resolve the seeded demo URL from the Notion page, repository configuration, or an already running local service. Do not guess a URL or substitute a production environment. If the seeded demo cannot be found or reached, stop without changing Notion.
4. Confirm that every numbered capture instruction is executable in the seeded data. Report a mismatch instead of inventing missing data or actions.

## 2. Record the UI clips

Use `agent-browser` for deterministic local browser recording.

1. Load its operating instructions with `agent-browser skills get core` before browser commands.
2. Create an isolated browser session named for the video slug and choose the viewport required by the capture plan and vertical template.
3. Create `public/videos/punto-listo/<video-slug>/` without deleting or replacing existing media.
4. Reset the demo to its known seeded state before each independent capture when the plan depends on starting state.
5. Use snapshots and semantic element references to perform only the listed interactions. Record one ordered clip per numbered step unless the plan explicitly requires a continuous take.
6. Stop each recording immediately after its intended action and save it with a zero-padded descriptive filename.
7. Probe every clip for readable video, dimensions, frame rate, and duration. Inspect representative frames to confirm the correct screen, action, cursor or touch state, and absence of accidental overlays or sensitive data.

If browser automation is unavailable or the flow cannot be reproduced reliably, stop before voice generation and Notion writes.

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
3. Set `Estado` to `Render para revisión`.
4. Refetch and verify the Notion record.
5. Stop. Tell the user where the preview is and that final rendering requires Alan to review it and check `Video aprobado` in Notion.

Do not set `Video aprobado`, render the final file, or begin distribution in this phase.


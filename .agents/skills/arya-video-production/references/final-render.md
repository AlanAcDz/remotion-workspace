# Final render

Run this phase only after the parent skill has confirmed `Render para revisión` and `Video aprobado`.

## 1. Revalidate the approved artifact

1. Read the [`remotion-render`](../../remotion-render/SKILL.md) instructions before rendering.
2. Inspect the current worktree and the Notion `## Producción de video` section. Resolve the exact composition ID, media directory, voice files, captions, and preview for this `Video ID`.
3. Verify that the preview artifacts are readable and that the composition still matches the approved script, CTA, capture plan, and preview. Creative content stays as approved unless the user explicitly requests a new review cycle.
4. If artifacts are missing, mismatched, or changed since approval, stop without changing Notion and explain what must be reviewed again.

## 2. Render and verify the final

1. Run `pnpm lint`, `pnpm test:punto-listo`, and `npx remotion compositions src/index.ts`.
2. Render the approved composition as H.264/AAC to `out/arya/<video-slug>/final.mp4` with production-quality compression such as CRF 18.
3. Probe the result and confirm 1080×1920, 30 fps, an audio stream, the expected duration, and a clean decode.
4. Inspect representative frames and the full audio/video result closely enough to confirm it is materially the approved preview at final quality: correct UI, synchronized narration, legible captions, exact CTA, balanced music, and intentional SFX.

Do not advance Notion when any required check fails.

## 3. Complete the production handoff

After the final render passes verification:

1. Update only the `## Producción de video` section with the repo-relative final path, composition ID, render date, and successful verification result.
2. Upload or link the final only when supported. Set `Render / preview` only if the resulting value is an accessible URL.
3. Preserve the already checked `Video aprobado` property and set `Estado` to `Aprobado para publicar`.
4. Refetch and verify the final path or attachment and state.
5. Report the final artifact location and stop. Distribution starts from `Aprobado para publicar` in a separate workflow.

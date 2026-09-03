---
name: punto-listo-video-production
description: Produce or finalize a Punto Listo marketing video from its approved Notion Videos record. Use when asked to record the prescribed UI flow, generate the standard ElevenLabs voiceover, assemble and render a review video, or create the final render after Alan approves it. Requires the Notion MCP and the local seeded Punto Listo demo; excludes Postiz, scheduling, and publishing.
---

# Punto Listo video production

Turn one approved Notion record into verified local video artifacts and the corresponding Notion state transition. Treat Notion as the source of truth for the script, claims, CTA, platforms, and numbered capture plan.

## Resolve the record and phase

Use the Notion MCP for all Notion reads and writes.

- Videos database: `https://www.notion.so/3d0e25f150d181c8b8b4f4e01b04dd10`
- Videos data source: `collection://3d0e25f1-50d1-811d-9f92-000b5ed7d30f`

1. Use a supplied Notion URL or page ID when available. Otherwise, query the Videos data source by the exact `Video ID` or `Nombre`. Ask the user to choose if more than one record matches.
2. Fetch both the page properties and the complete page body. The body contains the approved script and detailed numbered UI capture plan; a database property may contain only a summary.
3. Select exactly one phase:
   - **Preview production:** `Estado` is `Aprobado para grabar` and `Claims revisados` is checked.
   - **Final render:** `Estado` is `Render para revisión` and `Video aprobado` is checked.
4. For preview production, require a non-empty `Video ID`, final script, exact CTA, target platforms, and numbered UI capture plan. For final rendering, require the existing composition and verified preview artifacts.
5. If no phase matches, stop without recording, generating paid audio, rendering, or mutating Notion. Report the exact missing gate.

Never check `Claims revisados` or `Video aprobado` on the user's behalf. Those are human approval gates.

## Run the selected phase

- For preview production, read and follow [references/preview-production.md](references/preview-production.md) completely.
- For final rendering, read and follow [references/final-render.md](references/final-render.md) completely.

Do not execute both phases in one invocation. After producing the preview, stop and wait for Alan to review it and check `Video aprobado` in Notion.

## Shared production contract

- Preserve the approved message verbatim in meaning. Do not add claims, features, promises, or UI actions that are absent from the approved Notion record.
- Follow the numbered capture plan against the seeded local demo exactly. Do not improvise a product flow.
- Derive a filesystem-safe lowercase dash-separated slug from `Video ID`. Keep `Video ID` itself unchanged in Notion.
- Store UI recordings under `public/videos/punto-listo/<video-slug>/` with ordered descriptive names such as `01-open-cash-cut.webm`.
- Store voice artifacts at `public/audio/<video-slug>.mp3` and `public/captions/<video-slug>.json`.
- Store renders at `out/punto-listo/<video-slug>/preview.mp4` and `out/punto-listo/<video-slug>/final.mp4`.
- Never overwrite a clip, voice take, composition, or render whose provenance is uncertain. Inspect and reuse verified artifacts; otherwise ask before replacing them. In particular, never pass `--force` to the ElevenLabs command without explicit approval because it spends credits on a replacement take.
- Keep credentials in `.env`. Check only that the expected variable exists; never print, copy, log, or place a key in source, commands, Notion, or the final response.
- Preserve unrelated worktree changes. Do not commit unless the user explicitly asks.

## Notion write contract

Use these exact database properties:

- `Video ID`: text
- `Estado`: select
- `Claims revisados`: checkbox
- `Video aprobado`: checkbox
- `Hook`: text
- `CTA`: text
- `Plan de captura UI`: text
- `Plataformas`: multi-select
- `Ruta de clips`: text
- `Render / preview`: URL

Only write after the phase artifact passes its required checks.

1. Update `Ruta de clips` with the repo-relative clip directory during preview production.
2. Maintain a `## Producción de video` section in the page body. Append it if absent; if present, update only that section. Record repo-relative artifact paths, composition ID, render date, and verification result without modifying the approved brief or script.
3. `Render / preview` accepts a URL, not a filesystem path. Set it only when an accessible URL exists. Otherwise, keep the local render path in `## Producción de video`.
4. When useful and the file is within Notion's upload limit, upload the render through the Notion MCP and embed the returned attachment in the production section. Do not mistake an embedded attachment for a URL property value.
5. Refetch the page after every write and verify the paths, attachment or URL, and final state.

Use `__YES__` and `__NO__` only if the active Notion tool represents checkbox values that way. Fetch the database schema before writing if the connector response is ambiguous.

## Hard boundary

This workflow ends at `Aprobado para publicar`. Do not create Postiz drafts, schedule content, publish it, or call another distribution system. Distribution is a separate workflow after human approval.


---
name: arya-video-production
description: Edit or finalize an Arya: Pill Reminder short video from its Notion Videos record once its clips or photos exist. Use when asked to cut an Arya video, generate its English ElevenLabs voiceover, assemble and render a review video, re-edit one that came back from review, or create the final render after Alan approves it. Requires the Notion MCP; excludes recording clips, Postiz, scheduling, and publishing.
---

# Arya video production

Turn one approved Notion record into verified local video artifacts and the corresponding Notion state transition. Treat Notion as the source of truth for the script, claims, CTA, platforms, and numbered capture plan.

Arya is a separate brand from Punto Listo: different Notion database, voice, theme, and folders. Every path, command, and ID below is Arya's own.

## The `Estado` ladder

`Estado` advances in one direction. This skill owns only the middle of it:

| Estado | Meaning | Owner |
| --- | --- | --- |
| `Idea` | — | planning |
| `Guion propuesto` | — | scripting |
| `En revisión` | — | human review |
| `Aprobado para grabar` | script approved, **no clips yet** | capture workflow |
| `UI por grabar` | capture queued, **no clips yet** | capture workflow |
| `Clips listos` | clips and photos exist and are ready to cut | **this skill's entry point** |
| `En edición` | this skill is working on it | **this skill sets it** |
| `Render para revisión` | preview awaits Alan | **this skill sets it**, then human review |
| `Aprobado para publicar` | final render done | **this skill sets it**, then hands off |
| `Draft en Postiz` | — | distribution |
| `Publicado` | — | distribution |
| `Medido / archivado` | — | measurement |

A record at `Aprobado para grabar` or `UI por grabar` has no clips, so there is nothing to edit. Say the clips are missing, name the state, and stop.

## Resolve the record and phase

Use the Notion MCP for all Notion reads and writes.

- Videos database: `https://www.notion.so/3f9e25f150d1814ab015d0a45fba5d1c`
- Videos data source: `collection://3f9e25f1-50d1-816c-8d2c-000b081090fc`
- Product truth for claims: `/Users/alan/Documents/Dev_Work/Ideas/arya-tracker/docs/features-summary.md` and `PRODUCT.md`
- Guide and blog sources: `/Users/alan/Documents/Dev_Work/Ideas/arya-landing/src/content/`

1. Use a supplied Notion URL or page ID when available. Otherwise, query the Videos data source by the exact `Video ID` or `Nombre`. Ask the user to choose if more than one record matches.
2. Fetch both the page properties and the complete page body. The body holds the approved script, the numbered capture plan, and the claims notes; a database property may contain only a summary.
3. Select exactly one phase from `Estado`, `Video aprobado`, and what the user actually asked for:

   | Phase | `Estado` | `Video aprobado` | Also requires |
   | --- | --- | --- | --- |
   | **Preview production** | `Clips listos` or `En edición` | unchecked | `Claims revisados` checked |
   | **Re-edit** | `Render para revisión` or `En edición` | unchecked | the user explicitly asked to change, fix, tweak, or re-cut this video |
   | **Final render** | `Render para revisión` | checked | — |

   `En edición` means a previous run stopped part-way. Re-enter the phase the user is asking for, and reuse the artifacts that previous run already verified instead of regenerating them — above all the paid voice take.

4. Two situations resemble a phase but are not one. Stop and ask rather than guess:
   - `Render para revisión`, `Video aprobado` unchecked, and no explicit re-edit request. The record is already waiting on Alan. Re-cutting it unasked discards the take he is reviewing.
   - `Render para revisión`, `Video aprobado` checked, and a re-edit request. That approval was given against the current preview. Ask whether to uncheck `Video aprobado` and re-edit, or to final render what was approved.
5. For preview production and re-edits, require a non-empty `Video ID`, final script, exact CTA, target platforms, numbered capture plan, and clips or photos that exist on disk. For final rendering, require the existing composition and verified preview artifacts.
6. If no phase matches, stop without ingesting media, generating paid audio, rendering, or mutating Notion. Report the exact missing gate and the record's current `Estado`.

Never check `Claims revisados` or `Video aprobado` on the user's behalf. Those are human approval gates.

## Mark the record as `En edición`

Once a preview production or re-edit phase is selected and step 5's inputs are confirmed present — and before ingesting media, spending ElevenLabs credits, or rendering — set `Estado` to `En edición`. This is the one Notion write allowed before artifacts pass their checks.

If the run then fails, or you stop to ask a question, leave the record at `En edición` and say so in your report. The next run resumes from there.

Skip this write in the final render phase; that phase moves straight from `Render para revisión` to `Aprobado para publicar`.

## Run the selected phase

- For preview production, read and follow [references/preview-production.md](references/preview-production.md) completely.
- For a re-edit, follow the same reference, scoped to what the user asked to change. Reuse every artifact that is still correct — clips, voice take, captions — and re-derive only what the change touches. Re-run the full verification and render a fresh `preview.mp4` regardless of how small the change was.
- For final rendering, read and follow [references/final-render.md](references/final-render.md) completely.

Do not execute both phases in one invocation. After producing the preview, stop and wait for Alan to review it and check `Video aprobado` in Notion.

## Health and product guardrails

Arya videos talk about pet medication, so every claim stays inside these lines. Check the script, on-screen copy, callouts, and the UI the clips show against them, and against the product truth files above:

- General information only. Dose amounts, which medicine to give, and changes to a prescribed schedule are the vet's call; anything medical ends by sending the viewer to their vet.
- Arya is local-first: each phone keeps its own log. Show one person's phone and one person's record; caregiver sharing and sync are outside what the app does.
- Free covers one pet, one active treatment, and five future events. A demo that relies on more, or on refill tracking, says so on screen (e.g. the CTA note "Try Premium free for 3 days").
- Demo data only: a demo pet or Arya herself, no real users' names, photos, or medications, and no personal notifications in the status bar.

A clip or line that crosses one of these lines is a mismatch: report it, and carry it into the Notion handoff.

## Shared production contract

- Preserve the approved message verbatim in meaning. Add no claims, features, promises, or UI actions absent from the approved Notion record.
- Derive a filesystem-safe lowercase dash-separated slug from `Video ID` (`AV-20261020-did-i-give-it` → `av-20261020-did-i-give-it`). Keep `Video ID` itself unchanged in Notion.
- Store media under `public/videos/arya/<video-slug>/` with ordered descriptive names such as `01-today-screen.mp4` or `02-arya-sick.jpg`. Shared brand media lives in `public/videos/arya/` (`logo.png`, `photos/`).
- Store voice artifacts at `public/audio/<video-slug>.mp3` and `public/captions/<video-slug>.json`.
- Store renders at `out/arya/<video-slug>/preview.mp4` and `out/arya/<video-slug>/final.mp4`.
- Never overwrite a clip, voice take, composition, or render whose provenance is uncertain. Inspect and reuse verified artifacts; otherwise ask before replacing them. In particular, never pass `--force` to the ElevenLabs command without explicit approval because it spends credits on a replacement take.
- Keep credentials in `.env`. Check only that the expected variable exists; never print, copy, log, or place a key in source, commands, Notion, or the final response.
- Preserve unrelated worktree changes, and leave Punto Listo's compositions, props, and media untouched. Do not commit unless the user explicitly asks.

## Notion write contract

Use these exact database properties:

- `Video ID`: text
- `Estado`: select
- `Claims revisados`: checkbox
- `Video aprobado`: checkbox
- `Pilar`: select (`Historia de Arya`, `Problema y demo`, `Respuesta breve`)
- `Hook`: text
- `CTA`: text
- `Plan de captura UI`: text
- `Plataformas`: multi-select
- `Ruta de clips`: text
- `Render / preview`: URL

Only write after the phase artifact passes its required checks. The single exception is the `En edición` transition above.

1. Update `Ruta de clips` with the repo-relative media directory during preview production and re-edits.
2. Maintain a `## Producción de video` section in the page body. Append it if absent; if present, update only that section. Record repo-relative artifact paths, composition ID, voice preset, render date, and verification result without modifying the approved brief or script.
3. `Render / preview` accepts a URL, not a filesystem path. Set it only when an accessible URL exists. Otherwise, keep the local render path in `## Producción de video`.
4. When useful and the file is within Notion's upload limit, upload the render through the Notion MCP and embed the returned attachment in the production section. An embedded attachment is not a URL property value.
5. Refetch the page after every write and verify the paths, attachment or URL, and final state.

## Hard boundary

This workflow ends at `Aprobado para publicar`. Postiz drafts, scheduling, publishing, and the TikTok AI-content label belong to the distribution workflow after human approval.

# Arya store-video clips

Real screen recordings of the Arya dev build with the store-screenshot demo data
(`arya-tracker/store-screenshots/seed.ts`), recorded 2026-11-03. Touch indicators are
hidden, so add your own tap ripples where noted.

- `ios/` is an iPhone 18 Pro simulator: 1206×2622, variable frame rate (up to 60 fps).
- `android/` is a Pixel 6 Pro emulator: 720×1280 with black pillarbox bars. The real
  screen is about 591×1280, centered; crop the bars. Also variable frame rate.
- Variable frame rate means frames are written only when the screen changes. Transcode
  to constant 30 fps and hold the last frame.
- Times below are approximate (±0.5 s). Confirm them on a contact sheet
  (`agent-device record contact-sheet <clip>` or ffmpeg) before syncing to beats.

## Story clips (both platforms, both languages)

| Clip | What happens | iOS en | iOS es | Android en | Android es |
|---|---|---|---|---|---|
| `01-today-dose` | Today list, Magic Drops for Maya due now. Tap the row, the sheet opens, tap "Mark as taken" / "Marcar como tomada". Row gets a check, "Dose recorded as taken" toast, 5 → 4 pending | tap 2.5 s, sheet 3.5 s, taken 10.5 s, toast 11.4 s | tap 2.8 s, sheet 3.5 s, taken 6.3 s, toast 7.3 s | tap 3.5 s, sheet 4.0 s, taken 6.7 s, toast 8.0 s | similar to en: tap ~3.5 s, taken ~6.5 s |
| `03-pets` | Tab switch Today → Pets, then two slow scrolls through photo cards (Arya, Isaias, Kiss, Maya, …) | tab 2.6 s, scrolls 5 s and 9 s | tab ~2.5 s, scrolls ~5 s and ~9 s | tab ~2.5 s, scrolls ~5 s and ~10 s | tab ~2.5 s, scrolls ~6 s and ~18 s (long idle, trim) |
| `04-calendar` | Pets → Calendar tab (today has 3 events). Tap day 7, 12, 16, 21; each shows its event (Bath & grooming, Rabies vaccine, Deworming, Annual checkup) | tab 2.0 s, days ~4.1 / 6.2 / 8.3 / 10.3 s | similar | similar | days ~5 / 8 / 10.8 / 12.4 s |
| `05-frequency` | Edit Medication, frequency step (Weekly). Toggle Mon, Wed, Fri on, then Sun off; the preview calendar below fills and empties in sync, which suits the beat sequencer | toggles ~2.5 / 4.5 / 6.5 / 8.5 s | similar | toggles ~1.9 / 3.3 / 4.7 / 6.0 s | similar |
| `07-sleep` | Settings, tap Sleep Schedule, sheet: wake 8:00, sleep 22:00 | tap 2.5 s, sheet settled 2.9 s | similar | tap 2.3 s, settled 2.8 s. Android shows "8:00 AM / 10:00 PM" (known 12-hour bug, app issue #31) | same |

## Store-specific beat 6

| Clip | What happens | Timing |
|---|---|---|
| `ios/*/06-widget` | Home Screen with the medium Arya widget ("3 doses pending", next dose Maya 20:10 + "Take"). Tap Take, the app opens and records it ("Recording the dose…" → "Dose recorded"), 3 → 2 pending | tap 2.0 s, app 3.0 s, recorded 3.6 s |
| `android/*/06-refill` | Today, tap the Paw Boost low-stock alert (2 doses left). Refill sheet, type 30, Confirm Refill. "Medication refilled successfully" toast; the low-stock alert disappears | en: sheet 3.0 s, "30" ~10 s (idle before it, trim), confirm ~15 s, toast 17.4 s. es: similar, confirm ~19 s, toast ~20 s |

## Watch out for
- **Widget clip clock:** the widget clip's status bar reads 20:21 / 20:23 (evening), while the other iOS clips read 9:14 / 9:18. This fits the afternoon-to-dusk beat. After the tap, the app's "Later today" list shows doses at 22:20 and 23:20, which is past the 22:00 bedtime the sleep beat advertises. Cut by about 3.8 s, or keep the zoom on the toast and summary so those times aren't readable.
- **Calendar flashes:** between day taps the calendar briefly shows the empty-state illustration. Cut around those frames.
- **Long idle stretches:** `ios/en/01` (sheet open 3.5–10.5 s), `android/*/06-refill`, and `android/es/03-pets` all hold still for long stretches; trim them.
- **Missing iOS refill:** there's no iOS refill clip. The iOS number pad can't be dismissed, so the App Store cut uses the widget instead.
- **No notification footage:** there's no clip of a real notification. Beat 1's banner is the overlay ported from `compose.ts`, as briefed.

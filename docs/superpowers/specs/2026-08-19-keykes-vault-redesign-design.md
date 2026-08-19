# KeyKES "The Vault" — UI Redesign Spec

Date: 2026-08-19
Status: approved (direction + scope confirmed by user)
Backup: git commits `2021bdf` (original workspace state) and `8b0bbeb` (full app assembled)

## Goal
Redesign keykes.com (3in1 Key-Emoji-Spinner PWA) into a dark, premium "vault" look with
per-mode neon accents. Fix broken Thai copy, remove leaked API key from HTML, clean
manifest, bump service-worker cache.

## Direction (approved): The Vault — dark premium
- Dark-first only (no light mode). Deep ink background `#0a0e14` with a faint radial
  glow + subtle grid texture (pure CSS gradients, no images).
- Glass panels: `rgba(255,255,255,0.04)` fill, 1px `rgba(255,255,255,0.08)` border,
  backdrop blur, 16–20px radius.
- Typography: system sans for UI; monospace stack for textareas (cipher text),
  status bar, and code chips.
- Per-mode accent via `body[data-mode]` + CSS custom property `--accent`:
  - no mode: neutral slate `#8b96a8`
  - `xor` (Key Translator): cyan `#22d3ee`
  - `emoji` (Emoji Code): amber `#fbbf24`
  - `wordspinner` (Word Spinner): green `#4ade80`
- Accent drives: active tab, focus rings, transform arrow, inline copy button,
  status dot, links, help hover. Smooth 0.35s transition on mode change.
- Text: white `#f2f5f8`, muted `#8b96a8`.

## Layout (single column, max-width 720px)
1. Header: brand lockup (🔐 + "keykes.com" + "Private text utility · AI copilot") + help button.
2. Mode selector: 3-tab segmented control (icon + title + small description).
   Active tab = soft accent fill + accent border/icon. Stacks full-width under 560px.
3. Keyword row (xor only): key icon + input, accent focus glow.
4. IO section: two labeled panels (INPUT / OUTPUT) with monospace textareas,
   animated transform arrow between them, inline copy button on output panel.
5. Action row (right-aligned): **Swap ⇄** (new) + Clear.
6. Status bar: status dot + "Ready" · "Mode: <label>" (dot uses accent).
7. Support trigger + video link + footer: kept, restyled.

## Behavior changes (script.js)
- Mode select sets `document.body.dataset.mode` (drives accent) — existing logic unchanged.
- New Swap ⇄ button: moves output text into input, clears output, re-runs
  `processCurrentMode()`; toast "🔁 สลับข้อความแล้ว".
- All cipher/decode logic, QR donate flow, help modal, toasts, SW registration: unchanged.

## Fixes (all directions)
- Rewrite all Thai copy with correct vowel/tone-mark ordering (current files have
  mangled combining marks, e.g. "กรุณา" → "กรุณา").
- Remove the `sk-...` API key from the HTML comment (security; key stays in `.env` only).
- `manifest.json`: strict valid JSON (drop `//` comments), dark theme colors,
  name "KeyKES — Private Text Utility".
- `sw.js`: cache bump `v1.8` → `v2.0`, add `promptpay.png` to precache list.
- Merge `index-with-pageagent.html` (PageAgent copilot + manifest link) into a new
  `index.html` with the new layout; delete the old variant file.
- Keep: PageAgent copilot, GA, CNAME (`keykes.com`), `.nojekyll`, icons, promptpay.png.

## Out of scope (YAGNI)
- No light mode, no char/word counter, no confetti, no new cipher modes,
  no backend, no i18n.

## Verification
- Serve workspace locally, open in browser (pinchtab), screenshot.
- Check: all 3 modes switch + accent re-tints, swap works, encode/decode round-trip
  in each mode, help + donate modals, QR generation, no console errors.
- Commit as `feat: ...`.

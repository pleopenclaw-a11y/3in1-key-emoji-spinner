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
  (Implementation note: the transition lives on the concrete properties —
  color/border/box-shadow — NOT on `--accent` itself; see bug note in Verification.)
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
- Thai copy: verified by codepoint dump — source files already contain correctly
  ordered combining marks (the read-tool rendering was misleading). New `index.html`
  reuses the verified-correct strings; no rewrites needed.
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

## Bug found during verification (fixed)
- `transition: --accent 0.35s ease` on `body` was removed: transitioning a
  registered custom property on `body` is a known source of wedged values in
  Chromium. The per-element `transition: color/border-color/box-shadow ...`
  rules already animate the accent shift, so the visual effect is preserved.
- Root cause of the "stuck accent" symptom was actually the **headless
  verification environment**, not the CSS: pinchtab's headless Chrome does not
  advance the CSS animation clock until a frame is produced. Every
  `CSSTransition` (and the infinite `arrowPulse` keyframe) sat at
  `currentTime: 0` with `playState: running`, so computed styles read the
  transition's *start* value forever. Forcing a frame (any `pinchtab
  screenshot`) jumped the clock to wall time, the transitions completed, and
  the accent resolved correctly. **Real browsers produce frames continuously,
  so this never affects end users.** Verification rule of thumb: after a
  mode switch, take a screenshot (or otherwise force a frame) *before*
  reading computed styles, or the values will look "stuck".

## Whole-page mode cue (follow-up)
- The hand-pointer hint icon (`fa-hand-pointer`) now points **down** at the
  mode buttons: `.mode-instruction .fa-hand-pointer { transform: rotate(135deg); }`
  (the glyph aims up-right by default; 135° turns it straight down).
- Selecting a mode now re-tints the **whole page**, not just small accents, so
  the active mode is obvious at a glance:
  - `body` background radial glows are driven by `var(--accent)`
    (neutral gray when no mode is selected).
  - `.container` frame border + outer glow light up in the accent, and a
    `::before` neon line appears along the top edge.
  - `.mode-instruction` bar border + background tint to the accent.
  - `.text-panel textarea` borders pick up a subtle accent tint.
  - `.status-bar strong` (the mode name) is colored with the accent.
  - The instruction line text swaps per mode (e.g. "โหมด Key Translator —
    เข้ารหัส/ถอดรหัสด้วยคีย์เวิรด์"), driven by `updateUI()` in script.js.
- All of it is derived from the single `--accent` custom property set by
  `body[data-mode]`, so it stays in sync with the existing per-mode neon
  system and animates via the same per-element transitions.
- `sw.js` cache bumped `v2.0 → v2.1` so returning PWA users pick up the new
  assets on next load.

## Remove PageAgent AI copilot (follow-up)
- The `page-agent@1.10.0` demo IIFE (jsDelivr) and its chat panel were
  **removed entirely** at the user's request ("เอาออกไปให้หน่อย").
- Removed from `index.html`: the `<script>` tag, the inline panel `<style>`
  block, and the auto-init `<script>` block; subtitle downgraded from
  "Private text utility · AI copilot" → "Private text utility".
- `sw.js` cache bumped `v2.1 → v2.2` for the deploy.
- The app now has **zero** external agent/LLM dependency (the previous
  GATEWAY API key was revoked and is no longer referenced).

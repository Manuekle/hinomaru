# Hinomaru 日の丸 — Design System

**Hinomaru** (日の丸, "circle of the sun") is a minimalist web app for learning Japanese by JLPT level (N5 → N1). It teaches vocabulary, hiragana, katakana, and basic kanji through flashcards, multiple-choice quizzes, and short writing prompts.

The design ethos: **one red circle on white paper**. Every screen should feel like a clean sheet of tenugui cloth — plenty of negative space, a single moment of red, and type that does most of the work.

---

## Product context

- **Audience:** Self-directed adult learners, beginners through intermediate. Expect short sessions (5 min), often on mobile web between other tasks.
- **Platform:** Web only (SvelteKit frontend, Supabase for auth + data). No native apps.
- **Content model:** Levels (N5–N1) → decks (Vocabulary / Hiragana / Katakana / Kanji) → cards (Japanese + romaji + translation ES/EN + example sentence).
- **Modes:** Flashcards (flip), Multiple choice, Type-the-answer.

## Sources used to build this system

The brand was designed from scratch against the uploaded reference boards (no codebase or Figma was provided). Reference images sat in `uploads/` and pointed toward:

- An iOS Japanese keyboard/learner with large hiragana glyph grid and pill segmented control.
- **Oppie** — a minimalist iOS flashcard app: tall white card, single large word in black, circle mark in the corner, bottom bar with Shuffle + 24 free cards counter. This is the closest visual cousin to Hinomaru.
- Two Korean-language learning apps (실력 측정 QUIZ, adjective/형용사 quiz) showing fill-in-the-blank and multiple-choice patterns, soft pastel pill tags, progress bars.
- A Chinese vocabulary quiz with big blue sentence, gray option pills, and a red "Incorrect" footer — useful as a pattern for answer feedback.

No original codebase or Figma links were provided; this system is therefore **originated**, not reconstructed. All color tokens, components, and screens below are designed fresh against the brief.

---

## Index

- `README.md` — this file
- `SKILL.md` — Claude Code compatible skill descriptor
- `colors_and_type.css` — design tokens and semantic classes
- `fonts/README.md` — font substitution notes
- `assets/` — brand marks (logo, wordmark, favicon)
- `preview/` — 20 HTML cards rendered in the Design System tab
- `ui_kits/app/` — interactive web-app UI kit (index.html + JSX screens + primitives)

---

## CONTENT FUNDAMENTALS

**Voice:** calm, encouraging, plain-spoken. The app never performs enthusiasm. No exclamation marks unless a user just completed something; no "Awesome!" or "Let's go!" Never gamified language ("crush your goals"). Closer to a patient tutor than a coach.

**Person:** second person ("you"), direct. "Choose the meaning" not "Let's choose the meaning together."

**Casing:** Sentence case everywhere — buttons, menu items, headings. Never Title Case. Never ALL CAPS except in tiny metadata labels (`N5 · VOCABULARY`). Japanese renders as-is; no forced capitalization of romaji.

**Punctuation:** Periods on full sentences in body copy and example sentences; no periods on UI labels or button copy. A single middle dot (`·`) separates metadata. Em-dash sparingly for pauses.

**Emoji:** none. The brand has a single visual mark (the red circle) and a single glyph culture (Japanese characters). Emoji dilute both.

**Bilingual copy:** primary UI is English; learning content shows Japanese first, romaji second in muted weight, translation third. Example sentences are rendered in Japanese with a small gloss below.

**Example copy — use as reference:**
- Home hero: "Learn Japanese, one card a day."
- Deck description: "212 words from daily conversation. About 5 minutes per session."
- Answer feedback (correct): "Correct." — that's it, no confetti.
- Answer feedback (wrong): "Not quite. The answer is *rise*."
- Empty state: "Nothing here yet. Start with Hiragana."
- Session end: "Session complete. 18 correct out of 20."
- Login: "Sign in to save your progress."
- Progress stat: "14-day streak" (not "🔥 14 day streak!!")

**What to avoid:**
- "Let's…", "Ready to…", "Awesome!", "Boom!", emoji of any kind
- Competitive framing ("beat your best score")
- Fake urgency ("Don't break your streak!")

---

## VISUAL FOUNDATIONS

### Colors

Three colors do 95% of the work. Everything else is a tint of black.

- **Hinomaru Red** `#BC002D` — the flag red. Used for the logo dot, primary buttons, the active progress bar, and a single accent per screen. Almost never used for text.
- **Sumi Black** `#1A1A1A` — soft black, slightly warm. Body copy, display type, iconography. Never pure `#000`.
- **Washi White** `#FFFFFF` — card and page surface. The canvas.
- **Paper** `#F7F5F2` — a warm off-white for page backgrounds when we want surfaces to float. Inspired by washi paper.
- **Ink tints** — a 7-step neutral ramp from `#F2F2F2` to `#1A1A1A` for borders, dividers, disabled states, and secondary text.
- **Semantic greens/ambers** are used only for correctness feedback, and even then at low saturation.

Full tokens live in `colors_and_type.css`.

### Typography

Two families, one job each:

- **Display / UI:** **Inter Tight** (via Google Fonts). Chosen for tight tracking at display sizes and crisp UI at 14–16px. *Flagged as a substitute* — if the team has a preferred neutral sans (e.g. a licensed Söhne or Founders Grotesk), drop it in and the tokens will follow.
- **Japanese:** **Noto Sans JP** (via Google Fonts). Matches Inter's weight metrics, includes the full JIS set for hiragana, katakana, and kanji.

Weights used: 400 Regular, 500 Medium, 600 Semibold, 700 Bold. No italics — the brand doesn't use them.

The type scale is mostly quiet, with one loud step: display sizes jump from `32px` (H2) straight to `80px` (Card) so flashcards feel monumental against the whitespace.

### Spacing

8pt grid. Spacing tokens `--space-1` (4px) through `--space-16` (128px). Screens breathe: expect generous vertical rhythm (48–80px between blocks on desktop), and no dense info panels anywhere.

### Radii

- `--radius-sm: 8px` — pills, tags, metadata chips
- `--radius-md: 16px` — buttons, inputs, small cards
- `--radius-lg: 24px` — flashcards, option buttons, modals
- `--radius-full: 999px` — avatars, the circle mark

Nothing sharper than 8px. Nothing above 24px except perfect circles.

### Borders

Borders are `1px solid var(--ink-200)` by default (a very quiet `#E8E6E2`). Active/selected states bump to `1.5px solid var(--ink-900)`. No double borders, no dashed, no gradients on borders. Red is reserved for fills and the dot — never used as a border color except momentarily on focus.

### Shadows

Two shadows only:

- `--shadow-sm` — `0 1px 2px rgba(26,26,26,0.04), 0 1px 1px rgba(26,26,26,0.03)` — resting cards
- `--shadow-md` — `0 4px 16px rgba(26,26,26,0.06), 0 2px 4px rgba(26,26,26,0.04)` — lifted/hover state on flashcards

No `--shadow-lg`. Anything that would need a big shadow should instead be a full-screen modal or route, not a floating panel.

### Backgrounds

Plain washi-paper off-white (`--paper`) for page surfaces. Cards are pure white, making them float subtly above the page. **No gradients. No textures. No mesh. No patterns. No hero images.** The closest the brand gets to imagery is a large red circle (`●`) used as a decorative watermark on session-complete screens.

### Animation

- **Easing:** custom `cubic-bezier(0.32, 0.72, 0, 1)` — a quick-start, settle-out curve. Slightly more energetic than iOS default.
- **Durations:** 120ms micro (hover, tap), 240ms standard (open, navigate), 480ms flashcard flip.
- **Flashcard flip:** 3D rotateY, 480ms, custom easing. The *only* animation in the product that uses 3D.
- **Correct/Incorrect reveal:** 240ms fade + 8px translate up. No scale-bounce, no spring.
- No page-enter animations. Pages just appear. Don't fake loading.

### Hover states

- **Buttons:** background darkens ~6% (we use an `oklch` shift so it reads the same across hues). No scale.
- **Cards:** lift from `--shadow-sm` to `--shadow-md`. No scale.
- **Text links:** underline appears (they default to no underline).
- **Icon buttons:** background fades in from transparent to `--ink-100`.

### Press / active states

- Buttons shrink to `scale(0.98)` for 80ms, then return. Only component with scale.
- Flashcards don't scale on press — tap triggers the flip.

### Transparency and blur

Used in exactly one place: the bottom navigation bar on mobile has a `backdrop-filter: blur(16px)` with a 70% white background so content scrolls through softly. Nowhere else — dialogs are opaque, menus are opaque.

### Cards

- `background: var(--white)`, `border-radius: var(--radius-lg)` (24px), `border: 1px solid var(--ink-200)`, `shadow: --shadow-sm`.
- Flashcards specifically: `border: none`, `shadow: --shadow-sm` resting / `--shadow-md` hovered, taller than wide (3:4).
- Option buttons in quizzes: same treatment as cards but 16px radius, centered text.

### Fixed elements

- **Desktop:** top bar is fixed (64px, white, 1px bottom border). No fixed footers.
- **Mobile:** bottom tab bar is fixed (56px + safe area, white with 70% opacity + backdrop-blur, 1px top border).
- In-lesson: a hairline progress bar at the very top of the viewport (2px, red fill on gray track).

### Layout rules

- Max content width: `720px` for learning flows (keeps the line length right for reading), `1080px` for home/dashboard.
- Everything is centered on the page. No sidebars in the learner experience.
- Mobile first. The desktop version is the mobile version given room to breathe — not a separate layout with a sidebar.

---

## ICONOGRAPHY

**Approach:** line icons, 1.5px stroke, rounded line caps, 24×24 viewBox, designed to sit at 20–24px rendered. Monochrome — they inherit `currentColor`. The set should feel like it was drawn with a single brush pressure.

**Source:** **Lucide** (`lucide-react` / `lucide-static`, MIT licensed) — linked from CDN in UI kit files. Lucide's stroke weight and rounding match the brand exactly and it covers every icon this product needs (arrow, check, x, shuffle, plus, minus, volume, bookmark, flame-free streak indicator, etc.).

**Flagged substitution:** the team did not provide a custom icon set. Lucide is used as-is; if a custom set ships later, swap the import and the component surface area is unchanged.

**Unicode as icons:** we deliberately use one — the Japanese full-width middle dot `・` in metadata (`N5・vocabulary`) — because it matches Japanese typesetting conventions. No other unicode glyphs or emoji are used.

**The logo mark:** a single filled red circle (`●`) — the only piece of "illustration" in the brand. Available in `assets/logo-mark.svg` and as a CSS/HTML primitive (a `border-radius: 50%` div with `background: var(--hinomaru-red)`).

**Imagery:** there are no photos, no illustrations, no character mascots. Empty states use a small gray circle outline. Session-complete screens use the red circle at 240px as a watermark.

---

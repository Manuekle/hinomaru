# Hinomaru 日の丸

Minimalist Japanese learning app. JLPT levels N5 → N1. Vocabulary, hiragana, katakana, kanji, and grammar — through flashcards, multiple choice, and typed answers.

**Stack:** SvelteKit · Supabase · Tailwind CSS 4  
**Languages:** Spanish / English UI  
**Platform:** Web only

---

## Repository structure

```
hinomaru/
├── app/               SvelteKit web application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── data/      Content (N5–N1 vocab, kanji, grammar) — TypeScript files
│   │   │   ├── stores/    Svelte stores (locale, auth)
│   │   │   └── i18n.ts    ES/EN translation strings
│   │   └── routes/        Pages (login, home, deck, flashcards, quiz, type, summary)
│   ├── scripts/
│   │   └── seed.ts        Push content to Supabase — npm run seed
│   └── supabase/
│       └── schema.sql     Database schema + RLS policies
└── design/            Design system (independent of the app)
    ├── README.md          Full design spec (colors, type, components, voice)
    ├── colors_and_type.css  Design tokens (CSS variables)
    ├── assets/            Logo SVGs
    ├── fonts/             Font substitution notes
    ├── preview/           HTML previews of all design tokens and components
    └── ui_kit/            React CDN prototype (design reference, not production)
```

---

## Getting started

### 1. Prerequisites

- Node 20+
- A [Supabase](https://supabase.com) project

### 2. Install

```bash
cd app
npm install
```

### 3. Environment

```bash
cp .env.example .env
```

Fill in `.env`:

```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # only needed for seeding
```

### 4. Database

Run `app/supabase/schema.sql` in the Supabase SQL editor. Then seed content:

```bash
npm run seed
```

This pushes all N5 content (149 vocab, 46 hiragana, 46 katakana, 80 kanji, 30 grammar points) and empty deck stubs for N4–N1 into your Supabase project.

### 5. Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Content

All Japanese content lives as TypeScript files in `app/src/lib/data/`. To add words or grammar points, edit the relevant file and run `npm run seed`.

| Level | Vocabulary | Kanji | Grammar | Status |
|-------|-----------|-------|---------|--------|
| N5 | 149 words | 80 | 30 patterns | Complete |
| N4 | — | — | 2 patterns | In progress |
| N3–N1 | — | — | — | Structure ready |

---

## Design system

See `design/README.md` for the full design specification: color palette, typography, spacing, component behavior, animation, and voice/tone guidelines.

The `design/ui_kit/` folder contains a standalone React prototype (no build step — open `index.html` in a browser) used for design review before the SvelteKit build.

---

## License

MIT

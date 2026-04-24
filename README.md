# Hinomaru 日の丸

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-BC002D?style=flat-square)](https://hinomaru.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Hinomaru** is a premium, minimalist Japanese study tool designed for clarity, focus, and long-term retention. Master JLPT levels from N5 to N1 through a scientifically-backed study flow.

> "Learn Japanese, one card at a time."

---

## ✨ Core Features

- **🧠 Smart SRS (Spaced Repetition System)**: Powered by the SM-2 algorithm. Hinomaru predicts when you're about to forget a word and brings it back for review at the perfect moment.
- **✍️ Stroke-by-Stroke Writing**: Practice Hiragana, Katakana, and Kanji with real-time feedback and stroke order guidance.
- **🎯 Multi-Modal Study**: Switch between Flashcards, Multiple Choice Quizzes, and Typing modes to reinforce active recall.
- **📱 PWA & Offline Support**: Fully installable on iOS and Android. Study on the subway or in the mountains with comprehensive offline caching.
- **🌍 Bilingual Experience**: Seamlessly switch between Spanish and English for all UI elements and JLPT descriptions.

---

## 🎨 Design Philosophy: "Sun & Sumi"

Hinomaru's aesthetic is inspired by traditional Japanese minimalism and modern editorial design.

### 🖋️ Typography
- **Display**: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) — High-contrast, geometric, and authoritative for headings.
- **Body / Japanese**: [Noto Sans JP](https://fonts.google.com/specimen/Noto+Sans+JP) — Clean, legible, and balanced for both Latin and Kanji characters.

### 🍎 Color Palette
- **Hinomaru Red (`#BC002D`)**: The soul of the brand. Used sparingly for calls to action and progress.
- **Sumi (`#1A1A1A`)**: A deep, ink-like black for primary text and structural elements.
- **Paper (`#F9F8F6`)**: An off-white, warm background to reduce eye strain during long study sessions.
- **Semantic Colors**: Soft greens for success, muted grays for metadata, and vibrant accents for level badges.

### 🌑 Dark Mode
A meticulously crafted dark theme that preserves contrast while protecting your eyes at night, using deep grays and translucent overlays.

---

## 🛠️ Technology Stack

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) (Runes mode)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Motion](https://motion.dev/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- **Writing logic**: [HanziWriter](https://chanind.github.io/hanzi-writer/)

---

## 📂 Repository Structure

```bash
hinomaru/
├── app/               # Main SvelteKit Application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # Reusable UI parts (Landing, PWA Prompt, etc.)
│   │   │   ├── srs.ts       # Core SM-2 Algorithm logic
│   │   │   └── data/        # JLPT Content (N5–N1)
│   │   └── routes/          # App pages and logic
│   ├── supabase/            # Database migrations & schema
│   └── static/              # Icons, manifest, and PWA assets
└── design/            # Design tokens and UI Kit references
```

---

## 🚀 Getting Started

### 1. Installation
```bash
cd app
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and add your Supabase credentials:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database & Content
Run the schema in your Supabase SQL editor, then seed the initial JLPT data:
```bash
npm run seed
```

### 4. Run Development
```bash
npm run dev
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

Crafted with ❤️ for the love of the Japanese language.

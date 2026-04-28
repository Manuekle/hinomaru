# Hinomaru 日の丸

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-BC002D?style=flat-square)](https://hinomaru.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Manuekle-BC002D?style=flat-square&logo=github)](https://github.com/Manuekle)

**Hinomaru** is a premium, minimalist Japanese study tool designed for clarity, focus, and long-term retention. Master JLPT levels from N5 to N1 through a scientifically-backed study flow.

> "Learn Japanese, one card at a time."

---

## ✨ Core Features

- **🧠 Smart SRS (Spaced Repetition System)**: Powered by the SM-2 algorithm. Hinomaru predicts when you're about to forget a word and brings it back for review at the perfect moment.
- **🔊 Anime TTS (VOICEVOX)**: High-quality Japanese text-to-speech with expressive presets. Choose between **"Kawaii"** (High-energy) and **"Cool"** (Deep tone) voices for an immersive experience.
- **✍️ Stroke-by-Stroke Writing**: Practice Hiragana, Katakana, and Kanji with real-time feedback and stroke order guidance.
- **🎯 Multi-Modal Study**: Switch between Flashcards, Multiple Choice Quizzes, and Typing modes to reinforce active recall.
- **📱 PWA & Offline Support**: Fully installable on iOS and Android. Study on the subway or in the mountains with comprehensive offline caching.

---

## 🎨 Design Philosophy: "Sun & Sumi"

Hinomaru's aesthetic is inspired by traditional Japanese minimalism and modern editorial design.

### 🖋️ Typography
- **Display**: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) — High-contrast, geometric, and authoritative for headings.
- **Body / Japanese**: [Noto Sans JP](https://fonts.google.com/specimen/Noto+Sans+JP) — Clean, legible, and balanced for both Latin and Kanji characters.

---

## 🛠️ Technology Stack

### Frontend (Hinomaru App)
- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) (Runes mode)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Motion](https://motion.dev/)

### Microservices (TTS Service)
- **Engine**: [VOICEVOX](https://voicevox.hiroshiba.jp/)
- **API**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10)
- **Deployment**: [Docker](https://www.docker.com/) (Optimized for Hugging Face Spaces & Cloud Run)
- **Caching**: Persistent disk-based audio caching.

---

## 📂 Repository Structure

```bash
hinomaru/
├── app/               # Main SvelteKit Application
│   ├── src/
│   │   ├── lib/
│   │   │   ├── services/    # External service integrations (TTS, etc.)
│   │   │   └── data/        # JLPT Content (N5–N1)
│   │   └── routes/          # App pages and logic
│   └── static/              # Icons, manifest, and PWA assets
└── tts-service/       # Voicevox TTS Microservice
    ├── app/                 # FastAPI routes and logic
    ├── storage/             # Persistent audio cache (ignored by git)
    └── Dockerfile           # Unified engine + API container
```

---

## 🚀 Getting Started

### 1. App Installation
```bash
cd app
npm install
```

### 2. TTS Microservice Setup (Local)
Ensure you have Docker installed:
```bash
cd tts-service
docker-compose up -d --build o sudo docker compose up -d --build
```

### 3. Environment Setup
Copy `.env.example` to `.env` in the `app` folder:
```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# TTS Service
PUBLIC_VOICEVOX_URL=http://localhost:8000
API_KEY=hinomaru-secret-key
```

### 4. Run Development
```bash
npm run dev
```

---

## ☁️ Deployment

- **App**: Deployed on **Vercel** with automatic GitHub integration.
- **TTS Service**: Optimized for **Hugging Face Spaces (Docker SDK)** or **Google Cloud Run**.
  - High RAM (2GB+) required for the VOICEVOX engine.
  - Set `API_KEY` and `PUBLIC_VOICEVOX_URL` in your Vercel project settings.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for the full text.

---

## 📝 Licencia y Código Abierto

**Hinomaru** es software de código abierto bajo la [Licencia MIT](LICENSE).

Esto significa que puedes:
- ✅ Usar el código libremente, incluso en proyectos comerciales
- ✅ Modificarlo y distribuirlo
- ✅ Contribuir al proyecto

Siempre que se mantenga el aviso de copyright original en todas las copias. El código fue creado originalmente por **Manuekle** y toda redistribución debe reconocer la autoría.

---

## 👤 Autor

**Manuekle**

- GitHub: [@Manuekle](https://github.com/Manuekle)

Crafted with ❤️ for the love of the Japanese language.

// KanaGO! site: ES/EN switch, Kana-chan's eyes and moods, tap-to-hear kana, scroll reveals.
(() => {
  // Set this once the app is live on the App Store.
  const APP_STORE_URL = "";

  const EN = {
    "meta.title": "KanaGO! — Japanese from あ to N1 on your iPhone",
    "meta.desc": "Learn Japanese with a guided path from kana to JLPT N1: short lessons, spaced-repetition flashcards, JLPT mock tests, stories, karaoke and conversations. For iPhone.",
    "nav.features": "Features",
    "nav.jlpt": "JLPT",
    "nav.faq": "FAQ",
    "hero.title": "Japanese from <span class=\"jp\">あ</span> to N1, on your iPhone.",
    "hero.lede": "A guided path of bite-sized lessons, flashcards that come back right before you forget them, JLPT mock tests, stories, karaoke and conversations. With Kana-chan cheering you on.",
    "cta.soon": "Coming soon to the App Store",
    "cta.get": "Download on the App Store",
    "cta.sub": "iPhone · iOS 17 or later",
    "hero.note": "No account · no ads · works offline",
    "hero.hint": "Tap a kana to hear it",
    "bubble.idle": "Tap a kana!",
    "path.eyebrow": "The path",
    "path.title": "Seven paths, one step at a time.",
    "path.lede": "Start with the five vowels and end up reading real Japanese. Each lesson unlocks the next, and anything you miss comes back a little later until it sticks.",
    "path.kana": "Hiragana and katakana with stroke practice and audio",
    "path.n5": "Greetings, numbers, food and your first verbs",
    "path.travel": "Travel",
    "path.travelDesc": "Restaurants, hotels, shopping and directions",
    "path.n4": "Everyday conversation and core grammar",
    "path.n3": "Daily situations and intermediate kanji",
    "path.n2": "News, work and general topics",
    "path.n1": "Broad comprehension and nuance",
    "path.units": "units",
    "path.lessons": "lessons",
    "modes.eyebrow": "Practice",
    "modes.title": "Seven ways not to forget.",
    "modes.lede": "Practice any deck the way you like. Every mode feeds the same spaced-repetition review (SM-2).",
    "mode.quiz": "Multiple choice with the word or its meaning.",
    "mode.listen": "Listen",
    "mode.listenDesc": "Hear the word and pick it, with a slow mode.",
    "mode.speak": "Speak",
    "mode.speakDesc": "Say it out loud; your iPhone listens and grades you.",
    "mode.match": "Match",
    "mode.matchDesc": "Japanese–meaning pairs against the clock.",
    "mode.type": "Type it",
    "mode.typeDesc": "Type the meaning; accents and synonyms are fine.",
    "mode.build": "Build sentence",
    "mode.buildDesc": "Put the pieces of a real sentence in order.",
    "mode.write": "Handwriting",
    "mode.writeDesc": "Draw the kana or kanji from memory, then compare.",
    "srs.title": "Cards come back right before you forget them.",
    "srs.again": "Again",
    "srs.hard": "Hard",
    "srs.good": "Good",
    "srs.easy": "Easy",
    "jlpt.title": "Mock tests in the real format, N5 to N1.",
    "jlpt.lede": "282 vocabulary and grammar questions laid out like the exam, with a timer and a review of your mistakes. N5 adds listening with two-voice dialogues.",
    "jlpt.q": "questions",
    "jlpt.min": "min mock test",
    "jlpt.pass": "to pass",
    "jlpt.vocab": "vocabulary",
    "jlpt.grammar": "grammar",
    "jlpt.listening": "listening",
    "jlpt.mock": "mock test",
    "jlpt.cert": "Pass the mock test and take home a practice certificate to share.",
    "jlpt.fine": "Unofficial practice tests. JLPT is a trademark of The Japan Foundation and JEES.",
    "explore.eyebrow": "Explore",
    "explore.title": "Talk, read and sing.",
    "explore.talk": "conversations",
    "explore.talkDesc": "Real Tokyo situations: you choose what to say and Kana-chan tells you if it sounded natural.",
    "explore.read": "stories",
    "explore.readDesc": "Graded readings with per-paragraph translation, vocabulary and a comprehension quiz.",
    "explore.sing": "songs",
    "explore.singDesc": "Anime and J-pop karaoke with synced lyrics, romaji and translation.",
    "promise.account": "No account",
    "promise.accountDesc": "Open the app and start. Your progress lives on your iPhone.",
    "promise.offline": "Works offline",
    "promise.offlineDesc": "Lessons, audio and mock tests work offline. Only song videos need the internet.",
    "promise.ads": "No ads",
    "promise.adsDesc": "Nothing interrupts your streak. No ads, no trackers.",
    "faq.title": "Questions",
    "faq.lede": "And if yours isn't here, <a href=\"/support\">write to us</a>.",
    "faq.q1": "Do I need to know any Japanese?",
    "faq.a1": "No. The path starts with the vowels あいうえお and moves at your pace.",
    "faq.q2": "Do I need an account?",
    "faq.a2": "No. Everything is saved on your iPhone; if you delete the app, your progress goes with it.",
    "faq.q3": "Does it work without internet?",
    "faq.a3": "Yes. Only song videos need a connection; without one you can still read the lyrics and hear each line.",
    "faq.q4": "Is there an Android or web version?",
    "faq.a4": "For now KanaGO! is iPhone-only (iOS 17 or later).",
    "faq.q5": "What happened to Hinomaru?",
    "faq.a5": "Hinomaru was the web version. Its content and method now live in KanaGO!, a native iPhone app. The website and its accounts were retired, so Hinomaru progress doesn't carry over.",
    "faq.q6": "Are the mock tests official?",
    "faq.a6": "No. They are practice questions in the JLPT format; the certificate is a keepsake of your progress, not an official result.",
    "faq.q7": "What data does it collect?",
    "faq.a7": "None. Details are in the <a href=\"/privacy\">privacy policy</a>.",
    "final.lede": "Your first kana is waiting.",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.support": "Support",
    "doc.privacy": "Privacy",
    "doc.terms": "Terms of use",
    "doc.updated": "Last updated: October 11, 2026",
    "doc.support": "Support",
    "doc.supportLede": "Something not working, or found a mistake in a lesson? We'll help.",
    "nf.title": "This page no longer exists.",
    "nf.lede": "Hinomaru on the web became KanaGO!, an iPhone app.",
    "nf.cta": "Go to KanaGO!",
    "footer.made": "Based on Hinomaru · made with ❤️ by Manuekle. JLPT is a trademark of The Japan Foundation and JEES. App Store is a trademark of Apple Inc.",
  };

  const html = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  // ---------- language ----------
  const i18nEls = [...document.querySelectorAll("[data-i18n]")];
  i18nEls.forEach((el) => { el.dataset.es = el.innerHTML; });
  const metaDesc = document.querySelector('meta[name="description"]');
  const es = { title: document.title, desc: metaDesc?.content };

  function setLang(lang) {
    html.lang = lang;
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === "en" && EN[key] ? EN[key] : el.dataset.es;
    });
    document.querySelectorAll("[data-lang]").forEach((el) => { el.hidden = el.dataset.lang !== lang; });
    if (document.body.dataset.page === "home") {
      document.title = lang === "en" ? EN["meta.title"] : es.title;
      if (metaDesc) metaDesc.content = lang === "en" ? EN["meta.desc"] : es.desc;
    }
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === lang)));
    store.set("kanago-lang", lang);
    setupStoreButtons(lang);
    say(null);
  }

  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.set)));

  // ---------- App Store buttons ----------
  function setupStoreButtons(lang) {
    document.querySelectorAll("[data-store]").forEach((a) => {
      const label = a.querySelector("[data-store-label]");
      if (APP_STORE_URL) {
        a.href = APP_STORE_URL;
        a.removeAttribute("aria-disabled");
        if (label) label.textContent = lang === "en" ? EN["cta.get"] : "Descargar en el App Store";
      } else {
        a.removeAttribute("href");
        a.setAttribute("aria-disabled", "true");
        if (label) label.textContent = lang === "en" ? EN["cta.soon"] : "Muy pronto en el App Store";
      }
    });
  }

  // ---------- Kana-chan ----------
  const blob = document.querySelector(".hero .blob");
  const bubble = document.querySelector(".bubble");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function say(kana) {
    if (!bubble) return;
    if (!kana) {
      bubble.innerHTML = html.lang === "en" ? EN["bubble.idle"] : "¡Toca una kana!";
      return;
    }
    bubble.innerHTML = `<span class="jp">${kana.jp}</span> = <span class="romaji">${kana.r}</span> ✨`;
  }

  if (blob) {
    const pupils = [...blob.querySelectorAll(".pupil")];
    let frame = 0;
    window.addEventListener("pointermove", (e) => {
      if (reduced || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = blob.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height * 0.58;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const k = Math.min(len / 200, 1) * 3.6;
        pupils.forEach((p) => p.setAttribute("transform", `translate(${(dx / len) * k} ${(dy / len) * k})`));
      });
    }, { passive: true });
  }

  let moodTimer = 0;
  function mood(m, ms = 1400) {
    if (!blob) return;
    blob.dataset.mood = m;
    clearTimeout(moodTimer);
    moodTimer = setTimeout(() => { blob.dataset.mood = "curious"; }, ms);
  }

  // ---------- tap-to-hear kana ----------
  let jaVoice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("ja"));
    jaVoice = voices.find((v) => /kyoko|o-ren|google/i.test(v.name)) || voices[0] || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
  }

  const moods = ["happy", "wow", "love"];
  document.querySelectorAll(".kana-sticker").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const kana = { jp: btn.dataset.kana, r: btn.dataset.romaji };
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(kana.jp);
        u.lang = "ja-JP";
        if (jaVoice) u.voice = jaVoice;
        u.rate = 0.8;
        u.pitch = 1.2;
        speechSynthesis.speak(u);
      }
      btn.classList.add("said");
      say(kana);
      mood(moods[i % moods.length]);
    });
  });

  // ---------- nav + reveals ----------
  const nav = document.querySelector(".nav");
  const hero = document.querySelector(".hero, .page-hero");
  if (nav && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => nav.classList.toggle("solid", !entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    }).observe(hero);
  }
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

  // ---------- start ----------
  const asked = new URLSearchParams(location.search).get("lang");
  const saved = store.get("kanago-lang");
  const initial = ["es", "en"].includes(asked) ? asked
    : saved || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  setLang(initial);
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();

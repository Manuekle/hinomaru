// KanaGO! site: EN/ES switch, App Store buttons, and the scroll-driven home (pinned tour, Kana-chan moods, word fill).
(() => {
  // Set this once the app is live on the App Store.
  const APP_STORE_URL = "";

  // The HTML is written in English; Spanish replaces it by key.
  const ES = {
    "meta.title": "KanaGO! — Japonés de la あ al N1 en tu iPhone",
    "meta.desc": "Aprende japonés en tu iPhone con una ruta guiada de kana a JLPT N1: lecciones de un minuto, repaso espaciado, simulacros JLPT, conversaciones, historias y karaoke.",
    "hero.title": "Japonés, <br>de la <span class=\"jp\">あ</span> al N1.",
    "hero.lede": "Lecciones de un minuto, repasos que vuelven justo antes de que olvides y Kana-chan contigo en cada paso.",
    "hero.note": "iPhone · iOS 17+ · Sin cuenta · Sin anuncios",
    "ch1.k": "La ruta",
    "ch1.t": "Una ruta, <br>de kana a N1.",
    "ch1.p": "Empiezas por las cinco vocales y terminas leyendo japonés de verdad. Cada lección desbloquea la siguiente.",
    "ch1.s1": "rutas",
    "ch1.s2": "lecciones",
    "ch2.k": "Lecciones",
    "ch2.t": "Un minuto <br>cada vez.",
    "ch2.p": "Escucha, toca, escribe, traza y habla en pasos de segundos. Tu iPhone te escucha y corrige tu pronunciación.",
    "ch2.s1": "modos de práctica",
    "ch2.s2": "min al día",
    "ch3.k": "Kana",
    "ch3.t": "Cada kana, <br>con su sonido.",
    "ch3.p": "Hiragana y katakana con audio, práctica de trazo y quiz por filas. Busca por romaji cuando te atasques.",
    "ch4.t": "Simulacros, <br>del N5 al N1.",
    "ch4.p": "Vocabulario y gramática con el formato del examen, temporizador y repaso de cada error.",
    "ch4.s1": "preguntas",
    "ch4.s2": "para aprobar",
    "ch5.k": "Explorar",
    "ch5.t": "Habla, lee <br>y canta.",
    "ch5.p": "Situaciones reales de Tokio, historias por nivel con traducción y karaoke de anime y J-pop con letra sincronizada.",
    "ch5.s1": "conversaciones",
    "ch5.s2": "historias",
    "ch5.s3": "canciones",
    "ch6.k": "Cada día",
    "ch6.t": "Recuérdalo <br>para siempre.",
    "ch6.p": "Lo que fallas vuelve justo antes de que lo olvides. Mantén tu racha y verás cómo se queda.",
    "kc.k": "Conoce a Kana-chan",
    "kc.t": "Siente cada respuesta.",
    "kc.hello": "Te saluda",
    "kc.helloD": "Te recibe y celebra tu racha.",
    "kc.happy": "Feliz",
    "kc.happyD": "Cada vez que aciertas.",
    "kc.wow": "Sorprendida",
    "kc.wowD": "Una palabra nueva o tarjetas esperándote.",
    "kc.meh": "Así así",
    "kc.mehD": "Cuando la pronunciación todavía no sale.",
    "kc.angry": "Enfadada",
    "kc.angryD": "Falla una pareja en Emparejar y te lo hará saber.",
    "kc.sad": "Triste",
    "kc.sadD": "Una respuesta mal… que vuelve en tu repaso.",
    "w.k": "Widgets",
    "w.t": "Cuida tu racha <br>todo el día.",
    "w.p": "Widgets que cambian con la hora: un empujón por la mañana, un aviso por la noche y fiesta cuando terminas.",
    "w.c1": "Mañana. Cuando quieras.",
    "w.c2": "Tarde. Se está haciendo tarde.",
    "w.c3": "Casi medianoche. Última oportunidad.",
    "w.c4": "Lección hecha. Racha salvada.",
    "w.ready": "¿Practicamos hoy?",
    "w.late": "Se hace tarde…",
    "w.last": "¡Última oportunidad!",
    "w.done": "¡Meta cumplida!",
    "w.wotd": "Palabra del día",
    "w.school": "escuela",
    "w.review": "12 por repasar",
    "w.week": "<span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>",
    "promise.line": "Sin cuenta. Sin anuncios. Sin rastreadores. Lecciones, audio y simulacros funcionan sin internet, y tu progreso nunca sale de tu iPhone.",
    "faq.title": "Preguntas",
    "faq.lede": "Más ayuda en la página de <a href=\"/support\">soporte</a>.",
    "faq.q1": "¿Necesito saber algo de japonés?",
    "faq.a1": "No. La ruta empieza en las vocales あいうえお y avanza a tu ritmo.",
    "faq.q2": "¿Tengo que crear una cuenta?",
    "faq.a2": "No. Todo se guarda en tu iPhone; si borras la app, tu progreso se va con ella.",
    "faq.q3": "¿Funciona sin internet?",
    "faq.a3": "Sí. Solo los videos de las canciones necesitan conexión; sin ella puedes leer la letra y oír cada línea.",
    "faq.q4": "¿Hay versión para Android o web?",
    "faq.a4": "Por ahora KanaGO! es solo para iPhone (iOS 17 o superior).",
    "faq.q6": "¿Los simulacros son oficiales?",
    "faq.a6": "No. Son preguntas de práctica con el formato del JLPT; el certificado es un recuerdo de tu avance, no un resultado oficial.",
    "faq.q7": "¿Qué datos recoge?",
    "faq.a7": "Ninguno. Los detalles están en la <a href=\"/privacy\">política de privacidad</a>.",
    "faq.q8": "¿Cómo añado un widget?",
    "faq.a8": "Mantén pulsada tu pantalla de inicio, toca «Editar» → «Añadir widget» y busca KanaGO!. En la pantalla de bloqueo, mantenla pulsada y toca «Personalizar».",
    "final.t": "Tu primera kana <br>te está esperando.",
    "cta.sub": "iPhone · iOS 17 o superior",
    "footer.made": "JLPT es una marca de The Japan Foundation y JEES. Apple, el logotipo de Apple, iPhone y App Store son marcas de Apple Inc.",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos",
    "footer.cookies": "Cookies",
    "footer.support": "Soporte",
    "doc.privacy": "Privacidad",
    "doc.terms": "Términos de uso",
    "doc.cookies": "Política de cookies",
    "doc.support": "Soporte",
    "doc.supportLede": "Resuelve las dudas más frecuentes y sigue aprendiendo.",
    "doc.updated": "Última actualización: 11 de octubre de 2026",
    "nf.title": "No encontramos esta página.",
    "nf.lede": "Vuelve al inicio para conocer KanaGO! y seguir aprendiendo japonés.",
    "nf.cta": "Ir a KanaGO!",
  };

  const html = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- language ----------
  const i18nEls = [...document.querySelectorAll("[data-i18n]")];
  i18nEls.forEach((el) => { el.dataset.en = el.innerHTML; });
  // App screenshots come in both languages too.
  const shots = [...document.querySelectorAll("img[data-es]")];
  shots.forEach((img) => {
    img.dataset.en = img.getAttribute("src");
    img.dataset.srcsetEn = img.getAttribute("srcset") || "";
    img.dataset.altEn = img.alt;
    let retriedSrc;
    const ready = (event) => {
      img.toggleAttribute("data-ready", img.complete && img.naturalWidth > 0);
      if (event) {
        lastFilmProgress = -1;
        scheduleFrame();
      }
    };
    const retry = () => {
      ready();
      const src = img.getAttribute("src");
      if (!src || retriedSrc === src) return;
      retriedSrc = src;
      img.src = src;
    };
    img.addEventListener("load", ready);
    img.addEventListener("error", retry);
    ready();
    if (img.complete && !img.naturalWidth) retry();
  });
  const metaDesc = document.querySelector('meta[name="description"]');
  const en = { title: document.title, desc: metaDesc?.content };
  const titleKey = document.body.dataset.page === "home" ? "meta.title" : document.body.dataset.title;

  function setLang(lang) {
    html.lang = lang;
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === "es" && ES[key] ? ES[key] : el.dataset.en;
    });
    shots.forEach((img) => {
      const src = lang === "es" ? img.dataset.es : img.dataset.en;
      const srcset = lang === "es" ? img.dataset.srcsetEs : img.dataset.srcsetEn;
      if (img.getAttribute("src") !== src) {
        img.removeAttribute("data-ready");
        if (srcset) img.srcset = srcset;
        img.src = src;
      }
      img.alt = lang === "es" ? img.dataset.altEs : img.dataset.altEn;
    });
    document.querySelectorAll("[data-lang]").forEach((el) => { el.hidden = el.dataset.lang !== lang; });
    if (titleKey === "meta.title") {
      document.title = lang === "es" ? ES["meta.title"] : en.title;
      if (metaDesc) metaDesc.content = lang === "es" ? ES["meta.desc"] : en.desc;
    } else if (titleKey && ES[titleKey]) {
      document.title = lang === "es" ? `${ES[titleKey]} — KanaGO!` : en.title;
    }
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.set === lang)));
    store.set("kanago-lang", lang);
    setupStoreButtons(lang);
    splitWords();
    lastLit = -1;
    invalidateFrame();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.set)));

  // ---------- App Store buttons ----------
  function setupStoreButtons(lang) {
    const es = lang === "es";
    document.querySelectorAll("[data-store]").forEach((a) => {
      const pre = a.querySelector("[data-store-pre]");
      if (APP_STORE_URL) {
        a.href = APP_STORE_URL;
        a.removeAttribute("aria-disabled");
        if (pre) pre.textContent = es ? "Descárgalo en el" : "Download on the";
        a.setAttribute("aria-label", es ? "Descárgalo en el App Store" : "Download on the App Store");
      } else {
        a.removeAttribute("href");
        a.setAttribute("aria-disabled", "true");
        if (pre) pre.textContent = es ? "Muy pronto en el" : "Coming soon to the";
        a.setAttribute("aria-label", es ? "Muy pronto en el App Store" : "Coming soon to the App Store");
      }
    });
  }

  // ---------- promise line: one span per word, lit by scroll ----------
  const line = document.querySelector(".promise-line");
  let words = [];
  function splitWords() {
    if (!line) return;
    line.innerHTML = line.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" ");
    words = [...line.querySelectorAll(".word")];
  }

  // ---------- scroll engine ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  // Use the sticky stage's stable height: Safari's toolbar changes innerHeight during a swipe.
  const pinned = (rect, stageHeight) => clamp(-rect.top / Math.max(1, rect.height - stageHeight));
  const setStyle = (el, name, value) => {
    if (el && el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
  };
  const setActive = (items, index) => items.forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
    el.classList.toggle("is-past", i < index);
  });

  const nav = document.querySelector(".nav");

  // Tour: t runs 0 → steps. 0–1 is the intro (headline gives way to the phone), then one chapter per step.
  const film = document.querySelector(".film");
  const filmSteps = film ? Number(film.style.getPropertyValue("--steps")) : 0;
  const glyphs = film ? [...film.querySelectorAll(".glyph")] : [];
  const chapters = film ? [...film.querySelectorAll(".chapter")] : [];
  const screens = film ? [...film.querySelectorAll(".screen")] : [];
  const ticks = film ? [...film.querySelectorAll(".rail i")] : [];
  const buddy = film?.querySelector(".buddy");
  const introCopy = film?.querySelector(".intro");
  const device = film?.querySelector(".device");
  const filmStage = film?.querySelector(".stage");
  const moodFor = ["hello", "happy", "wow", "happy", "meh", "hello", "happy"];
  let lastStep = -1;
  let lastFilmProgress = -1;

  function drawFilm(progress) {
    if (progress === lastFilmProgress) return;
    lastFilmProgress = progress;
    const t = progress * filmSteps;
    const intro = reduced ? 1 : ease(clamp(t / 0.9));
    const slide = ease(clamp((t - 0.55) / 0.5));
    setStyle(introCopy, "--intro", intro.toFixed(4));
    setStyle(device, "--intro", intro.toFixed(4));
    setStyle(device, "--slide", (reduced ? (t >= 0.5 ? 1 : 0) : slide).toFixed(4));
    setStyle(introCopy, "--fade", clamp(1 - t / 0.45).toFixed(4));
    setStyle(buddy, "--sway", reduced ? "0deg" : `${(Math.sin(t * Math.PI) * 5).toFixed(2)}deg`);
    // Only the uncovered screenshot and the incoming wipe need to be painted.
    // Keep the previous ready image underneath while a language variant loads.
    const reveals = screens.map((s, i) => !i ? 1 : reduced ? (t >= i ? 1 : 0) : clamp((t - i + 0.2) / 0.3));
    let base = 0;
    screens.forEach((s, i) => {
      if (reveals[i] === 1 && s.hasAttribute("data-ready")) base = i;
    });
    screens.forEach((s, i) => {
      const visible = i === base || (i > base && reveals[i] > 0);
      s.classList.toggle("is-visible", visible);
      if (visible && i) setStyle(s, "--r", reveals[i].toFixed(4));
    });
    const step = Math.min(filmSteps - 1, Math.floor(t + (t < 1 ? 0.15 : 0)));
    if (step !== lastStep) {
      lastStep = step;
      setActive(glyphs, step);
      setActive(chapters, step - 1);
      ticks.forEach((tick, i) => { tick.classList.toggle("on", i < step); tick.classList.toggle("now", i === step - 1); });
      film.classList.toggle("in-chapters", step >= 1);
      if (buddy) buddy.dataset.mood = moodFor[step] || "hello";
    }
    nav?.classList.toggle("solid", t > 0.05);
  }

  // Kana-chan: m runs 0 → 5, each mood slides through the center.
  const moodsFilm = document.querySelector(".moods-film");
  const moodImgs = moodsFilm ? [...moodsFilm.querySelectorAll(".mood-track img")] : [];
  const captions = moodsFilm ? [...moodsFilm.querySelectorAll(".mood-captions li")] : [];
  const dots = moodsFilm ? [...moodsFilm.querySelectorAll(".mood-dots i")] : [];
  const moodsStage = moodsFilm?.querySelector(".stage");
  let lastMood = -1;
  let lastMoodProgress = -1;
  let lastMoodWidth = -1;

  function drawMoods(progress, width) {
    if (progress === lastMoodProgress && width === lastMoodWidth) return;
    lastMoodProgress = progress;
    lastMoodWidth = width;
    const raw = progress * (moodImgs.length - 1);
    const m = reduced ? Math.round(raw) : raw;
    const gap = Math.min(width * 0.34, 340);
    moodImgs.forEach((img, i) => {
      const d = i - m;
      const a = Math.min(Math.abs(d), 2);
      setStyle(img, "transform", `translateX(${(d * gap).toFixed(1)}px) scale(${(1 - Math.min(Math.abs(d), 1) * 0.42).toFixed(3)}) rotate(${(d * -8).toFixed(1)}deg)`);
      setStyle(img, "opacity", (1 - a * 0.42).toFixed(3));
    });
    const now = Math.round(raw);
    if (now !== lastMood) {
      lastMood = now;
      setActive(captions, now);
      dots.forEach((d, i) => d.classList.toggle("on", i === now));
    }
  }

  // Widgets: the clock moves with the scroll; each step is a moment of the day.
  const wFilm = document.querySelector(".w-film");
  const homescreen = wFilm?.querySelector(".homescreen");
  const times = wFilm ? [...wFilm.querySelectorAll(".clock-time span")] : [];
  const caps = wFilm ? [...wFilm.querySelectorAll(".clock-caps li")] : [];
  const widgetsStage = wFilm?.querySelector(".stage");
  const wStates = ["ready", "late", "last", "done"];
  let lastW = -1;

  function drawWidgets(progress) {
    const w = Math.min(wStates.length - 1, Math.floor(progress * wStates.length));
    if (w === lastW) return;
    lastW = w;
    homescreen.dataset.state = wStates[w];
    setActive(times, w);
    setActive(caps, w);
  }

  let lastLit = -1;
  function drawWords(r, height) {
    const p = clamp((height * 0.85 - r.top) / (height * 0.5 + r.height * 0.5));
    const lit = Math.round(p * words.length);
    if (lit === lastLit) return;
    lastLit = lit;
    words.forEach((w, i) => w.classList.toggle("lit", i < lit));
  }

  const final = document.querySelector(".final");
  const finalPet = final?.querySelector(".final-pet");
  function drawFinal(r, height) {
    setStyle(finalPet, "--rise", (reduced ? 1 : ease(clamp((height - r.top) / (height * 0.6)))).toFixed(4));
  }

  let pendingFrame = 0;
  let sizesDirty = true;
  let stageHeights = [];
  // Read all geometry before writing any styles; never force layout between sections.
  function frame() {
    pendingFrame = 0;
    const height = innerHeight;
    const width = innerWidth;
    const rects = [film, moodsFilm, wFilm, line, final].map(el => el?.getBoundingClientRect());
    if (sizesDirty) {
      stageHeights = [filmStage, moodsStage, widgetsStage].map(el => el?.getBoundingClientRect().height || height);
      sizesDirty = false;
    }
    if (film) drawFilm(pinned(rects[0], stageHeights[0]));
    if (moodsFilm) drawMoods(pinned(rects[1], stageHeights[1]), width);
    if (wFilm && homescreen) drawWidgets(pinned(rects[2], stageHeights[2]));
    if (line && words.length) drawWords(rects[3], height);
    if (final) drawFinal(rects[4], height);
    if (!film && nav) nav.classList.toggle("solid", scrollY > 8);
  }
  function scheduleFrame() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(frame);
  }
  function invalidateFrame() {
    sizesDirty = true;
    lastFilmProgress = -1;
    scheduleFrame();
  }
  addEventListener("scroll", scheduleFrame, { passive: true });
  addEventListener("resize", invalidateFrame);

  // Reveals run both ways, so scrolling back up replays them.
  const reveals = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting));
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // ---------- start ----------
  // English first; Spanish only when asked for (link or toggle).
  const asked = new URLSearchParams(location.search).get("lang");
  const saved = store.get("kanago-lang");
  setLang(["en", "es"].includes(asked) ? asked : saved === "es" ? "es" : "en");
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();

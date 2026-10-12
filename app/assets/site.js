// KanaGO! site: EN/ES switch, App Store buttons, and the scroll-driven home (pinned tour, Kana-chan moods, word fill).
(() => {
  // Set this once the app is live on the App Store.
  const APP_STORE_URL = "";

  // The HTML is written in English; Spanish replaces it by key.
  const ES = {
    "meta.title": "Aprende japonés en iPhone, de kana a JLPT N1 | KanaGO!",
    "meta.desc": "Aprende japonés en iPhone con kana, repaso espaciado, simulacros JLPT, historias y canciones. Lecciones sin conexión, sin cuenta, anuncios ni rastreadores.",
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
    "v.k": "Dos voces",
    "v.t": "Voces reales, <br>no robots.",
    "v.p": "Cada palabra, frase y diálogo está grabado con dos voces japonesas naturales. Elige la tuya y toca una frase.",
    "v.pick": "Voz",
    "v.list": "Frases de ejemplo",
    "v.yona": "Clara y alegre",
    "v.kasane": "Tranquila y serena",
    "v.survival": "Supervivencia",
    "v.l1": "Encantado de conocerte.",
    "v.l2": "¡Bienvenido! (lo oirás en cada tienda)",
    "v.l3": "¿Dónde está la estación de Tokio?",
    "v.l4": "Un ramen, por favor.",
    "v.l5": "Mi japonés va mejorando poco a poco.",
    "v.l6": "Cuanto más practicas, mejor te sale.",
    "s.k": "Canciones y karaoke",
    "s.t": "Apréndelo <br>cantando.",
    "s.p": "Anime y J-pop del N5 al N1, cada una con sus palabras clave. Sigue la letra y después cambia a karaoke para cantar.",
    "s.s1": "canciones",
    "s.s2": "todos los niveles",
    "s.f1": "Letra que se ilumina",
    "s.f1d": "Kana, romaji y traducción se llenan mientras suena cada línea.",
    "s.f2": "Karaoke que te puntúa",
    "s.f2d": "Tu iPhone te escucha y califica cada línea que cantas.",
    "s.f3": "Cualquier línea, sin conexión",
    "s.f3d": "¿Sin internet? Toca una línea y Yona o Kasane la leen.",
    "s.shelf": "Las 19 canciones de la app",
    "v.note": "5.373 audios por voz, dentro de la app. Sin internet.",
    "v.tap": "Toca una frase para oírla",
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
    "footer.github": "Dale una estrella en GitHub",
    "doc.privacy": "Privacidad",
    "doc.terms": "Términos de uso",
    "doc.cookies": "Política de cookies",
    "doc.support": "Soporte",
    "doc.supportLede": "Resuelve las dudas más frecuentes y sigue aprendiendo.",
    "doc.updated": "Última actualización: 11 de octubre de 2026",
    "doc.updated.current": "Última actualización: 12 de octubre de 2026",
    "nf.title": "No encontramos esta página.",
    "nf.lede": "Vuelve al inicio para conocer KanaGO! y seguir aprendiendo japonés.",
    "nf.cta": "Ir a KanaGO!",
  };

  const html = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motionPreference.matches;

  function readMotionMs(name, fallback) {
    const value = getComputedStyle(html).getPropertyValue(name).trim();
    const number = parseFloat(value);
    return Number.isFinite(number) ? number * (value.endsWith("ms") ? 1 : 1000) : fallback;
  }

  // Native details work without JS; enhancement adds the recipe's grid animation.
  document.querySelectorAll(".faq details.p21-item").forEach((details, index) => {
    const item = document.createElement("div");
    item.className = details.className;
    item.dataset.open = String(details.open);
    const summary = details.querySelector("summary");
    const head = document.createElement("button");
    head.type = "button";
    head.className = summary.className;
    head.id = `faq-question-${index + 1}`;
    head.setAttribute("aria-expanded", String(details.open));
    while (summary.firstChild) head.append(summary.firstChild);
    const panel = details.querySelector(".p21-panel");
    panel.id = `faq-answer-${index + 1}`;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", head.id);
    panel.inert = !details.open;
    head.setAttribute("aria-controls", panel.id);
    item.append(head, panel);
    details.replaceWith(item);
    head.addEventListener("click", () => {
      const open = item.dataset.open !== "true";
      item.dataset.open = String(open);
      head.setAttribute("aria-expanded", String(open));
      panel.inert = !open;
    });
  });

  const textHideTimers = new WeakMap();
  function setTextReveal(block, shown) {
    if (shown === block.classList.contains("is-shown")) return;
    clearTimeout(textHideTimers.get(block));
    if (shown) {
      block.classList.remove("is-hiding");
      void block.offsetHeight;
      block.classList.add("is-shown");
    } else if (block.classList.contains("is-shown")) {
      block.classList.add("is-hiding");
      block.classList.remove("is-shown");
      const timer = setTimeout(() => block.classList.remove("is-hiding"), reduced ? 0 : readMotionMs("--p18-exit-dur", 200));
      textHideTimers.set(block, timer);
    }
  }

  // ---------- language ----------
  const i18nEls = [...document.querySelectorAll("[data-i18n]")];
  i18nEls.forEach((el) => { el.dataset.en = el.innerHTML; });
  const i18nLabels = [...document.querySelectorAll("[data-i18n-label]")];
  i18nLabels.forEach((el) => { el.dataset.labelEn = el.getAttribute("aria-label") || ""; });
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

  const languageBars = [...document.querySelectorAll(".lang[data-sliding-tabs]")];
  function positionLanguagePills(animate) {
    const positions = languageBars.map((bar) => {
      const tab = bar.querySelector('[aria-pressed="true"]');
      return { pill: bar.querySelector(".p16-indicator"), left: tab.offsetLeft, width: tab.offsetWidth, height: tab.offsetHeight };
    });
    positions.forEach(({ pill, left, width, height }) => {
      const previous = pill.style.transition;
      if (!animate || reduced) pill.style.transition = "none";
      pill.style.transform = `translateX(${left}px)`;
      pill.style.width = `${width}px`;
      pill.style.height = `${height}px`;
      if (!animate || reduced) {
        void pill.offsetWidth;
        pill.style.transition = previous;
      }
    });
  }

  function setLang(lang, animate = false) {
    html.lang = lang;
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === "es" && ES[key] ? ES[key] : el.dataset.en;
    });
    i18nLabels.forEach((el) => {
      const key = el.dataset.i18nLabel;
      el.setAttribute("aria-label", lang === "es" && ES[key] ? ES[key] : el.dataset.labelEn);
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
    positionLanguagePills(animate);
    store.set("kanago-lang", lang);
    setupStoreButtons(lang);
    renderGitHubStars(lang);
    splitWords();
    lastLit = -1;
    invalidateFrame();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.set, true)));
  addEventListener("resize", () => positionLanguagePills(false));
  document.fonts.ready.then(() => positionLanguagePills(false));

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

  // ---------- GitHub stars: one public request when the footer appears ----------
  const githubLinks = [...document.querySelectorAll("[data-github-stars]")];
  // Public snapshot verified on 2026-10-12; a saved real count takes precedence.
  let githubStarCount = 0;
  try {
    const cached = JSON.parse(store.get("kanago-github-stars"));
    if (Number.isSafeInteger(cached?.count) && cached.count >= 0) githubStarCount = cached.count;
  } catch {}
  const digitTimers = new WeakMap();

  function setGitHubDigits(count, value, animate, replay) {
    const previous = count.dataset.value || count.textContent.trim();
    if (animate && previous === value && !replay) return;
    clearTimeout(digitTimers.get(count));
    count.dataset.value = value;
    if (!animate || reduced) {
      count.textContent = value;
      return;
    }
    const fallback = document.createElement("span");
    fallback.className = "github-number-fallback";
    fallback.textContent = previous;
    const group = document.createElement("span");
    group.className = "t-digit-group";
    let same = 0;
    if (!replay) {
      while (same < previous.length && same < value.length && previous[same] === value[same]) same++;
    }
    const chars = [...value];
    chars.forEach((char, index) => {
      const digit = document.createElement("span");
      digit.className = "t-digit";
      digit.textContent = char;
      if (index < same) digit.dataset.same = "";
      if (index === chars.length - 2) digit.dataset.stagger = "1";
      else if (index === chars.length - 1) digit.dataset.stagger = "2";
      group.append(digit);
    });
    count.replaceChildren(fallback, group);
    void group.offsetHeight;
    group.classList.add("is-animating");
    const duration = readMotionMs("--digit-dur", 500) + readMotionMs("--digit-stagger", 70) * 2;
    digitTimers.set(count, setTimeout(() => {
      fallback.remove();
      group.classList.remove("is-animating");
    }, duration + 50));
  }

  function renderGitHubStars(lang, animate = false, replay = false) {
    githubLinks.forEach((link) => {
      const badge = link.querySelector("[data-github-badge]");
      const count = link.querySelector("[data-github-count]");
      setGitHubDigits(count, new Intl.NumberFormat(lang).format(githubStarCount), animate, replay);
      badge.setAttribute("aria-label", lang === "es" ? `${githubStarCount} estrellas` : `${githubStarCount} stars`);
      badge.hidden = false;
    });
  }

  async function loadGitHubStars() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch("https://api.github.com/repos/Manuekle/kanago", {
        headers: { Accept: "application/vnd.github+json" },
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      });
      if (!response.ok) return;
      const repo = await response.json();
      if (repo.full_name?.toLowerCase() !== "manuekle/kanago" ||
          !Number.isSafeInteger(repo.stargazers_count) || repo.stargazers_count < 0) return;
      githubStarCount = repo.stargazers_count;
      store.set("kanago-github-stars", JSON.stringify({ count: githubStarCount, fetchedAt: Date.now() }));
      renderGitHubStars(html.lang, true);
    } catch {
      // Keep the saved public count, or the static snapshot, if GitHub is unavailable.
    } finally {
      clearTimeout(timeout);
    }
  }

  if (githubLinks.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        renderGitHubStars(html.lang, true, true);
        loadGitHubStars();
      });
      githubLinks.forEach((link) => observer.observe(link));
    } else {
      renderGitHubStars(html.lang, true, true);
      loadGitHubStars();
    }
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
    if (el.classList.contains("p18-text")) setTextReveal(el, i === index);
    if (el.classList.contains("chapter")) {
      el.setAttribute("aria-hidden", String(i !== index));
      el.inert = i !== index;
    }
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
  let displayedScreen = null;
  let incomingScreen = null;
  let screenTimer = 0;
  let screenFrame = 0;
  let requestedScreen = null;

  function settleScreen() {
    clearTimeout(screenTimer);
    if (!incomingScreen) return;
    if (requestedScreen === incomingScreen) displayedScreen = incomingScreen;
    screens.forEach((screen) => {
      screen.classList.remove("is-incoming", "is-revealed");
      screen.classList.toggle("is-current", screen === displayedScreen);
      screen.classList.toggle("is-visible", screen === displayedScreen);
    });
    incomingScreen = null;
  }

  function showScreen(index) {
    const target = screens[index];
    if (!target?.hasAttribute("data-ready")) return;
    if (requestedScreen === target && (displayedScreen === target || incomingScreen === target)) {
      if (reduced) settleScreen();
      return;
    }
    requestedScreen = target;
    cancelAnimationFrame(screenFrame);
    clearTimeout(screenTimer);
    if (!displayedScreen || reduced) {
      displayedScreen = target;
      incomingScreen = target;
      settleScreen();
      return;
    }
    if (target === displayedScreen && incomingScreen) {
      incomingScreen.classList.remove("is-revealed");
      screenTimer = setTimeout(settleScreen, readMotionMs("--duration-fast", 250));
      return;
    }
    screens.forEach((screen) => {
      screen.classList.remove("is-incoming", "is-revealed");
      screen.classList.toggle("is-current", screen === displayedScreen);
      screen.classList.toggle("is-visible", screen === displayedScreen || screen === target);
    });
    incomingScreen = target;
    target.classList.add("is-incoming");
    void target.offsetWidth;
    screenFrame = requestAnimationFrame(() => {
      target.classList.add("is-revealed");
      screenTimer = setTimeout(settleScreen, readMotionMs("--duration-fast", 250) + 50);
    });
  }
  screens.forEach((screen) => screen.addEventListener("transitionend", (event) => {
    if (screen === incomingScreen && event.propertyName === "opacity") settleScreen();
  }));

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
    const step = Math.min(filmSteps - 1, Math.floor(t + (t < 1 ? 0.15 : 0)));
    // A complete ready screen stays underneath the incoming fade, even during fast scrolling.
    showScreen(step);
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
  motionPreference.addEventListener("change", (event) => {
    reduced = event.matches;
    if (reduced) settleScreen();
    positionLanguagePills(false);
    renderGitHubStars(html.lang);
    invalidateFrame();
  });

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

  const textBlocks = document.querySelectorAll("[data-reveal-scroll]");
  if ("IntersectionObserver" in window) {
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setTextReveal(entry.target, entry.isIntersecting));
    }, { threshold: 0.15 });
    textBlocks.forEach((block) => textObserver.observe(block));
  } else {
    textBlocks.forEach((block) => setTextReveal(block, true));
  }

  // ---------- voices: Yona and Kasane, the app's ElevenLabs clips ----------
  // Lyric chunks follow the app's LyricTiming: a kana or kanji keeps the small kana and
  // punctuation after it, and each chunk weighs roughly its singing length in morae.
  const smallKana = new Set("ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ");
  const trailing = new Set([...smallKana, ..."っッー、。，．！？!?,.」』）)】…〜～・:;"]);
  const opening = new Set("「『（(【");
  const moraWeight = (c) => {
    if (smallKana.has(c)) return 0.3;
    const v = c.codePointAt(0);
    if (v >= 0x3041 && v <= 0x30ff) return c === "・" ? 0 : 1;
    if ((v >= 0x3400 && v <= 0x4dbf) || (v >= 0x4e00 && v <= 0x9fff)) return 1.8;
    return /[A-Za-z]/.test(c) ? 0.35 : /\d/.test(c) ? 1 : 0;
  };

  // Splits a [data-karaoke] line into .kc spans; a <ruby> word lights up as one chunk.
  function chunkLyric(el) {
    const tokens = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        [...node.textContent].forEach((c) => tokens.push({ c, w: moraWeight(c) }));
      } else if (node.nodeName === "RUBY") {
        const reading = node.querySelector("rt")?.textContent || "";
        tokens.push({ node, w: [...reading].reduce((sum, c) => sum + moraWeight(c), 0) });
      }
    });
    const chunks = [];
    let open = "";
    tokens.forEach((t) => {
      if (t.c && opening.has(t.c)) { open += t.c; return; }
      const joins = chunks.length && !open && t.c && (/\s/.test(t.c) || trailing.has(t.c));
      if (joins) {
        chunks[chunks.length - 1].parts.push(t.c);
        chunks[chunks.length - 1].w += t.w;
      } else {
        chunks.push({ parts: open ? [open, t.node || t.c] : [t.node || t.c], w: t.w });
        open = "";
      }
    });
    const total = chunks.reduce((sum, ch) => sum + ch.w, 0) || 1;
    let sung = 0;
    const spans = chunks.map((ch) => {
      const span = document.createElement("span");
      span.className = "kc";
      span.append(...ch.parts);
      // A chunk lights up a little after its first mora starts.
      span.dataset.at = ((sung + ch.w * 0.3) / total).toFixed(4);
      sung += ch.w;
      return span;
    });
    el.replaceChildren(...spans);
    return spans.map((span) => ({ span, at: Number(span.dataset.at) }));
  }
  const lightChunks = (chunks, p) => chunks.forEach(({ span, at }) => span.classList.toggle("is-sung", p >= at));

  const voicesSection = document.querySelector(".voices");
  const voiceCards = [...document.querySelectorAll(".voice-card")];
  const phrases = [...document.querySelectorAll(".phrase")];
  const savedVoice = store.get("kanago-voice");
  let voice = savedVoice === "kasane" ? "kasane" : "yona";

  // Loudness envelopes (scripts/voice_envelopes.py) drive the meters and the text fill from
  // currentTime, so the audio itself never goes through Web Audio, which the iPhone's
  // silent switch would mute.
  let envelopes = null;
  let envelopesRequest = null;
  const loadEnvelopes = () => {
    envelopesRequest ||= fetch("/assets/voices/envelopes.json?v=1")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((data) => { envelopes = data; });
    return envelopesRequest;
  };

  const audio = new Audio();
  audio.preload = "auto";
  let playing = null;
  let audioFrame = 0;

  function levelAt(info, t, offset = 0) {
    if (!info) return 0.35 + 0.25 * Math.sin(t * 19 + offset * 1.7);
    return Number(info.env[Math.max(0, Math.floor(t * 25) + offset)] || 0) / 9;
  }

  function audioUpdate() {
    if (!playing) return;
    const t = audio.currentTime;
    const info = envelopes?.[playing.id];
    const end = info?.end || (audio.duration ? audio.duration * 0.88 : 1.5);
    const bars = [levelAt(info, t, -1) * 0.75, levelAt(info, t), levelAt(info, t, 1) * 0.9, levelAt(info, t, -2) * 0.65];
    playing.onFrame?.(Math.min(1, t / end), bars, levelAt(info, t));
  }
  function audioTick() {
    if (!playing) return;
    audioUpdate();
    audioFrame = requestAnimationFrame(audioTick);
  }
  // Keeps the text moving where animation frames are throttled.
  audio.addEventListener("timeupdate", audioUpdate);

  function stopAudio() {
    cancelAnimationFrame(audioFrame);
    audio.pause();
    const stopped = playing;
    playing = null;
    stopped?.onStop?.();
  }

  let glowTimer = 0;
  let glowDone = null;
  function afterglow(done, ms) {
    glowDone = done;
    glowTimer = setTimeout(() => { glowDone = null; done(); }, ms);
  }

  function playClip(name, handlers) {
    clearTimeout(glowTimer);
    glowDone?.();
    glowDone = null;
    stopAudio();
    const id = `${voice}-${name}`;
    playing = { id, ...handlers };
    const current = playing;
    loadEnvelopes();
    audio.src = `/assets/voices/${id}.mp3?v=1`;
    audio.play().then(() => {
      if (playing === current) audioFrame = requestAnimationFrame(audioTick);
    }).catch(() => {
      if (playing === current) stopAudio();
    });
  }

  audio.addEventListener("ended", () => {
    cancelAnimationFrame(audioFrame);
    const done = playing;
    playing = null;
    done?.onFrame?.(1, [0, 0, 0, 0], 0);
    done?.onEnd?.();
  });

  const setBars = (bars, levels) => bars.forEach((bar, i) => {
    bar.style.setProperty("--b", reduced ? "0.6" : Math.max(0.18, levels[i] || 0).toFixed(3));
  });

  function speakingCard() {
    return voiceCards.find((card) => card.dataset.voice === voice);
  }

  // The chosen voice's card shows the meter and Kana-chan bobs with the loudness.
  function showSpeaking(levels, level) {
    const card = speakingCard();
    voiceCards.forEach((c) => c.classList.toggle("is-speaking", c === card && level !== null));
    if (!card) return;
    setBars([...card.querySelectorAll(".voice-wave i")], [levels[0], levels[1], levels[2], levels[3], levels[1] * 0.7]);
    card.querySelector(".voice-pet")?.style.setProperty("--level", reduced || level === null ? "0" : level.toFixed(3));
  }

  const phraseChunks = new Map(phrases.map((p) => [p, chunkLyric(p.querySelector("[data-karaoke]"))]));

  function resetPhrase(phrase) {
    phrase.classList.remove("is-playing");
    phrase.setAttribute("aria-pressed", "false");
    lightChunks(phraseChunks.get(phrase), 0);
    showSpeaking([0, 0, 0, 0], null);
  }

  phrases.forEach((phrase) => {
    phrase.setAttribute("aria-pressed", "false");
    const bars = [...phrase.querySelectorAll(".bars i")];
    phrase.addEventListener("click", () => {
      if (phrase.classList.contains("is-playing")) { stopAudio(); return; }
      playClip(phrase.dataset.clip, {
        onFrame: (p, levels, level) => {
          lightChunks(phraseChunks.get(phrase), p);
          setBars(bars, levels);
          showSpeaking(levels, level);
        },
        // The finished line stays lit for a moment, unless something else starts playing.
        onEnd: () => afterglow(() => resetPhrase(phrase), 600),
        onStop: () => resetPhrase(phrase),
      });
      phrase.classList.add("is-playing");
      phrase.setAttribute("aria-pressed", "true");
      lightChunks(phraseChunks.get(phrase), 0);
    });
  });

  function setVoice(next, greet) {
    voice = next;
    voicesSection?.setAttribute("data-voice", next);
    voiceCards.forEach((card) => {
      const on = card.dataset.voice === next;
      card.setAttribute("aria-checked", String(on));
      card.tabIndex = on ? 0 : -1;
    });
    store.set("kanago-voice", next);
    if (!greet) return;
    // Picking a voice introduces it.
    playClip("hajimemashite", {
      onFrame: (p, levels, level) => showSpeaking(levels, level),
      onEnd: () => showSpeaking([0, 0, 0, 0], null),
      onStop: () => showSpeaking([0, 0, 0, 0], null),
    });
  }
  voiceCards.forEach((card, i) => {
    card.addEventListener("click", () => setVoice(card.dataset.voice, true));
    // Radio group keys: arrows move and pick.
    card.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = voiceCards[(i + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + voiceCards.length) % voiceCards.length];
      next.focus();
      setVoice(next.dataset.voice, true);
    });
  });
  if (voiceCards.length) setVoice(voice, false);

  // Fetch the envelopes a little before the audio sections come into view.
  if (voicesSection && "IntersectionObserver" in window) {
    const near = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      loadEnvelopes();
    }, { rootMargin: "800px 0px" });
    near.observe(voicesSection);
  }

  // ---------- song shelf: a cloned row for the seamless loop, running only on screen ----------
  const shelf = document.querySelector(".shelf");
  shelf?.querySelectorAll(".shelf-viewport").forEach((viewport) => {
    const [row, copy] = viewport.querySelectorAll(".shelf-row");
    if (row && copy) copy.innerHTML = row.innerHTML;
  });
  if (shelf && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => shelf.classList.toggle("is-running", entry.isIntersecting)).observe(shelf);
  }

  // ---------- start ----------
  // English first; Spanish only when asked for (link or toggle).
  const asked = new URLSearchParams(location.search).get("lang");
  const saved = store.get("kanago-lang");
  setLang(["en", "es"].includes(asked) ? asked : saved === "es" ? "es" : "en");
  requestAnimationFrame(() => {
    positionLanguagePills(false);
    if (introCopy) setTextReveal(introCopy, true);
  });
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();

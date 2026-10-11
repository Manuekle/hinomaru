# KanaGO! — sitio web

Landing de **KanaGO!**, la app para iPhone que aprende japonés de la あ al N1 (antes *Hinomaru*). Publicada en [hinomaru.vercel.app](https://hinomaru.vercel.app).

Hinomaru empezó como app web (SvelteKit + Supabase). Su contenido y su método ahora viven en la app nativa de iOS, así que este repositorio solo sirve la landing y las páginas que pide el App Store. La app web anterior sigue en el historial de git (último commit: `1f74312`).

## Qué hay

```
app/                 raíz del proyecto en Vercel (Root Directory = app)
  index.html         landing (ES/EN)
  privacy.html       política de privacidad  → /privacy
  terms.html         términos de uso         → /terms
  support.html       soporte                 → /support
  404.html
  assets/            estilos, JS, capturas de la app e íconos
  sw.js              reemplaza el service worker de la PWA vieja y se desinstala
  registerSW.js      idem para páginas viejas en caché
  vercel.json        URLs limpias, redirecciones de rutas viejas y cabeceras
  og-image.png       imagen para redes (1200×630)
```

Sitio estático: HTML, CSS y un JS pequeño, sin build ni dependencias.

- **Idioma:** español por defecto; el botón ES/EN cambia los textos marcados con `data-i18n` (diccionario en `assets/site.js`) y los bloques `data-lang` de las páginas legales.
- **App Store:** cuando la app esté publicada, pon el enlace en `APP_STORE_URL` dentro de `assets/site.js`; los botones pasan de “Muy pronto” a “Descargar”.
- **Rutas viejas** de Hinomaru (`/login`, `/deck/…`, `/jlpt/…`, etc.) redirigen a la portada; `/contact` va a `/support`.

## Desarrollo

```bash
npx serve app
```

Despliega solo al hacer push a `main` (integración de Vercel con GitHub).

## Licencia

MIT — ver [LICENSE](LICENSE). Creado por [Manuekle](https://github.com/Manuekle).

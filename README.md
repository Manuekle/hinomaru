# KanaGO! — sitio web

Landing de **KanaGO!**, la app para iPhone que enseña japonés de la あ al N1, y las páginas públicas que pide el App Store.

## Inicio rápido

```bash
python3 scripts/serve.py      # http://localhost:4181
```

Sin build ni dependencias: edita los archivos de `app/`, recarga y sube con `git push origin web` (despliega solo en Vercel).

## Ramas y despliegue

El repositorio es [Manuekle/kanago](https://github.com/Manuekle/kanago). Este directorio trabaja en la rama **`web`**.

- **`web`:** contiene el sitio y es la rama de producción de Vercel. Cada push despliega automáticamente la web; el directorio raíz de Vercel es `app`.
- **`main`:** mantiene la versión de la web integrada mediante pull requests.
- **`ios`:** contiene el proyecto nativo en el checkout principal de KanaGO!. Sus despliegues de Vercel están desactivados.

Para subir cambios del sitio desde este directorio:

```bash
git status
git push origin web
```

El commit debe estar creado antes del push. El proyecto iOS y su README se versionan desde el directorio superior, en la rama `ios`.

## Qué hay

```
app/                 raíz del proyecto en Vercel (Root Directory = app)
  index.html         landing (ES/EN)
  privacy.html       política de privacidad  → /privacy
  terms.html         términos de uso         → /terms
  cookies.html       política de cookies     → /cookies
  support.html       soporte                 → /support
  404.html
  assets/            estilos, JS, capturas de la app, íconos y arte de Kana-chan (assets/kana/)
  sw.js              reemplaza el service worker de la versión PWA anterior y se desinstala
  registerSW.js      idem para páginas viejas en caché
  vercel.json        URLs limpias, redirecciones de rutas viejas y cabeceras
  og-image.png       imagen para redes (1200×630)
```

Sitio estático: HTML, CSS y un JS pequeño, sin build ni dependencias.

### Cómo funciona

- **Tipografía:** la misma de la app, SF Pro Rounded (títulos) y SF Pro Text (texto), vía las fuentes del sistema (`ui-rounded`, `-apple-system`).
- **Marca:** `assets/logo.svg` es el logotipo «Kana GO!»; `assets/kana/` tiene el ícono de la app (claro y oscuro), los seis ánimos de Kana-chan y los stickers.
- **Botón del App Store:** insignia negra con el logotipo de Apple. Mientras `APP_STORE_URL` (en `assets/site.js`) esté vacío dice «Muy pronto en el App Store»; al rellenarlo pasa a «Descárgalo en el App Store» y enlaza a la ficha.
- **Widgets:** réplicas en HTML/CSS que recorren cuatro momentos del día al hacer scroll.
- **Caché:** `styles.css`, `site.js` y las capturas llevan `?v=N`; súbelo al cambiarlos.
- **Capturas:** siete pantallas reales de la app iOS en inglés (`assets/shots/`) y español (`assets/shots/es/`), a 1206 × 2622. `assets/shots/mobile/` contiene versiones de 600 px de ancho, elegidas mediante `srcset`. Actualizadas el 12 de octubre de 2026 desde la compilación del simulador con la nueva paleta: Inicio, Ruta, Lección, Kana, JLPT, Leer y Resultados. Todas las variantes usan la misma versión de caché.
- **Teléfono:** `assets/iphone-frame.svg` es el marco del iPhone 18 Pro tal cual (titanio, bisel negro y Dynamic Island). Su hueco de pantalla mide justo 1206 × 2622, así que las capturas van 1:1 debajo y la hora queda alineada con la isla. El radio de `.screens` solo esconde las esquinas de la captura bajo el bisel (sirve cualquier valor entre 82 y 176 de 1206).
- **Capturas nuevas:** `sh scripts/add_shot.sh <nombre> <png> [es]` convierte una captura de 1206 × 2622 en WebP (q92 + versión de 720 px, con `sharp_yuv`) y borra la Dynamic Island que el simulador de iOS 27 hornea en la imagen (`scripts/remove_island.py`). Captura con `xcrun simctl io <udid> screenshot --mask=ignored archivo.png`. La sección Canciones usa `shots/song.webp` (y `es/`): 紅蓮華 en modo karaoke justo en el «Sing!» de la cuenta atrás, cuando la app difumina la letra.
- **Voces:** la sección Voces reproduce clips reales de ElevenLabs de la app (Yona = Kawaii, Kasane = Cool) desde `assets/voices/`. `scripts/voice_envelopes.py` mide cada clip (volumen a 25 fps y fin del habla) en `envelopes.json`; con eso se mueven las barras y se ilumina el texto por moras, como el karaoke de la app, sin pasar el audio por Web Audio (el interruptor de silencio del iPhone lo apagaría). Para añadir una frase, copia sus mp3 de `build/tts-cache/` (y `kasane/`) con el nombre `yona-<clip>.mp3` / `kasane-<clip>.mp3` y vuelve a correr el script.
- **Mascotas junto al teléfono:** el recorrido y Canciones comparten la proporción del sticker (64 % del ancho del teléfono), anclado a su esquina inferior izquierda. Canciones reserva espacio lateral para centrar la composición sin recortar a Kana-chan en móvil.
- **Canciones:** captura real dentro de una canción (karaoke de 紅蓮華 en la cuenta atrás, con la letra difuminada por la app) y la lista de las 19 canciones como las filas de la pestaña Cantar. Las letras no se publican legibles en la web.
- **Iconos:** Hugeicons, los mismos SVG de la app (`Assets.xcassets/Hugeicons`, trazo y relleno), en un sprite al inicio de `index.html` (`<use href="#hi-…">`).
- **Scroll:** las mediciones de geometría se agrupan antes de escribir estilos, con una actualización por `requestAnimationFrame`. Las secciones detenidas no reescriben sus estilos y el teléfono solo pinta la captura descubierta y la que entra. La altura de cada escena se toma del escenario fijo para evitar saltos al cambiar la barra de Safari.
- **Imagen para redes:** `scripts/brand-assets.html` es la composición; `app/og-image.png` su exportación a 1200 × 630, con la captura actual y perfil sRGB para conservar sus colores.
- **SEO y redes:** las cinco páginas públicas incluyen canonical, descripción, Open Graph, Twitter Cards y datos estructurados. La revisión del 12 de octubre está en `docs/seo-audit-2026-10-12.md`.
- **GitHub:** el pie enlaza a `Manuekle/kanago` e invita a dejar una estrella. Consulta el recuento público una sola vez al aparecer en pantalla, sin cookies, credenciales ni caché persistente. Si la API falla, conserva el enlace y oculta la cifra.
- **Movimiento:** se aplicó Polish con `transitions-agent` 0.11.1; el análisis pasó de 79 a 98. Las duraciones y curvas salen de los tokens de `:root` (`--duration-*`, `--ease-*`), salvo el bucle lento de la lista de canciones, y `prefers-reduced-motion` apaga las nuevas también.
- **Color:** la paleta de la app (`KG` en `Theme.swift`) está en `:root`: rosa, cielo, menta, uva y sol, con variantes `*-ink` para texto sobre blanco. Las píldoras de nivel usan los mismos colores que la app (N5 rosa, N4 cielo, N3 menta, N2 uva, N1 tinta).

## Checklist al cambiar el sitio

- Subir el `?v=N` de `styles.css`, `site.js` o las capturas que cambien.
- Revisar ES y EN: el inglés vive en el HTML (`data-i18n`) y el español en el objeto `ES` de `assets/site.js`.
- Si cambian las capturas, regenerar las variantes móviles (abajo) y, si aplica, `og-image.png`.
- Cuando exista la ficha, rellenar `APP_STORE_URL` en `assets/site.js`.

## Vista previa local

Desde este directorio:

```bash
python3 scripts/serve.py
```

Abre `http://localhost:4181`. El servidor reconoce las rutas sin extensión
(`/privacy`, `/terms`, `/cookies` y `/support`) y sirve sus archivos HTML,
igual que `cleanUrls` en Vercel. `python3 -m http.server` solo reconoce los
nombres de archivo con `.html` y devuelve 404 para esos enlaces.

Para usar otro puerto: `python3 scripts/serve.py 4182`.

Al actualizar las capturas, regenera las variantes móviles con `cwebp`:

```bash
for shot in home path lesson kana exam read result; do
  cwebp -quiet -resize 600 0 -q 88 "app/assets/shots/$shot.webp" -o "app/assets/shots/mobile/$shot.webp"
  cwebp -quiet -resize 600 0 -q 88 "app/assets/shots/es/$shot.webp" -o "app/assets/shots/mobile/es/$shot.webp"
done
```

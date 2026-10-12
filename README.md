# KanaGO! — sitio web

Landing de **KanaGO!**, la app para iPhone que enseña japonés de la あ al N1, y las páginas públicas que pide el App Store.

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

- **Tipografía:** la misma de la app, SF Pro Rounded (títulos) y SF Pro Text (texto), vía las fuentes del sistema (`ui-rounded`, `-apple-system`).
- **Marca:** `assets/logo.svg` es el logotipo «Kana GO!»; `assets/kana/` tiene el ícono de la app (claro y oscuro), los seis ánimos de Kana-chan y los stickers.
- **Botón del App Store:** insignia negra con el logotipo de Apple. Mientras `APP_STORE_URL` (en `assets/site.js`) esté vacío dice «Muy pronto en el App Store»; al rellenarlo pasa a «Descárgalo en el App Store» y enlaza a la ficha.
- **Widgets:** la sección de widgets son réplicas en HTML/CSS de los widgets de la app, con interruptor claro/oscuro.
- **Caché:** `styles.css`, `site.js` y las capturas llevan `?v=N`; súbelo al cambiarlos.
- **Capturas:** siete pantallas reales de la app iOS en inglés (`assets/shots/`) y español (`assets/shots/es/`), a 1206 × 2622. Actualizadas el 12 de octubre de 2026 desde la compilación actual del simulador: Inicio, Ruta, Lección, Kana, JLPT, Leer y Resultados.
- **Imagen para redes:** `scripts/brand-assets.html` es la composición; `app/og-image.png` su exportación a 1200 × 630.

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

# KanaGO!

<img src="KanaGO/Assets.xcassets/Brand/logo.kanago.imageset/logo.kanago.svg" alt="KanaGO!" width="180">

**Japonés de la あ al N1, a tu ritmo.**

KanaGO! es una app nativa para iPhone, hecha con SwiftUI. Combina lecciones cortas, repaso espaciado y práctica de japonés con Kana-chan, la mascota que te acompaña durante el aprendizaje.

Sin cuentas ni anuncios. El progreso se guarda en tu iPhone y la interfaz está disponible en español e inglés.

## Ramas y repositorio

La app y la web se versionan en [Manuekle/kanago](https://github.com/Manuekle/kanago), con dos checkouts locales y ramas separadas:

| Rama | Contenido | Directorio local |
| --- | --- | --- |
| **`ios`** | App nativa, proyecto Xcode, widgets, contenido, audio y recursos. | Raíz de este proyecto. |
| **`web`** | Sitio estático con despliegue automático a producción en Vercel. | `site/` |
| **`main`** | Versión de la web integrada mediante pull requests. | Repositorio de la web. |

Para subir commits de la app desde la raíz, usa `git push origin ios`. Para subir commits del sitio desde aquí, usa `git -C site push origin web`.

`site/`, las claves en `.env*`, los archivos de compilación y la configuración local de Xcode quedan fuera del Git de iOS. El archivo `app/vercel.json` de la rama `ios` desactiva sus despliegues en Vercel.

## Ejecutar la app

Necesitas macOS, Xcode 26 o posterior y un simulador o iPhone con iOS 17 o posterior.

1. Abre el proyecto:

   ```bash
   open KanaGO.xcodeproj
   ```

2. Selecciona el esquema **KanaGO** y un simulador de iPhone.
3. Ejecuta con **⌘R**.

Para usar un iPhone físico, configura tu equipo de desarrollo en **Signing & Capabilities** de los targets `KanaGO` y `KanaGOWidget`. Ambos deben compartir el mismo App Group, definido en sus archivos de entitlements y en `Shared/WidgetSnapshot.swift`.

Los datos, las voces pregrabadas y los efectos de sonido ya están incluidos. No necesitas una clave de ElevenLabs para ejecutar la app.

## Qué puedes hacer

| Sección | Funciones |
| --- | --- |
| **Inicio** | Racha, XP, meta diaria, repasos pendientes, siguiente lección, palabra e historia del día. |
| **Kana** | Hiragana y katakana con audio, búsqueda por romaji, práctica de trazo, palabras de ejemplo y quiz por filas. |
| **Aprender → Ruta** | Siete rutas: Kana, Viaje y N5–N1. Las lecciones se desbloquean de forma progresiva y repiten los errores para reforzar lo aprendido. |
| **Aprender → Mazos** | Vocabulario, kanji y gramática con tarjetas y repaso espaciado SM-2. |
| **Aprender → JLPT** | Práctica de vocabulario y gramática N5–N1, escucha en N5, temporizador y repaso de errores. |
| **Explorar** | Conversaciones de rol, historias graduadas y canciones con letra sincronizada, romaji, traducción y modo karaoke. |
| **Yo** | Estadísticas, vocabulario guardado, idioma, romaji, sonido, meta diaria, recordatorios y elección de voz. |

Los mazos ofrecen hasta siete modos de práctica: **Quiz**, **Escuchar**, **Pronunciar**, **Emparejar**, **Teclear**, **Construir frase** y **Escribir a mano**. Los modos disponibles dependen del contenido de cada mazo.

El simulacro JLPT combina 30 preguntas de vocabulario y gramática en 20 minutos. Un resultado de al menos 70 % desbloquea un certificado de práctica para compartir. Los simulacros y certificados no son oficiales.

### Contenido incluido

- **131 unidades y 641 lecciones** distribuidas en siete rutas.
- **50 mazos**, con 1.165 tarjetas y 186 entradas de gramática.
- **37 conversaciones**, **18 historias** y **19 canciones**.

## Widgets

La extensión `KanaGOWidget` incluye:

- **Racha:** widget pequeño y versiones circular y en línea para la pantalla bloqueada.
- **Palabra del día:** tamaños pequeño, mediano y rectangular para la pantalla bloqueada.
- **Hoy:** widget mediano con racha, actividad semanal y tarjetas por repasar.

La app comparte un resumen del progreso mediante `widget-snapshot.json` en el App Group. Los widgets leen ese archivo y muestran a Kana-chan según la actividad del día. Cuando hay tarjetas pendientes, tocar **Hoy** abre el repaso con `kanago://review`.

## Datos, audio y conexión

El contenido se carga desde `KanaGO/Resources/Data/`. El progreso se guarda en `Application Support/kanago-progress.json`, dentro del contenedor de la app.

Las lecciones, tarjetas, historias, simulacros y clips de voz incluidos funcionan sin conexión. Los videos de YouTube necesitan internet; sin video, puedes leer la letra y tocar cada línea para escucharla. **Pronunciar** y el modo karaoke necesitan permisos de micrófono y reconocimiento de voz, y dependen de la disponibilidad del reconocimiento de Apple.

Puedes elegir entre las voces **Yona** y **Kasane** en la pestaña **Yo**. Los clips pregrabados están en `KanaGO/Resources/Audio/`; cuando no hay un clip disponible, la app usa la síntesis de voz japonesa de iOS.

## Estructura del proyecto

```text
KanaGO.xcodeproj/        Proyecto de Xcode: app y extensión de widgets
KanaGO/
  App/                  Arranque, navegación y enlaces de los widgets
  Data/                 Modelos, progreso, repaso, audio y sincronización
  Design/               Colores, tipografía, componentes y Kana-chan
  Features/             Pantallas y sesiones de aprendizaje
  Assets.xcassets/       Logo, íconos, mascotas y stickers
  Resources/
    Data/               Contenido en JSON
    Audio/              Voces pregrabadas en M4A
    Sounds/             Efectos de la interfaz en WAV
KanaGOWidget/           Widgets de inicio y pantalla bloqueada
Shared/                 Modelo de datos compartido con los widgets
scripts/                Herramientas para generar audio y recursos
design/                 Recursos y referencias de diseño
app/vercel.json         Desactiva los despliegues de Vercel de la rama ios
site/                   Copia local del sitio web, con repositorio propio
```

## Actualizar contenido y recursos

Los archivos de `KanaGO/Resources/Data/` contienen los mazos, el silabario, la ruta, las conversaciones, canciones, historias y preguntas JLPT. Después de modificar textos japoneses, puedes generar los clips de voz que falten.

### Voces pregrabadas

La generación requiere Python 3, `afconvert` de macOS y una clave de ElevenLabs. Configúrala como `ELEVENLABS_API_KEY` en el entorno o en `.env.local`, en la raíz del proyecto. Ese archivo está excluido de Git.

Primero revisa los clips pendientes sin generar audio ni llamar a ElevenLabs:

```bash
python3 scripts/generate_audio.py --dry-run
```

Para generar los clips de cada voz:

```bash
python3 scripts/generate_audio.py --voice yona
python3 scripts/generate_audio.py --voice kasane
```

La generación usa créditos de ElevenLabs y omite los clips que ya existen. Puedes volver a ejecutar el comando para completar los pendientes.

### Efectos de sonido

Las recetas están en `scripts/sounds/patches.json` y el reproductor en `scripts/sounds/player.js`. Para regenerar los WAV necesitas Python 3 y Google Chrome instalado en macOS:

```bash
python3 scripts/sounds/render.py
```

## Sitio web

El sitio público es independiente de la app: HTML, CSS y JavaScript estáticos, con páginas de privacidad, términos, cookies y soporte. La carpeta `site/` contiene su repositorio local y está excluida del proyecto principal mediante `.gitignore`.

Para abrir la vista previa desde la raíz de KanaGO!:

```bash
python3 site/scripts/serve.py
```

Abre [localhost:4181](http://localhost:4181). El servidor reconoce las rutas sin extensión, como `/privacy` y `/support`.

Más detalles sobre la web, los recursos de marca y el botón del App Store están en [el README del sitio](site/README.md).

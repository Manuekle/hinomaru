# KanaGO: revisión de emojis y prompts para iconos sticker

Revisión del 12 de octubre de 2026. Entrega: inventario y propuesta de dibujos para que el usuario genere o dibuje los SVG. La interfaz y los datos de la app no se han modificado. Los nombres siguientes son una propuesta de entrega, no assets ya instalados.

## Resultado de la revisión

- Ruta: 115 de 131 unidades usan emojis, con 97 dibujos distintos. Las otras 16 muestran caracteres kana o kanji.
- Historias: 18 registros, todos con emoji; 18 dibujos distintos.
- Conversaciones: 37 registros con emoji; 29 dibujos distintos.
- En conjunto son 170 registros y 120 emojis distintos en los datos. Los mismos aparecen en listas, cabeceras y tarjetas, por lo que no hacen falta 170 archivos.
- Además, el código introduce el micrófono de Canciones, la llama del combo y dos banderas en el selector de idioma. Libro, viaje y otros dibujos de Inicio repiten conceptos de los datos.
- Los recordatorios y las fuentes del vocabulario guardado también contienen emojis dentro del texto.
- La web usa pets, stickers e iconos SVG. No se encontraron emojis literales en el HTML/JS/CSS revisado. Sí se confirmaron emojis dentro de las capturas `site/app/assets/shots/read.webp` y `site/app/assets/shots/es/talk.webp`; al integrar los nuevos assets hay que renovar las capturas de Historias y Conversaciones en ambos idiomas.

## Dónde se sustituyen

| Pantalla o uso | Evidencia en el código | Cambio propuesto |
|---|---|---|
| Inicio: historia del día | [HomeView.swift:269](/Users/manudev/Dev/kanago/KanaGO/Features/HomeView.swift:269) | Asset del tema de la historia; comparte dibujo con la lista y el lector. |
| Inicio: Historias y Canciones | [HomeView.swift:354](/Users/manudev/Dev/kanago/KanaGO/Features/HomeView.swift:354) | `sticker.book` y `sticker.mic`. |
| Inicio: tarjetas de Viaje | [HomeView.swift:395](/Users/manudev/Dev/kanago/KanaGO/Features/HomeView.swift:395) | `sticker.ramen`, `sticker.shopping`, `sticker.map`, `sticker.hotel`, `sticker.medicine`, `sticker.airplane`. |
| Aprender: selector Viaje | [LearnView.swift:134](/Users/manudev/Dev/kanago/KanaGO/Features/LearnView.swift:134) | `sticker.airplane` separado del texto Viaje / Travel. |
| Ruta: encabezado de cada unidad | [RoadmapView.swift:60](/Users/manudev/Dev/kanago/KanaGO/Features/RoadmapView.swift:60) | Mapeo por unidad en la tabla de Ruta de este documento. |
| Conversaciones: lista | [TalkAndProfile.swift:136](/Users/manudev/Dev/kanago/KanaGO/Features/TalkAndProfile.swift:136) | Asset de cada escenario; reutilizarlo en la sesión. |
| Conversaciones: cabecera de sesión | [ConversationSession.swift:37](/Users/manudev/Dev/kanago/KanaGO/Features/ConversationSession.swift:37) | Mismo dibujo de la lista. |
| Historias: cabecera del lector | [SongsAndStories.swift:581](/Users/manudev/Dev/kanago/KanaGO/Features/SongsAndStories.swift:581) | Asset de cada historia, visible a 64 pt. |
| Historias: lista | [SongsAndStories.swift:734](/Users/manudev/Dev/kanago/KanaGO/Features/SongsAndStories.swift:734) | Mismo asset que el lector y la tarjeta de Inicio. |
| Onboarding: idioma | [OnboardingView.swift:185](/Users/manudev/Dev/kanago/KanaGO/Features/OnboardingView.swift:185) | Quitar las banderas. Usar Español / English con el icono SVG `HI.translate` existente; no necesita dibujo nuevo. |
| Quiz: combo de aciertos | [Sessions.swift:372](/Users/manudev/Dev/kanago/KanaGO/Features/Sessions.swift:372) | `sticker.fire` separado del contador xN. |
| Palabras guardadas desde canciones | [SongsAndStories.swift:295](/Users/manudev/Dev/kanago/KanaGO/Features/SongsAndStories.swift:295) | Guardar la fuente sin prefijo emoji; se puede usar `sticker.mic` como imagen separada. |
| Palabras guardadas desde historias | [SongsAndStories.swift:629](/Users/manudev/Dev/kanago/KanaGO/Features/SongsAndStories.swift:629) | Guardar el título sin prefijo emoji; conservar la referencia de historia si se desea su icono. |
| Mi vocabulario: fuente visible | [VocabularyView.swift:105](/Users/manudev/Dev/kanago/KanaGO/Features/VocabularyView.swift:105) | También limpiar los prefijos de palabras ya guardadas, no solo las nuevas. |
| Notificaciones | [Extras.swift:170](/Users/manudev/Dev/kanago/KanaGO/Data/Extras.swift:170) | Quitar destellos y llama de los títulos; mantener el texto. Un SVG no se intercala como icono dentro de ese título. |

Los iconos de navegación, buscar, cerrar, audio, reproducción y ajustes provienen de Hugeicons SVG (`HI` / `HugeIcon` en `KanaGO/Design/Theme.swift:106`). No son emojis. Los widgets usan pets propios y algunos símbolos de interfaz de Apple, que tampoco son emojis. Esta propuesta cubre los emojis encontrados; sustituir esas bibliotecas sería otra decisión de diseño.

Los caracteres japoneses de las unidades y la estrella tipográfica de los ejercicios JLPT son contenido de aprendizaje. No necesitan imágenes nuevas para cumplir la preferencia de eliminar emojis.

## Dirección visual recomendada

Recomiendo objetos sticker para los temas (libro, ramen, mapa...) y Kana-chan para los gestos (saludar, reverencia, pensar...). Así los objetos siguen siendo claros en tamaños pequeños y las emociones comparten la mascota existente.

Dos alternativas: hacer todos los temas con Kana-chan y accesorios daría más presencia a la mascota, pero perdería claridad a 30 pt; dibujar un SVG por cada emoji exigiría 120 variantes aunque varios conceptos sean iguales. El catálogo propuesto reúne calendarios, tren/estación, lupa izquierda/derecha y otras variantes repetidas, manteniendo temas distintos como banco, hotel y hospital.

Con esa agrupación: **101 dibujos nuevos** (97 objetos/retratos y 4 poses nuevas), más **8 assets existentes reutilizados**. Las banderas y los emojis de texto se resuelven sin generar imágenes adicionales.

### Referencias para adjuntar al generador

- Mascota, forma y ojos: [pet.happy.svg](/Users/manudev/Dev/kanago/KanaGO/Assets.xcassets/Pets/pet.happy.imageset/pet.happy.svg).
- Mascota, rizo y manos: [pet.love.svg](/Users/manudev/Dev/kanago/KanaGO/Assets.xcassets/Pets/pet.love.imageset/pet.love.svg).
- Objeto sticker, color y contorno: [sticker.sun.svg](/Users/manudev/Dev/kanago/KanaGO/Assets.xcassets/Stickers/sticker.sun.imageset/sticker.sun.svg).
- Objeto sticker, volumen con colores planos: [sticker.heart.svg](/Users/manudev/Dev/kanago/KanaGO/Assets.xcassets/Stickers/sticker.heart.imageset/sticker.heart.svg).

Adjunta las referencias junto al prompt; el nombre Kana-chan por sí solo no comunica el diseño. Los objetos existentes usan contornos de color y borde blanco de sticker; los personajes usan borde negro y no llevan borde blanco exterior. Mantener esa diferencia.

### Prompt base A: objetos sticker

Copiar este bloque y añadir la descripción del dibujo de la tabla. Cada petición produce un único icono.

```text
Crea un único icono original para KanaGO, una app de aprendizaje de japonés. Usa las referencias adjuntas de sticker.sun y sticker.heart como guía de familia visual: ilustración vectorial plana tipo sticker japonés, formas regordetas, curvas suaves, silueta clara, contornos gruesos de un tono más oscuro que el relleno, detalles mínimos de tinta y un borde blanco fino siguiendo únicamente la silueta exterior. Colores principales: rosa chicle #FF6F9C, amarillo cálido #FCD28D o #F5D57E, azul cielo #5EC5FA, crema #FCF4E6 y tinta #1D1D1D; naranja y verde menta solo cuando lo requiera el objeto. Máximo cinco colores de relleno por icono, más blanco y tinta, y un pequeño brillo plano de color sólido. Mantén el mismo grosor de contornos y el mismo volumen aparente en toda la colección. Objeto grande, centrado, completo y con margen de seguridad del 10% en un lienzo cuadrado. Debe reconocerse a 30 px. Fondo totalmente transparente. Sin fondo blanco, cuadrícula de transparencia dibujada, sombras externas, degradados, texturas, 3D, fotorrealismo, marcas, texto, letras o cifras salvo indicación expresa. No copiar el dibujo de un emoji de Apple o Google. Entregar un solo icono, sin mockup, marco, cuadrícula de iconos ni lámina de variantes.
Objeto a dibujar: [añadir aquí la descripción de la tabla].
```

### Prompt base B: personajes de tinta

Usar este bloque para `pet.bow`, `pet.offer`, `pet.thinking`, `pet.silent` y también los retratos `sticker.family` y `sticker.senior`.

```text
Crea una nueva ilustración de Kana-chan conservando fielmente las referencias adjuntas: mascota kawaii de tinta negra con cuerpo rechoncho en forma de gota/onigiri redondeado, punta pequeña inclinada hacia arriba a la derecha, cuerpo casi negro #1D1D1D, contorno negro grueso, un brillo gris plano, rizo rosa #F28CA8 en la frente, ojos blancos grandes expresivos con detalles negros y manos diminutas gris oscuro. Dibujo vectorial plano tipo sticker japonés. Accesorios limitados a rosa #FF6F9C, amarillo cálido #FCD28D, azul cielo #5EC5FA y crema #FCF4E6. Mismas proporciones, forma de ojos y grosor de contorno que las referencias. Una sola ilustración compacta, centrada, completa, con margen del 10% y fondo transparente. Sin borde blanco exterior, sombras externas, degradados, texturas, 3D, fotorrealismo, texto, letras, números o mascota de otra especie. No cortar el cuerpo ni las manos. Diseñar para una cabecera de interfaz de 30 a 64 px.
Pose o personajes: [añadir aquí la descripción de la tabla].
```

### Si la herramienta genera código SVG

Añadir al final del prompt:

```text
Devuelve un SVG vectorial real con xmlns, width="512", height="512" y viewBox="0 0 512 512". Usa paths y formas simples, colores planos opacos, stroke-linecap="round" y stroke-linejoin="round" cuando haya trazos. Sin elementos image, imágenes raster incrustadas, enlaces externos, filtros, scripts, fuentes, fondo rectangular ni formas fuera del viewBox. Convierte cualquier símbolo necesario a paths. Mantén todo el dibujo dentro del margen de seguridad.
```

Si la herramienta solo genera imágenes, el resultado será PNG aunque se pida SVG. Generar un PNG transparente de al menos 1024 px y después vectorizar o redibujar; renombrar PNG a SVG no lo convierte en vector. Para la entrega final usar los nombres del catálogo, un archivo independiente por dibujo.

## Primera tanda: las pantallas más visibles

Estos 12 dibujos cubren las tarjetas principales de Inicio/Viaje, Canciones, el combo y los primeros temas de Historias y Conversaciones. Son la primera tanda recomendada; el catálogo completo sigue debajo.

| Archivo a entregar | Descripción para añadir al prompt base |
|---|---|
| `sticker.book.svg` | Un libro abierto de páginas crema, tapas rosa chicle gruesas y lomo redondeado. Dos trazos de tinta amplios sugieren contenido sin letras legibles. Vista frontal ligeramente inclinada, una sola silueta compacta. |
| `sticker.mic.svg` | Un micrófono de karaoke inclinado ligeramente a la derecha, mango rosa chicle, cabeza de rejilla crema con tres líneas gruesas de tinta y un pequeño brillo amarillo. Un único objeto, sin pedestal ni cable. |
| `sticker.ramen.svg` | Un cuenco de ramen rosa chicle con borde grueso, fideos crema, un pequeño huevo amarillo y dos palillos oscuros. Dos curvas amplias de vapor encima. Simplificar los ingredientes para conservar legibilidad a 30 px. |
| `sticker.shopping.svg` | Una bolsa de compras rosa con asas redondeadas color tinta y un pequeño pliegue lateral más oscuro. Frente liso, sin logotipo, sin texto y sin objetos saliendo de la bolsa. |
| `sticker.map.svg` | Un mapa plegado de tres paneles color crema, una ruta gruesa azul cielo y un único pin rosa. Sin calles pequeñas, nombres, brújula adicional ni texto. La silueta de los pliegues debe ser muy clara. |
| `sticker.hotel.svg` | Un hotel pequeño y compacto con fachada crema, tejado rosa, puerta azul y tres ventanas grandes. Un letrero redondeado sin texto y una pequeña luna amarilla sugieren alojamiento. Sin paisaje ni edificios secundarios. |
| `sticker.medicine.svg` | Una cápsula grande inclinada, mitad rosa chicle y mitad crema, con contorno grueso y un único brillo pequeño. Una sola cápsula, sin caja, cruz médica ni texto. |
| `sticker.airplane.svg` | Un avión compacto de fuselaje crema y alas rosa chicle, visto desde arriba en diagonal ascendente. Ventanillas reducidas a dos marcas oscuras amplias. Sin nubes, mundo, estela ni texto. |
| `sticker.fire.svg` | Una llama compacta de tres puntas redondeadas, naranja por fuera y amarillo cálido por dentro. Silueta gruesa, alegre y legible a 18 px. Sin cara, números, humo ni múltiples llamas. |
| `sticker.clock.svg` | Un reloj despertador redondo amarillo cálido, dos campanas rosa y esfera crema. Dos manecillas color tinta y dos marcas grandes; no números. Patas cortas, silueta compacta y una sola línea de movimiento opcional. |
| `sticker.family.svg` | Tres pequeños personajes de tinta de la familia visual de Kana-chan: dos grandes a los lados y uno pequeño delante, unidos en una silueta compacta. Cada uno tiene cuerpo negro redondeado, ojos blancos y pequeño rizo rosa; sin ropa compleja ni estereotipos de género. Aplicar el estilo de personaje, sin borde blanco exterior. |
| `sticker.cart.svg` | Un carrito de supermercado con cesta azul cielo de tres huecos amplios, mango rosa y dos ruedas oscuras grandes. Una bolsa crema dentro, sin productos diminutos ni texto. |

## Assets existentes que se pueden reutilizar

| Asset | Reemplazo propuesto |
|---|---|
| `sticker.sun` | Sol / clima soleado. |
| `sticker.heart` | Corazón / emociones. |
| `sticker.sign` | Aviso / deber / consejo. |
| `sticker.crown` | Trofeo / logro. |
| `pet.wave` | Saludo / pedir atención. |
| `pet.study` | Acción / verbos en movimiento. |
| `pet.party` | Voluntad / entusiasmo. |
| `pet.meh` | Sin querer / incomodidad. |

Los pets existentes de esta tabla requieren comprobar visualmente su legibilidad en cabeceras pequeñas al integrarlos. Si un accesorio se pierde a 30 pt, conviene ajustar el tamaño de la imagen o usar un objeto simple para esa unidad. `sticker.water`, `sticker.party`, `sticker.brokenheart`, los otros pets y el confeti ya son dibujos propios y se conservan como referencias del sistema.

## Catálogo completo de prompts

Combinar el prompt base A o B con la descripción correspondiente. Los 12 dibujos de la primera tanda están incluidos aquí; no son una tanda adicional. Los usos muestran ejemplos; las tablas finales indican todos los registros cubiertos.

| Archivo | Base | Descripción específica | Usos detectados |
|---|---|---|---|
| `sticker.book.svg` | A | Un libro abierto de páginas crema, tapas rosa chicle gruesas y lomo redondeado. Dos trazos de tinta amplios sugieren contenido sin letras legibles. Vista frontal ligeramente inclinada, una sola silueta compacta. | Inicio: Historias; Ruta: Experiencia Pasada (~たことがある). |
| `sticker.mic.svg` | A | Un micrófono de karaoke inclinado ligeramente a la derecha, mango rosa chicle, cabeza de rejilla crema con tres líneas gruesas de tinta y un pequeño brillo amarillo. Un único objeto, sin pedestal ni cable. | Inicio: Canciones; fuente de palabras guardadas. |
| `sticker.ramen.svg` | A | Un cuenco de ramen rosa chicle con borde grueso, fideos crema, un pequeño huevo amarillo y dos palillos oscuros. Dos curvas amplias de vapor encima. Simplificar los ingredientes para conservar legibilidad a 30 px. | Inicio: restaurante; Ruta: Menú y Comidas; Historia: En el restaurante; Conversación: En el restaurante. |
| `sticker.shopping.svg` | A | Una bolsa de compras rosa con asas redondeadas color tinta y un pequeño pliegue lateral más oscuro. Frente liso, sin logotipo, sin texto y sin objetos saliendo de la bolsa. | Inicio: compras; Ruta: Tiendas y Objetos. |
| `sticker.map.svg` | A | Un mapa plegado de tres paneles color crema, una ruta gruesa azul cielo y un único pin rosa. Sin calles pequeñas, nombres, brújula adicional ni texto. La silueta de los pliegues debe ser muy clara. | Inicio: direcciones; Ruta: Partículas に, で, へ, と. |
| `sticker.hotel.svg` | A | Un hotel pequeño y compacto con fachada crema, tejado rosa, puerta azul y tres ventanas grandes. Un letrero redondeado sin texto y una pequeña luna amarilla sugieren alojamiento. Sin paisaje ni edificios secundarios. | Inicio: hotel; Conversación: En el hotel. |
| `sticker.medicine.svg` | A | Una cápsula grande inclinada, mitad rosa chicle y mitad crema, con contorno grueso y un único brillo pequeño. Una sola cápsula, sin caja, cruz médica ni texto. | Inicio: salud; Conversación: En la farmacia. |
| `sticker.airplane.svg` | A | Un avión compacto de fuselaje crema y alas rosa chicle, visto desde arriba en diagonal ascendente. Ventanillas reducidas a dos marcas oscuras amplias. Sin nubes, mundo, estela ni texto. | Inicio y selector Viaje; Ruta: Aeropuerto y Hotel; Historia: Estudiar en el extranjero; Conversación: En el aeropuerto. |
| `sticker.fire.svg` | A | Una llama compacta de tres puntas redondeadas, naranja por fuera y amarillo cálido por dentro. Silueta gruesa, alegre y legible a 18 px. Sin cara, números, humo ni múltiples llamas. | Quiz: combo de aciertos. |
| `sticker.clock.svg` | A | Un reloj despertador redondo amarillo cálido, dos campanas rosa y esfera crema. Dos manecillas color tinta y dos marcas grandes; no números. Patas cortas, silueta compacta y una sola línea de movimiento opcional. | Ruta: La Hora; Ruta: Horas y Fechas; Ruta: En el momento de (sai ni); Historia: Mi rutina matutina. |
| `sticker.family.svg` | B | Tres pequeños personajes de tinta de la familia visual de Kana-chan: dos grandes a los lados y uno pequeño delante, unidos en una silueta compacta. Cada uno tiene cuerpo negro redondeado, ojos blancos y pequeño rizo rosa; sin ropa compleja ni estereotipos de género. Aplicar el estilo de personaje, sin borde blanco exterior. | Ruta: Mi Familia; Ruta: Familia y Personas; Historia: Mi familia. |
| `sticker.store.svg` | A | Una pequeña tienda japonesa con toldo rosa y crema a rayas gruesas, una ventana azul y puerta redondeada. Fachada simple, sin marcas, letras ni productos en miniatura. | Historia: En la tienda de conveniencia. |
| `sticker.art.svg` | A | Una paleta de pintura crema con tres manchas grandes rosa, azul y amarillo, acompañada de un pincel corto rosa cruzado por detrás. Formas suaves, agujero de la paleta bien definido, sin detalles finos. | Ruta: Hobbies y Tiempo Libre; Ruta: Colores y Descripción; Historia: Mi pasatiempo. |
| `sticker.calendar.svg` | A | Un calendario de una sola hoja con dos anillas oscuras, cabecera rosa y cuerpo crema. Una cuadrícula de seis casillas grandes y una casilla resaltada azul; sin números, días ni letras. Silueta cuadrada con esquinas blandas. | Ruta: Reservar Mesa; Ruta: Días y Semanas; Ruta: Rutinas y Hábitos; Historia: Planes para el fin de semana. |
| `sticker.beach.svg` | A | Una pequeña isla de arena crema con una sombrilla rosa y amarilla y una única ola azul. Composición compacta dentro de una silueta sencilla, sin horizonte, personas, cielo ni fondo rectangular. | Historia: Un día en la playa. |
| `sticker.books.svg` | A | Dos libros gruesos apilados, uno rosa y uno azul cielo, con páginas crema y un marcador amarillo que sobresale ligeramente. Sin títulos, letras ni lomos finos. | Ruta: No es otra cosa que (~にほかならない / ~にすぎない); Historia: Comprando un libro nuevo; Conversación: En la biblioteca. |
| `sticker.snow.svg` | A | Un copo de nieve azul cielo de seis brazos gruesos y redondeados, centro ancho y simétrico. Un pequeño brillo crema, sin paisaje, caras ni copos secundarios. | Historia: La primera nieve. |
| `sticker.cart.svg` | A | Un carrito de supermercado con cesta azul cielo de tres huecos amplios, mango rosa y dos ruedas oscuras grandes. Una bolsa crema dentro, sin productos diminutos ni texto. | Historia: En el supermercado; Conversación: En la tienda. |
| `sticker.sakura.svg` | A | Una sola flor de cerezo de cinco pétalos rosa chicle redondeados, centro amarillo cálido y tres marcas cortas amplias. Sin rama, paisaje, letras ni flores adicionales. | Historia: Mi estación favorita. |
| `sticker.tokyo.svg` | A | Una Torre de Tokio simplificada con estructura naranja y crema, base ancha y punta corta redondeada. Usar pocos segmentos grandes, sin entramado fino, ciudad de fondo ni cielo. | Historia: Perdido en Tokio. |
| `sticker.cooking.svg` | A | Una sartén oscura de borde grueso con mango rosa corto y un huevo de clara crema y yema amarilla. Vista desde arriba ligeramente inclinada. Sin cocina, fuego ni ingredientes secundarios. | Historia: Cocinando por primera vez. |
| `sticker.briefcase.svg` | A | Un maletín rosa chicle compacto, asa color tinta gruesa, cierre amarillo y dos esquinas redondeadas. Una sola pieza, sin papeles, letras, logotipo ni escena de oficina. | Ruta: Trabajo y Oficina; Historia: La entrevista de trabajo; Conversación: En la oficina; Conversación: Entrevista de trabajo. |
| `sticker.senior.svg` | B | Un retrato compacto de una persona mayor de la familia de Kana-chan: cuerpo de tinta negro, ojos blancos amables, rizo rosa, pequeño moño gris y gafas grandes crema. Expresión cálida y digna, sin caricatura de fragilidad. Aplicar estilo de personaje, sin borde blanco exterior. | Historia: La sociedad envejecida. |
| `sticker.autumn.svg` | A | Dos hojas otoñales superpuestas, una naranja cálida y una amarilla, con tallos oscuros cortos y una sola nervadura amplia. Silueta suave, ligera inclinación de caída, sin árbol ni paisaje. | Ruta: Estaciones; Historia: La filosofía de la impermanencia. |
| `sticker.handshake.svg` | A | Dos manos pequeñas y redondeadas como las manos de Kana-chan estrechándose, una gris tinta y otra gris algo más claro, con puños rosa y azul. Simplificar dedos a dos curvas amplias, sin brazos largos ni anatomía realista. | Ruta: Conocer Personas; Ruta: Donación de Acciones; Ruta: Keigo: Lenguaje Honorífico; Conversación: Presentaciones. |
| `sticker.station.svg` | A | El frente de un tren japonés compacto, cuerpo crema, franja rosa, parabrisas azul y dos faros amarillos grandes. Dos pequeños segmentos de raíl debajo, sin estación, paisaje ni texto. | Ruta: Trenes y Estaciones; Conversación: En la estación. |
| `sticker.shirt.svg` | A | Una camiseta rosa chicle con mangas cortas redondeadas, cuello crema y una única costura oscura amplia. Forma simétrica y compacta, sin percha, dibujo ni logotipo. | Ruta: Tallas y Colores; Conversación: Comprando ropa. |
| `sticker.phone.svg` | A | Un auricular telefónico rosa curvado de extremos gruesos y redondeados, dos pequeñas ondas azules de llamada a un lado. Sin teclado, móvil, cable ni números. | Conversación: Haciendo una reserva; Conversación: Llamada de negocios. |
| `sticker.home.svg` | A | Una casita compacta de fachada crema, tejado rosa grueso, una ventana azul y puerta amarilla. Perspectiva frontal sencilla, sin jardín, personas, números ni letras. | Ruta: Mi Casa; Ruta: Casa y Habitaciones; Conversación: Con el vecino; Conversación: Buscar apartamento. |
| `sticker.festival.svg` | A | Dos pequeñas banderas japonesas crema con círculo rosa, cruzadas sobre palos cortos color tinta, con una sola estrella amarilla al lado para sugerir festival. Geometría gruesa y compacta, sin paisaje ni textos. | Ruta: Medios y Entretenimiento; Conversación: Planes para el fin de semana. |
| `sticker.bank.svg` | A | Un pequeño banco de fachada crema con tejado triangular rosa, dos columnas anchas y una moneda amarilla grande sobre la entrada. Sin palabras, cifras, símbolos monetarios ni detalles arquitectónicos finos. | Conversación: Abrir cuenta bancaria. |
| `sticker.cityhall.svg` | A | Un ayuntamiento compacto color crema con tejado triangular rosa, tres columnas anchas azul claro y escalón amarillo. Silueta sencilla, sin moneda, bandera, inscripciones ni ventanas diminutas. | Conversación: Trámites en el ayuntamiento. |
| `sticker.clipboard.svg` | A | Una tabla portapapeles rosa con hoja crema y pinza amarilla redondeada. Dos líneas oscuras amplias y una casilla azul; sin letras, firmas ni texto legible. | Ruta: En cuanto a / Respecto a (~において / ~に関して); Conversación: Atención al cliente — Reclamación. |
| `sticker.document.svg` | A | Una sola hoja crema de esquinas suaves y borde rosa, una esquina doblada azul y tres líneas gruesas color tinta. Sin letras legibles, logotipos, sello ni hojas adicionales. | Ruta: Ser y Estar (Desu); Conversación: Contrato de seguro. |
| `sticker.package.svg` | A | Una caja de cartón crema con cinta rosa ancha, dos caras visibles y una pequeña etiqueta azul sin texto. Bordes suaves, sin flechas, dirección, marcas ni objetos saliendo. | Conversación: Empresa de mudanzas. |
| `sticker.school.svg` | A | Una escuela pequeña de fachada crema, tejado rosa, puerta azul y dos ventanas grandes amarillas. Un pequeño reloj sin cifras centrado sobre la puerta distingue la escuela. Sin niños, texto ni patio. | Conversación: Reunión de padres y maestros. |
| `sticker.hospital.svg` | A | Un hospital compacto crema con tejado rosa, puerta azul y una cruz rosa grande en un panel crema. Dos ventanas grandes, sin ambulancia, letras ni escena exterior. | Ruta: Salud y Hospital; Conversación: Consulta médica detallada; Conversación: En el médico. |
| `sticker.office.svg` | A | Un edificio de oficinas compacto con fachada azul cielo, cuatro ventanas crema grandes y entrada rosa. Forma alta pero redondeada, sin perspectiva compleja, skyline ni texto. | Ruta: Teineigo y Situaciones Formales; Conversación: Entrevista para ejecutivo. |
| `sticker.graduation.svg` | A | Un birrete de graduación color tinta con borla rosa y pequeño brillo amarillo. Volumen sugerido con dos planos de color, sin diploma, cabeza humana, texto ni universidad de fondo. | Ruta: Patrones de Alto Nivel (~ともなると / ~とあれば); Conversación: Presentación académica — Q&A. |
| `sticker.balance.svg` | A | Una balanza amarilla cálida de pie corto, dos platillos crema grandes y soporte rosa. Simétrica, gruesa y redondeada, sin libros, martillo ni inscripciones. | Ruta: Culpa y Gratitud (~せいだ / ~おかげだ); Ruta: Deber / Inevitabilidad (~べき / ~ざるをえない); Conversación: Consulta legal. |
| `sticker.leaf.svg` | A | Una ramita de tres hojas grandes verde menta suave, tallo grueso verde más oscuro y un pequeño brillo crema. Silueta curva y compacta, sin tierra, maceta, paisaje ni letras. | Conversación: Debate medioambiental. |
| `sticker.folder.svg` | A | Una carpeta rosa con una pestaña azul y una hoja crema que asoma ligeramente. Pocos planos amplios, esquinas suaves, sin documentos diminutos, etiquetas ni texto. | Conversación: Coordinación interna en empresa. |
| `sticker.scroll.svg` | A | Un pergamino crema con extremos enrollados grandes y dos líneas amplias color tinta. Un pequeño lazo rosa en la base, sin letras legibles, sello, firma ni ornamentación complicada. | Ruta: Literatura y Expresiones Clásicas; Conversación: Contrato de bienes raíces. |
| `sticker.stethoscope.svg` | A | Un estetoscopio de tubo rosa grueso en forma de U, extremos crema y cápsula redonda azul. Composición compacta, sin persona, texto, anatomía ni manguera larga enredada. | Conversación: Dilema ético médico. |
| `sticker.globe.svg` | A | Un globo azul cielo con dos masas de tierra verde menta grandes y un aro o soporte rosa corto. Geografía sugerida de forma sencilla, sin nombres, banderas, mapas detallados ni líneas finas. | Ruta: Préstamos; Ruta: En torno a / A propósito de (~をめぐって / ~にあたって); Conversación: Debate sobre diferencias culturales. |
| `sticker.postbox.svg` | A | Un buzón japonés compacto rosa con ranura oscura ancha y tapa crema redondeada. Un pequeño sobre azul en el frente sin letras. Sin dirección, marcas postales ni fondo. | Conversación: En el correo. |
| `sticker.flower.svg` | A | Un sello floral de cinco pétalos redondeados rosa, centro crema y un pequeño círculo amarillo. Contorno grueso, vista frontal, sin kanji, letras ni textura de estampado. Debe distinguirse de la flor de cerezo por su forma de sello compacto. | Ruta: Dakuten y Combinaciones. |
| `pet.bow.svg` | B | Kana-chan inclinándose hacia delante en una reverencia amable, ojos cerrados en dos curvas blancas, manos diminutas juntas delante y rizo rosa visible. Silueta baja y compacta, sin texto, corazones, fondo ni ropa compleja. | Ruta: Cortesía Japonesa; Ruta: Introducción al Keigo; Ruta: Sonkeigo Completo. |
| `pet.offer.svg` | B | Kana-chan mirando con amabilidad y extendiendo las dos pequeñas manos hacia delante, sosteniendo una tarjetita crema sin texto. Ojos blancos suaves, rizo rosa visible, gesto de ofrecimiento respetuoso; un solo accesorio. | Ruta: Kenjōgo Completo. |
| `pet.thinking.svg` | B | Kana-chan con una pequeña mano en la barbilla, ojos blancos mirando hacia arriba y una ceja redondeada. Una pequeña burbuja vacía azul encima a la derecha. Expresión curiosa y amable, sin signo de pregunta ni texto. | Ruta: Quizás y Probablemente (~かもしれない / ~はずだ / ~だろう). |
| `pet.silent.svg` | B | Kana-chan con ojos blancos ligeramente preocupados y boca cerrada como una pequeña línea crema. Una mano diminuta delante de la boca sugiere reserva; sin cremallera, letras ni accesorios adicionales. | Ruta: Intentar / No poder (~ようとする / ~かねる). |
| `sticker.id.svg` | A | Una tarjeta de identificación crema de esquinas redondeadas, franja rosa superior, pequeño retrato de la silueta negra de Kana-chan y dos trazos azules amplios. Sin letras, números, código de barras ni datos personales. | Ruta: Presentación Básica. |
| `sticker.drinks.svg` | A | Una botella pequeña crema de cuello corto y etiqueta rosa sin texto, junto a una taza baja azul cielo. Formas anchas y compactas, sin logotipos, letras, líquido transparente ni escena de mesa. | Ruta: Bebidas y Más. |
| `sticker.money.svg` | A | Un monedero rosa redondeado y dos monedas amarillas grandes parcialmente superpuestas. Cierre color tinta, sin signos de moneda, números, billetes detallados ni texto. | Ruta: La Cuenta, por favor; Ruta: Preguntar el Precio. |
| `sticker.numbers.svg` | A | Un ábaco pequeño de marco rosa con dos varillas oscuras gruesas y cuatro cuentas grandes amarillas y azules. Silueta simple y compacta, sin cifras, letras ni muchas piezas pequeñas. | Ruta: Números 1-100; Ruta: Contadores Japoneses. |
| `sticker.pin.svg` | A | Un pin de ubicación rosa chicle con cabeza redonda, hueco crema grande y punta suavemente redondeada. Una sola forma vertical compacta, sin mapa, ciudad, letra ni números. | Ruta: ¿Dónde está...?. |
| `sticker.sunrise.svg` | A | Un medio sol amarillo asomando detrás de una línea de horizonte rosa gruesa, con tres rayos cortos redondeados. Composición compacta, sin paisaje, mar, nubes ni fondo rectangular. | Ruta: Saludos del Día. |
| `sticker.bento.svg` | A | Una cajita de bento rosa con tres compartimentos grandes: arroz crema, un círculo amarillo y una hoja verde menta. Vista cenital ligera, sin muchos ingredientes, palillos, letras ni mantel. | Ruta: Sabores y Texturas. |
| `sticker.card.svg` | A | Una tarjeta bancaria rosa redondeada con un chip crema grande y una sola franja azul. Sin números, logos, nombre, firma ni símbolos de marca. | Ruta: Pagar y Cambio. |
| `sticker.gift.svg` | A | Una cajita de regalo rosa con cinta amarilla ancha y lazo de dos bucles suaves grandes. Sin estampado, etiquetas, letras ni regalos adicionales. | Ruta: Regalos y Souvenirs; Ruta: Deseos y Necesidades; Ruta: Dar y Recibir (あげる / もらう / くれる). |
| `sticker.compass.svg` | A | Una brújula redonda crema de borde rosa grueso, una aguja azul y amarilla y cuatro marcas grandes color tinta. Sin letras cardinales, números ni mapa. | Ruta: Direcciones Básicas. |
| `sticker.taxi.svg` | A | Un taxi japonés compacto amarillo con ventanas azul cielo y ruedas oscuras grandes. Un pequeño letrero crema sin texto en el techo, sin carretera, conductor, números ni paisaje. | Ruta: Taxi y Autobús. |
| `sticker.coffee.svg` | A | Una taza crema de asa rosa grande con líquido oscuro y dos curvas de vapor gruesas. Plato rosa opcional muy pequeño, sin cara, palabras, café derramado ni escena de mesa. | Ruta: Rutina Diaria. |
| `sticker.particles.svg` | A | Tres pequeñas fichas redondeadas rosa, azul y crema conectadas por dos enlaces oscuros gruesos, formando una unidad compacta. Cada ficha lleva una única marca abstracta simple; sin letras falsas, palabras ni tipografía. | Ruta: Partículas は, が, を. |
| `sticker.question.svg` | A | Un signo de pregunta azul cielo grueso y curvado, punto redondo separado y un brillo crema pequeño. Misma familia visual del sticker de exclamación existente; sin cara ni símbolos adicionales. | Ruta: Posesión (の) y Preguntas (か); Ruta: Condición con ~たら. |
| `sticker.meal.svg` | A | Un plato crema de borde rosa con un tenedor y una cuchara amarillos de mangos cortos a los lados. Una sola composición compacta, sin comida minúscula, mantel ni texto. | Ruta: Verbos Grupo 2 (RU-verbs). |
| `sticker.hourglass.svg` | A | Un reloj de arena de marco rosa ancho, bulbos azul cielo y arena amarilla en dos triángulos redondeados. Sin cristal realista, transparencias complejas, cifras ni textura. | Ruta: Forma Presente y Pasada. |
| `sticker.rainbow.svg` | A | Un arcoíris de tres bandas anchas rosa, amarillo y azul cielo, con dos nubes crema pequeñas en la base. Forma redondeada compacta, sin cielo, paisaje, caras ni fondo rectangular. | Ruta: Adjetivos -i. |
| `sticker.sparkles.svg` | A | Dos destellos de cuatro puntas blandas: uno amarillo grande y uno azul cielo pequeño. Mantenerlos próximos en una silueta compacta, con un único brillo crema. Sin degradado, polvo de partículas ni fondo. | Ruta: Adjetivos -na. |
| `sticker.body.svg` | A | Una figura humana muy simplificada rosa, cabeza redonda, torso ancho y brazos y piernas cortos redondeados. Vista frontal, sin rasgos faciales, anatomía detallada, ropa, texto ni atributos de género. | Ruta: El Cuerpo Humano. |
| `sticker.search.svg` | A | Una lupa de aro rosa grueso, lente azul cielo opaca clara y mango amarillo corto. Un único brillo crema; vista diagonal compacta, sin texto, ojo, objetos dentro ni reflejos realistas. | Ruta: ¿Qué, Quién, Dónde?; Ruta: Parece que... (~ようだ / ~そうだ / ~らしい). |
| `sticker.chat.svg` | A | Una burbuja de conversación rosa redondeada con cola corta y tres puntos crema grandes en su interior. Sin letras, retrato, burbujas múltiples ni contorno fino. | Ruta: ¿Cuánto, Cuál, Cómo?; Ruta: Dicen que (~rashii). |
| `sticker.stop.svg` | A | Una señal de prohibición rosa intensa con aro grueso y barra diagonal redondeada sobre centro crema. Sin texto, octágono adicional, poste largo ni objeto prohibido dentro. | Ruta: Permiso y Prohibición; Ruta: Inflexibilidad (bekarazu / majiki). |
| `sticker.link.svg` | A | Dos eslabones grandes entrelazados de forma ovalada, uno rosa y otro azul cielo. Contornos amplios, inclinación diagonal, sin cadena larga, texturas ni reflejos metálicos. | Ruta: Forma -te; Ruta: Expresiones Compuestas. |
| `sticker.strength.svg` | A | Una pequeña mano y brazo gris tinta de la familia de Kana-chan flexionándose, con puño redondeado y una sola marca rosa de energía. Anatomía caricaturesca simple, sin músculos realistas ni múltiples rayos. | Ruta: Forma Potencial. |
| `sticker.branching.svg` | A | Una ruta gruesa rosa que se divide en dos flechas blandas, una rosa y una azul cielo. Cruce o bifurcación muy claro, pocos segmentos, sin letras, nodos diminutos ni diagrama complejo. | Ruta: Forma Condicional -ba; Ruta: Condición con ~なら y ~と. |
| `sticker.thought.svg` | A | Una nube de pensamiento crema de borde azul grueso con dos pequeñas burbujas redondas descendentes y un corazón rosa simple dentro. Una sola silueta compacta, sin palabras ni personaje. | Ruta: Querer Hacer (~たい). |
| `sticker.traffic.svg` | A | Un semáforo compacto con carcasa gris tinta, tres luces grandes rosa, amarillo y verde menta, pie corto rosa. Sin carretera, personas, números ni texto. | Ruta: Permiso y Prohibición (~てもいい / ~てはいけない). |
| `sticker.repeat.svg` | A | Dos flechas curvas anchas rosa y azul cielo que forman un círculo abierto. Puntas grandes redondeadas, centro vacío limpio, sin números, reloj, letras ni detalles adicionales. | Ruta: Acción en Curso (~ている); Ruta: Voz Pasiva. |
| `sticker.idea.svg` | A | Una bombilla amarilla redondeada de base rosa, un solo filamento oscuro amplio y dos rayos cortos suaves. Sin cristal realista, cables, texto ni rostro. | Ruta: Porque y Por eso (から / ので). |
| `sticker.weather.svg` | A | Un sol amarillo pequeño detrás de una nube crema grande de borde azul grueso. Composición compacta, dos rayos grandes, sin lluvia, paisaje ni cielo de fondo. | Ruta: Clima y Naturaleza. |
| `sticker.gear.svg` | A | Un engranaje azul cielo de seis dientes redondeados y hueco crema grande, con un pequeño segundo engranaje rosa parcialmente detrás. Formas gruesas, sin maquinaria, metal realista ni texto. | Ruta: Verbos Compuestos. |
| `sticker.probability.svg` | A | Una bola de cristal azul cielo opaca sobre una base rosa corta, con una estrella amarilla grande dentro. Un único brillo crema; sin humo, manos, mesa, degradado ni efectos luminosos. | Ruta: Probabilidad (~deshou). |
| `sticker.arrows.svg` | A | Dos flechas horizontales gruesas en direcciones opuestas, una rosa arriba y otra azul cielo abajo. Puntas blandas, espacios amplios, sin letras, cruces, números ni efectos de movimiento. | Ruta: Transitividad. |
| `sticker.pointing.svg` | A | Una mano pequeña gris tinta de la familia de Kana-chan con un dedo redondeado apuntando hacia arriba y puño rosa corto. Simplificar la forma, sin brazo largo, uñas ni anatomía realista. | Ruta: Voz Causativa. |
| `sticker.spiral.svg` | A | Una espiral azul cielo ancha de dos vueltas y media, centro abierto amplio, remate rosa corto. Silueta compacta, sin huracán realista, nube, ojo ni texto. | Ruta: Causativa-Pasiva. |
| `sticker.target.svg` | A | Una diana pequeña con dos anillos gruesos crema y rosa y una flecha corta azul clavada en el centro. Sin muchas líneas, números, arco ni soporte. | Ruta: Para + Verbo (~ために / ~ように). |
| `sticker.wave.svg` | A | Una ola azul cielo compacta de cresta curva y espuma crema en tres formas grandes, base corta de azul más oscuro. Sin paisaje, mar completo, gotas dispersas ni texto. | Ruta: Aunque, A pesar de (~のに / ~ても). |
| `sticker.theater.svg` | A | Dos pequeñas máscaras teatrales, una rosa sonriente y otra azul de expresión tranquila, con ojos como ranuras amplias y boca simple. Silueta compacta, sin caras humanas realistas, cintas largas ni texto. | Ruta: Como si (mitai na / youni). |
| `sticker.rain.svg` | A | Una nube crema de borde azul grueso y tres gotas azul cielo grandes debajo. Una sola silueta compacta y amable, sin paisaje, rayos, rostro ni fondo. | Ruta: A pesar de (noni / keredomo); Ruta: A pesar de que... (~にもかかわらず / ~ものの). |
| `sticker.puzzle.svg` | A | Dos piezas de rompecabezas grandes, rosa y amarillo, encajadas parcialmente. Bordes redondeados y conectores amplios, sin rompecabezas completo, caras ni números. | Ruta: Es por eso que... (~わけだ / ~わけではない). |
| `sticker.certainty.svg` | A | Una medalla redonda amarilla de borde rosa con una marca de verificación color tinta grande en el centro y dos cintas azules cortas. Sin números, letras, porcentaje ni texto. | Ruta: Sin duda (~に違いない / ~に決まっている). |
| `sticker.tag.svg` | A | Una etiqueta de papel crema con borde rosa, agujero azul grande y un cordón oscuro corto. Dos marcas amplias sugieren contenido; sin letras, precio, código de barras ni cifras. | Ruta: Como / En calidad de (~として / ~をはじめ). |
| `sticker.email.svg` | A | Un sobre crema de borde rosa con solapa triangular grande y una pequeña notificación azul en la esquina superior derecha. Sin arroba, letras, cifras, nombres ni pantalla detrás. | Ruta: Reuniones y Correos. |
| `sticker.news.svg` | A | Un periódico crema doblado, cabecera rosa ancha y dos columnas sugeridas por cuatro trazos oscuros gruesos. Un recuadro azul grande como fotografía, sin letras legibles ni detalles de impresión. | Ruta: Artículos y Noticias. |
| `sticker.infinity.svg` | A | Un símbolo de infinito de cinta gruesa, un bucle rosa y otro azul cielo, con unión central limpia y bordes blandos. Sin fondo, números, caras ni gradientes. | Ruta: Siempre que (kagiri). |
| `sticker.writing.svg` | A | Un lápiz rosa de punta color tinta sobre una hoja crema de borde azul, con un único trazo amplio recién dibujado. Sin mano humana, palabras, letras, firma ni varias herramientas. | Ruta: Vocabulario de Ensayo y Argumento. |
| `sticker.kanji-tiles.svg` | A | Cuatro fichas crema de borde rosa distribuidas en un bloque compacto de dos por dos. Cada ficha con una marca geométrica oscura simple, sin kanji inventados, palabras ni símbolos de mahjong. Las cuatro piezas deben verse como una unidad. | Ruta: Expresiones de Cuatro Kanji (四字熟語). |
| `sticker.listening.svg` | A | Unos auriculares rosa de diadema gruesa y almohadillas crema, con dos ondas de sonido azules cortas en el centro. Sin oreja realista, cabeza humana, micrófono, letras ni cable. | Ruta: Comprensión Auditiva Avanzada. |
| `sticker.bolt.svg` | A | Un rayo amarillo de tres segmentos cortos y puntas suavizadas, contorno naranja cálido y un único brillo crema. Una sola forma legible a 20 px, sin nubes, fondo ni chispas secundarias. | Ruta: Inmediatez (ya ina ya). |
| `sticker.wilted.svg` | A | Una pequeña flor rosa con cabeza inclinada hacia abajo y tallo verde menta curvado, una hoja grande y un pétalo que cae cerca. Expresión visual suave, sin rostro, lágrimas, texto ni escena triste. | Ruta: Lamento y Arrepentimiento. |

## Mapeo completo para la futura integración

Estos mapeos son propuestas por significado, no una sustitución automática carácter por carácter. Una misma imagen puede usarse en varios registros. Los nombres deben mantenerse iguales al entregar los archivos.

### Historias: 18 registros

Fuente: `KanaGO/Resources/Data/stories.json`. El dibujo se comparte entre Inicio, lista y lector.

| ID | Historia | Asset propuesto |
|---|---|---|
| `my-morning-routine` | Mi rutina matutina | `sticker.clock` |
| `the-weather-today` | El tiempo hoy | `sticker.sun` |
| `my-family` | Mi familia | `sticker.family` |
| `at-the-convenience-store` | En la tienda de conveniencia | `sticker.store` |
| `my-hobby` | Mi pasatiempo | `sticker.art` |
| `at-the-restaurant` | En el restaurante | `sticker.ramen` |
| `weekend-plans` | Planes para el fin de semana | `sticker.calendar` |
| `a-day-at-the-beach` | Un día en la playa | `sticker.beach` |
| `buying-a-new-book` | Comprando un libro nuevo | `sticker.books` |
| `the-first-snow` | La primera nieve | `sticker.snow` |
| `at-the-supermarket` | En el supermercado | `sticker.cart` |
| `my-favorite-season` | Mi estación favorita | `sticker.sakura` |
| `lost-in-tokyo` | Perdido en Tokio | `sticker.tokyo` |
| `cooking-for-the-first-time` | Cocinando por primera vez | `sticker.cooking` |
| `the-job-interview` | La entrevista de trabajo | `sticker.briefcase` |
| `studying-abroad` | Estudiar en el extranjero | `sticker.airplane` |
| `the-aging-society` | La sociedad envejecida | `sticker.senior` |
| `the-philosophy-of-impermanence` | La filosofía de la impermanencia | `sticker.autumn` |

### Conversaciones: 37 registros

Fuente: `KanaGO/Resources/Data/conversations.json`. Se comparte entre lista y cabecera de sesión. El índice es base cero y permite distinguir IDs que ya están repetidos en los datos actuales.

| Índice | ID | Conversación | Asset propuesto |
|---|---|---|---|
| 0 | `tienda` | En la tienda | `sticker.cart` |
| 1 | `restaurante` | En el restaurante | `sticker.ramen` |
| 2 | `presentaciones` | Presentaciones | `sticker.handshake` |
| 3 | `estacion` | En la estación | `sticker.station` |
| 4 | `hotel` | En el hotel | `sticker.hotel` |
| 5 | `ropa` | Comprando ropa | `sticker.shirt` |
| 6 | `doctor` | En la farmacia | `sticker.medicine` |
| 7 | `reserva` | Haciendo una reserva | `sticker.phone` |
| 8 | `aeropuerto` | En el aeropuerto | `sticker.airplane` |
| 9 | `oficina` | En la oficina | `sticker.briefcase` |
| 10 | `vecino` | Con el vecino | `sticker.home` |
| 11 | `planes` | Planes para el fin de semana | `sticker.festival` |
| 12 | `entrevista` | Entrevista de trabajo | `sticker.briefcase` |
| 13 | `banco` | Abrir cuenta bancaria | `sticker.bank` |
| 14 | `apartamento` | Buscar apartamento | `sticker.home` |
| 15 | `telefono-empresa` | Llamada de negocios | `sticker.phone` |
| 16 | `ayuntamiento` | Trámites en el ayuntamiento | `sticker.cityhall` |
| 17 | `reclamacion` | Atención al cliente — Reclamación | `sticker.clipboard` |
| 18 | `seguro` | Contrato de seguro | `sticker.document` |
| 19 | `mudanza` | Empresa de mudanzas | `sticker.package` |
| 20 | `reunion-escolar` | Reunión de padres y maestros | `sticker.school` |
| 21 | `medico-detallado` | Consulta médica detallada | `sticker.hospital` |
| 22 | `negociacion` | Negociación empresarial | `sticker.handshake` |
| 23 | `entrevista-ejecutivo` | Entrevista para ejecutivo | `sticker.office` |
| 24 | `qa-academico` | Presentación académica — Q&A | `sticker.graduation` |
| 25 | `asesoria-legal` | Consulta legal | `sticker.balance` |
| 26 | `debate-medioambiental` | Debate medioambiental | `sticker.leaf` |
| 27 | `coordinacion-interna` | Coordinación interna en empresa | `sticker.folder` |
| 28 | `contrato-inmobiliario` | Contrato de bienes raíces | `sticker.scroll` |
| 29 | `etica-medica` | Dilema ético médico | `sticker.stethoscope` |
| 30 | `diferencias-culturales` | Debate sobre diferencias culturales | `sticker.globe` |
| 31 | `biblioteca` | En la biblioteca | `sticker.books` |
| 32 | `correo` | En el correo | `sticker.postbox` |
| 33 | `entrevista` | Entrevista de trabajo | `sticker.briefcase` |
| 34 | `medico` | En el médico | `sticker.hospital` |
| 35 | `mudanza` | Buscando apartamento | `sticker.home` |
| 36 | `viaje` | Planeando un viaje | `sticker.airplane` |

### Ruta: 115 unidades con emojis

Fuente: `KanaGO/Resources/Data/roadmap.json`. Afecta a los encabezados de unidad. Los botones de lección ya usan SVG y no forman parte de este reemplazo.

#### Kana: 2 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `alpha-h-u4` | Dakuten y Combinaciones | `sticker.flower` |
| `alpha-k-u3` | Préstamos | `sticker.globe` |

#### Survival: 31 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `sv-s1-u1` | Hola y Adiós | `pet.wave` |
| `sv-s1-u2` | Cortesía Japonesa | `pet.bow` |
| `sv-s1-u3` | Presentación Básica | `sticker.id` |
| `sv-s2-u1` | Menú y Comidas | `sticker.ramen` |
| `sv-s2-u2` | Pedir Comida | `pet.wave` |
| `sv-s2-u3` | Bebidas y Más | `sticker.drinks` |
| `sv-s2-u4` | La Cuenta, por favor | `sticker.money` |
| `sv-s3-u1` | Números 1-100 | `sticker.numbers` |
| `sv-s3-u2` | Preguntar el Precio | `sticker.money` |
| `sv-s3-u3` | Tiendas y Objetos | `sticker.shopping` |
| `sv-s4-u1` | Trenes y Estaciones | `sticker.station` |
| `sv-s4-u2` | ¿Dónde está...? | `sticker.pin` |
| `sv-s1-u4` | Despedidas Variadas | `pet.wave` |
| `sv-s1-u5` | Saludos del Día | `sticker.sunrise` |
| `sv-s1-u6` | Conocer Personas | `sticker.handshake` |
| `sv-s2-u5` | Sabores y Texturas | `sticker.bento` |
| `sv-s2-u6` | Reservar Mesa | `sticker.calendar` |
| `sv-s3-u4` | Tallas y Colores | `sticker.shirt` |
| `sv-s3-u5` | Pagar y Cambio | `sticker.card` |
| `sv-s3-u6` | Regalos y Souvenirs | `sticker.gift` |
| `sv-s4-u3` | Direcciones Básicas | `sticker.compass` |
| `sv-s4-u4` | Taxi y Autobús | `sticker.taxi` |
| `sv-s4-u5` | Aeropuerto y Hotel | `sticker.airplane` |
| `sv-s5-u1` | La Hora | `sticker.clock` |
| `sv-s5-u2` | Días y Semanas | `sticker.calendar` |
| `sv-s5-u3` | El Clima | `sticker.sun` |
| `sv-s5-u4` | Estaciones | `sticker.autumn` |
| `sv-s6-u1` | Mi Familia | `sticker.family` |
| `sv-s6-u2` | Mi Casa | `sticker.home` |
| `sv-s6-u3` | Rutina Diaria | `sticker.coffee` |
| `sv-s6-u4` | Hobbies y Tiempo Libre | `sticker.art` |

#### N5: 18 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `n5-s4-u1` | Ser y Estar (Desu) | `sticker.document` |
| `n5-s4-u2` | Partículas は, が, を | `sticker.particles` |
| `n5-s4-u3` | Partículas に, で, へ, と | `sticker.map` |
| `n5-s4-u4` | Posesión (の) y Preguntas (か) | `sticker.question` |
| `n5-s5-u1` | Verbos Grupo 1 (U-verbs) | `pet.study` |
| `n5-s5-u2` | Verbos Grupo 2 (RU-verbs) | `sticker.meal` |
| `n5-s5-u3` | Forma Presente y Pasada | `sticker.hourglass` |
| `n5-s6-u1` | Adjetivos -i | `sticker.rainbow` |
| `n5-s6-u2` | Adjetivos -na | `sticker.sparkles` |
| `n5-s7-u1` | Familia y Personas | `sticker.family` |
| `n5-s7-u2` | Horas y Fechas | `sticker.clock` |
| `n5-s7-u3` | El Cuerpo Humano | `sticker.body` |
| `n5-s7-u4` | Casa y Habitaciones | `sticker.home` |
| `n5-s7-u5` | Colores y Descripción | `sticker.art` |
| `n5-s8-u1` | ¿Qué, Quién, Dónde? | `sticker.search` |
| `n5-s8-u2` | ¿Cuánto, Cuál, Cómo? | `sticker.chat` |
| `n5-s9-u1` | Permiso y Prohibición | `sticker.stop` |
| `n5-s9-u2` | Deseos y Necesidades | `sticker.gift` |

#### N4: 19 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `n4-s1-u1` | Forma -te | `sticker.link` |
| `n4-s1-u2` | Forma Potencial | `sticker.strength` |
| `n4-s1-u3` | Forma Volitiva | `pet.party` |
| `n4-s1-u4` | Forma Condicional -ba | `sticker.branching` |
| `n4-s2-u1` | Querer Hacer (~たい) | `sticker.thought` |
| `n4-s2-u2` | Permiso y Prohibición (~てもいい / ~てはいけない) | `sticker.traffic` |
| `n4-s2-u3` | Acción en Curso (~ている) | `sticker.repeat` |
| `n4-s2-u4` | Experiencia Pasada (~たことがある) | `sticker.book` |
| `n4-s2-u5` | Porque y Por eso (から / ので) | `sticker.idea` |
| `n4-s2-u6` | Consejo (~たほうがいい) y Deber (~なければならない) | `sticker.sign` |
| `n4-s4-u1` | Trabajo y Oficina | `sticker.briefcase` |
| `n4-s4-u2` | Salud y Hospital | `sticker.hospital` |
| `n4-s4-u3` | Clima y Naturaleza | `sticker.weather` |
| `n4-s4-u4` | Contadores Japoneses | `sticker.numbers` |
| `n4-s4-u5` | Verbos Compuestos | `sticker.gear` |
| `n4-s5-u1` | Donación de Acciones | `sticker.handshake` |
| `n4-s5-u2` | Introducción al Keigo | `pet.bow` |
| `n4-s6-u1` | Probabilidad (~deshou) | `sticker.probability` |
| `n4-s7-u1` | Transitividad | `sticker.arrows` |

#### N3: 17 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `n3-s1-u1` | Voz Pasiva | `sticker.repeat` |
| `n3-s1-u2` | Voz Causativa | `sticker.pointing` |
| `n3-s1-u3` | Causativa-Pasiva | `sticker.spiral` |
| `n3-s2-u1` | Condición con ~たら | `sticker.question` |
| `n3-s2-u2` | Condición con ~なら y ~と | `sticker.branching` |
| `n3-s3-u1` | Para + Verbo (~ために / ~ように) | `sticker.target` |
| `n3-s3-u2` | Parece que... (~ようだ / ~そうだ / ~らしい) | `sticker.search` |
| `n3-s3-u3` | Quizás y Probablemente (~かもしれない / ~はずだ / ~だろう) | `pet.thinking` |
| `n3-s4-u1` | Aunque, A pesar de (~のに / ~ても) | `sticker.wave` |
| `n3-s4-u2` | Dar y Recibir (あげる / もらう / くれる) | `sticker.gift` |
| `n3-s4-u3` | Sin querer / Terminar haciendo (~てしまう) | `pet.meh` |
| `n3-s6-u1` | Rutinas y Hábitos | `sticker.calendar` |
| `n3-s6-u2` | Emociones y Sentimientos | `sticker.heart` |
| `n3-s6-u3` | Medios y Entretenimiento | `sticker.festival` |
| `n3-s7-u1` | Dicen que (~rashii) | `sticker.chat` |
| `n3-s7-u2` | Como si (mitai na / youni) | `sticker.theater` |
| `n3-s8-u1` | A pesar de (noni / keredomo) | `sticker.rain` |

#### N2: 13 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `n2-s1-u1` | Es por eso que... (~わけだ / ~わけではない) | `sticker.puzzle` |
| `n2-s1-u2` | Sin duda (~に違いない / ~に決まっている) | `sticker.certainty` |
| `n2-s1-u3` | Culpa y Gratitud (~せいだ / ~おかげだ) | `sticker.balance` |
| `n2-s1-u4` | A pesar de que... (~にもかかわらず / ~ものの) | `sticker.rain` |
| `n2-s2-u1` | En cuanto a / Respecto a (~において / ~に関して) | `sticker.clipboard` |
| `n2-s2-u2` | Como / En calidad de (~として / ~をはじめ) | `sticker.tag` |
| `n2-s2-u3` | Intentar / No poder (~ようとする / ~かねる) | `pet.silent` |
| `n2-s3-u1` | Keigo: Lenguaje Honorífico | `sticker.handshake` |
| `n2-s3-u2` | Reuniones y Correos | `sticker.email` |
| `n2-s5-u1` | Artículos y Noticias | `sticker.news` |
| `n2-s5-u2` | Expresiones Compuestas | `sticker.link` |
| `n2-s6-u1` | En el momento de (sai ni) | `sticker.clock` |
| `n2-s6-u2` | Siempre que (kagiri) | `sticker.infinity` |

#### N1: 15 unidades

| ID | Unidad | Asset propuesto |
|---|---|---|
| `n1-s1-u1` | Deber / Inevitabilidad (~べき / ~ざるをえない) | `sticker.balance` |
| `n1-s1-u2` | No es otra cosa que (~にほかならない / ~にすぎない) | `sticker.books` |
| `n1-s1-u3` | En torno a / A propósito de (~をめぐって / ~にあたって) | `sticker.globe` |
| `n1-s1-u4` | Patrones de Alto Nivel (~ともなると / ~とあれば) | `sticker.graduation` |
| `n1-s2-u1` | Sonkeigo Completo | `pet.bow` |
| `n1-s2-u2` | Kenjōgo Completo | `pet.offer` |
| `n1-s2-u3` | Teineigo y Situaciones Formales | `sticker.office` |
| `n1-s4-u1` | Vocabulario de Ensayo y Argumento | `sticker.writing` |
| `n1-s4-u2` | Literatura y Expresiones Clásicas | `sticker.scroll` |
| `n1-s4-u3` | Expresiones de Cuatro Kanji (四字熟語) | `sticker.kanji-tiles` |
| `n1-s5-u1` | Comprensión Auditiva Avanzada | `sticker.listening` |
| `n1-s5-u2` | Simulacro JLPT N1 | `sticker.crown` |
| `n1-s6-u1` | Inflexibilidad (bekarazu / majiki) | `sticker.stop` |
| `n1-s6-u2` | Inmediatez (ya ina ya) | `sticker.bolt` |
| `n1-s7-u1` | Lamento y Arrepentimiento | `sticker.wilted` |

Las 16 unidades con kana o kanji mantienen su carácter de aprendizaje: `alpha-h-u1`, `alpha-h-u2`, `alpha-h-u3`, `alpha-k-u1`, `alpha-k-u2`, `n5-s3-u1`, `n5-s3-u2`, `n5-s3-u3`, `n4-s3-u1`, `n4-s3-u2`, `n3-s5-u1`, `n3-s5-u2`, `n2-s4-u1`, `n2-s4-u2`, `n1-s3-u1`, `n1-s3-u2`.

## Entrega de los archivos

- Un archivo por dibujo, por ejemplo `sticker.ramen.svg`, con el nombre exacto de la tabla.
- SVG real, fondo transparente y dibujo completo dentro del viewBox; también se puede revisar una primera versión PNG transparente antes de vectorizar.
- Tamaño de referencia 512 × 512, margen de seguridad aproximado del 10%, contornos consistentes y formas legibles a 30 px; `sticker.fire` debe funcionar también a 18 px.
- Para los objetos, adjuntar sol y corazón de referencia; para los personajes, adjuntar los pets. No generar una lámina con toda la colección, porque dificulta separar los assets y unificar el tamaño.
- Al integrar, usar imágenes independientes del texto y añadir etiquetas accesibles cuando el icono sea el único contenido de un control.
- Antes de dar por terminada la futura sustitución: revisar unidades, historias, conversaciones, idiomas, combo, fuentes de palabras antiguas, recordatorios y capturas de marketing en ambos idiomas.

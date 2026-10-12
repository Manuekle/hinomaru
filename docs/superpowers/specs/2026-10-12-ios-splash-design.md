# Splash iOS: secuencia aprobada

El usuario aprobó el 12 de octubre de 2026 rehacer directamente el splash nativo, como excepción a las instrucciones de transitions-agent, que no admite SwiftUI.

## Resultado

- Conservar el fondo LaunchBackground (#DE2B62) y la mascota original a 170 × 160 puntos, centrada, en el primer fotograma. Coincide con UILaunchScreen.
- Ejecutar una sola secuencia de aproximadamente 900 ms después de que la vista sea visible: desplazamiento vertical de 12 puntos, aparición del logo y fundido de salida de 240 ms.
- Mantener las proporciones de la mascota y el logo. Eliminar aplastamientos, giros, saltos, ondas, máscara circular y escalado de la pantalla principal.
- Preparar las imágenes una vez a la resolución de la pantalla. Animar las capas con Core Animation dentro del contenedor SwiftUI para evitar reconstrucciones del SVG durante el movimiento.
- Iniciar desde la aparición del controlador y tras presentar el primer fotograma, en vez de iniciar un temporizador desde la creación del árbol SwiftUI.
- Con movimiento reducido, mantener la mascota inmóvil y usar un fundido breve; no animar el logo ni añadir desplazamiento.
- Preparar voz, sonidos y widgets después de retirar el splash. Ceder el hilo principal entre los grupos de sonidos.
- La app queda interactiva y accesible al finalizar. No repetir la introducción al volver del segundo plano. Cancelar los recursos de animación al desmontar la vista.

## Alcance y comprobación

Modificar SplashView.swift, el punto de arranque de KanaGOApp.swift y la precarga de sonidos de Stores.swift. Conservar navegación, contenido, progreso, enlaces y recursos de marca.

Compilar para el simulador y revisar grabaciones de arranque frío y caliente y de movimiento reducido. Verificar que las proporciones no cambien, que el logo tenga tiempo de verse y que el fundido termine en una pantalla funcional. Las grabaciones del simulador permiten verificar la secuencia visual; no certifican el rendimiento de un iPhone físico.

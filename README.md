# Torneo E-Sports IDM · II Edición — Smash y Mario Kart

Página del torneo con dos juegos; se cambia entre ellos con los botones del encabezado.

Los dos juegos funcionan igual; cada uno se configura desde el lápiz ✏️ con dos datos:

- **Juegos en total**: cuántas partidas se jugarán en todo el torneo. El mínimo es la eliminación directa (en Smash 1 vs 1: 16 → 8 → 4 → 2 → final = 15 juegos).
- **Jugadores por juego (priorizar)**: 2 (1 vs 1), 3 o 4. La mayoría de los juegos tendrá ese tamaño; solo cuando los jugadores no se pueden dividir exacto hay juegos con uno más o uno menos.

Con eso la página calcula la estructura. Los juegos extra se usan en las primeras rondas, como la fase de grupos del Mundial: cada quien juega varias veces (todos contra todos en su grupo) y se elimina a pocos; las rondas siguientes ya recortan más, y todo termina en una **final 1 vs 1**. Por ejemplo, en Smash 1 vs 1 con 31 juegos: 4 grupos de 4 todos contra todos (pasan 2) → cuartos → semis → final.

En cada juego se anotan los puntos de cada jugador. En la tabla del grupo, cada jugador suma 1 punto por cada rival al que superó en un juego (½ si empatan); desempata el total de puntos y, si sigue el empate en el lugar para pasar, aparece una casilla de desempate. En los 1 vs 1 el ganador avanza en cuanto termina su juego, y los que pasan de un grupo se cruzan con jugadores de otros grupos.

**Participantes**: arriba del torneo, con GamerTag, nombre completo y en qué ronda va cada jugador del juego elegido.

Los cambios se guardan en línea (Upstash Redis) y todos los que abran la página los ven en unos segundos.

## Desplegar en Vercel

1. En [vercel.com/new](https://vercel.com/new) importa este repositorio. No requiere configuración de build (Framework: **Other**).
2. Para que los cambios **se queden guardados** entre visitas y dispositivos:
   en el proyecto de Vercel ve a **Storage → Create Database → Upstash (Redis)**, créala y conéctala al proyecto.
   Esto agrega automáticamente `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. Editar resultados siempre pide contraseña (al tocar el lápiz ✏️) y el servidor rechaza cualquier cambio sin ella. La contraseña del torneo ya viene configurada; en el código solo está su huella SHA-256, no el texto. Para cambiarla, agrega en **Settings → Environment Variables** la variable `ADMIN_PIN` con la nueva contraseña.
4. Haz **Redeploy** para que tome las variables.

Sin Redis la página funciona, pero los cambios solo se guardan en el navegador de quien los hizo.

## Estructura

- `index.html` — la página completa (HTML/CSS/JS, sin dependencias).
- `api/state.js` — función serverless que lee/guarda el estado de cada juego en Redis (`/api/state` para Smash, `/api/state?game=mk` para Mario Kart).

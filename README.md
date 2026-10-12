# Torneo E-Sports IDM · II Edición — Smash y Mario Kart

Página del torneo con dos juegos; se cambia entre ellos con los botones del encabezado.

**Super Smash Bros. Ultimate** — eliminación directa, 16 jugadores.
- **Bracket**: octavos → final → campeón.
- **Editar (lápiz ✏️)**: escribe los puntos de cada jugador; el que tenga más puntos pasa automáticamente a la siguiente ronda.

**Mario Kart** — grupos por puntos y final 1 vs 1, 10 jugadores.
- **Editar (lápiz ✏️)**: elige cuántas rondas eliminatorias y el mínimo de personas por grupo. Todos los grupos de una ronda son del mismo tamaño y de cada uno pasan los mismos, para que todos tengan las mismas posibilidades.
- Se escriben los puntos de cada jugador y los de más puntos pasan solos. Si hay empate en el último lugar para pasar, aparece una casilla de desempate.
- La final es 1 vs 1: el que haga más puntos es el campeón.

**Participantes**: GamerTag, nombre completo y en qué ronda va cada jugador del juego elegido.

Los cambios se guardan en línea (Upstash Redis) y todos los que abran la página los ven en unos segundos.

## Desplegar en Vercel

1. En [vercel.com/new](https://vercel.com/new) importa este repositorio. No requiere configuración de build (Framework: **Other**).
2. Para que los cambios **se queden guardados** entre visitas y dispositivos:
   en el proyecto de Vercel ve a **Storage → Create Database → Upstash (Redis)**, créala y conéctala al proyecto.
   Esto agrega automáticamente `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. (Recomendado) En **Settings → Environment Variables** agrega `ADMIN_PIN` con un PIN; solo quien lo sepa podrá editar resultados.
4. Haz **Redeploy** para que tome las variables.

Sin Redis la página funciona, pero los cambios solo se guardan en el navegador de quien los hizo.

## Estructura

- `index.html` — la página completa (HTML/CSS/JS, sin dependencias).
- `api/state.js` — función serverless que lee/guarda el estado de cada juego en Redis (`/api/state` para Smash, `/api/state?game=mk` para Mario Kart).

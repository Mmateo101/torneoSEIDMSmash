# Torneo E-Sports IDM · II Edición — Smash y Mario Kart

Página del torneo con dos juegos; se cambia entre ellos con los botones del encabezado.

Los dos juegos funcionan igual; cada uno se configura desde el lápiz ✏️ con dos datos:

- **Consolas**: cuántas hay disponibles (cuántos juegos pueden ir al mismo tiempo).
- **Juegos en total**: cuántas partidas se quieren jugar en todo el torneo.

Con eso la página calcula sola la estructura: cuántas rondas, de qué tamaño los grupos y cuántos pasan por grupo, siempre terminando en una **final 1 vs 1**. Prefiere grupos del mismo tamaño (y avisa si no se puede) y usa la mayor cantidad de juegos permitida. Cada juego elimina al menos a un jugador, así que el máximo es jugadores − 1 (15 en Smash, que es el bracket 1 vs 1 de siempre).

- Smash: hasta 4 jugadores por juego (una consola). Por defecto 2 consolas y 15 juegos → bracket de octavos a final.
- Mario Kart: 4 por consola, o con varias consolas en red local hasta 2 por consola (máx. 12). Por defecto 3 consolas y 3 juegos → 2 grupos de 5 y final.

Durante el torneo se escriben los puntos de cada jugador y los de más puntos pasan solos. En los 1 vs 1 el ganador avanza en cuanto termina su juego. Si hay empate en el último lugar para pasar, aparece una casilla de desempate.

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

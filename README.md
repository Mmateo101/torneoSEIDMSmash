# Torneo E-Sports IDM · II Edición — Smash Bracket

Bracket interactivo de eliminación directa (16 jugadores) para el torneo de **Super Smash Bros. Ultimate**.

- **Bracket**: vista completa de octavos → final → campeón.
- **Combates por ronda**: quién va contra quién en cada ronda y los siguientes combates por jugar.
- **Participantes**: GamerTag, personaje y en qué ronda va cada jugador.
- **Modo organizador**: toca a un jugador para marcarlo como ganador (tócalo de nuevo para deshacer), anota marcadores, sortea el bracket o reinicia resultados.

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
- `api/state.js` — función serverless que lee/guarda el estado del bracket en Redis.

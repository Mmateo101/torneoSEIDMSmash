import { createHash, timingSafeEqual } from 'node:crypto';

// Persistencia compartida de los torneos en Upstash Redis (integración de Vercel Marketplace).
// Variables de entorno: KV_REST_API_URL + KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
// Contraseña para editar: siempre se pide. Por defecto es la del torneo, guardada solo como huella
// SHA-256 (el repo es público). Si en Vercel se define ADMIN_PIN, esa la reemplaza.
// Cada juego se guarda por separado: /api/state (Smash) y /api/state?game=mk (Mario Kart).

const KEYS = {
  smash: 'torneo-idm-smash:bracket',
  mk: 'torneo-idm-smash:mariokart',
};
const MAX_BYTES = 200_000;
const DEFAULT_PIN_SHA256 = '843e65b1a796e0cc71ebd7590f87d911add6fc8d1da72e487da5f0e37369733a';

const sha256 = s => createHash('sha256').update(String(s), 'utf8').digest();
function pinOk(cfg, given) {
  if (typeof given !== 'string' || !given) return false;
  const expected = cfg.pin ? sha256(cfg.pin) : Buffer.from(DEFAULT_PIN_SHA256, 'hex');
  return timingSafeEqual(sha256(given), expected);
}

function config() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    pin: process.env.ADMIN_PIN || '',
  };
}

async function redis({ url, token }, command) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`Redis respondió ${r.status}`);
  return (await r.json()).result;
}

const isObject = v => v && typeof v === 'object' && !Array.isArray(v);

function isValidState(game, s) {
  const base = isObject(s) &&
    Array.isArray(s.players) && s.players.length <= 128 &&
    Array.isArray(s.order) && s.order.length <= 128;
  if (!base) return false;
  // Ambos juegos usan el mismo formato: configuración (consolas y juegos) y puntos por ronda.
  return isObject(s.config) && isObject(s.scores);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = config();
  const configured = Boolean(cfg.url && cfg.token);
  const pinRequired = true;
  const game = new URL(req.url, 'http://localhost').searchParams.get('game') || 'smash';
  const key = KEYS[game];
  if (!key) return res.status(400).json({ error: 'Juego desconocido' });

  try {
    if (req.method === 'GET') {
      if (!configured) return res.status(200).json({ configured, pinRequired, state: null });
      const raw = await redis(cfg, ['GET', key]);
      return res.status(200).json({ configured, pinRequired, state: raw ? JSON.parse(raw) : null });
    }

    if (req.method === 'POST') {
      if (!pinOk(cfg, req.headers['x-admin-pin'])) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body || '{}');
      if (body && body.check) return res.status(200).json({ ok: true });
      if (!configured) return res.status(503).json({ error: 'Almacenamiento no configurado' });

      const state = body && body.state;
      if (!isValidState(game, state)) return res.status(400).json({ error: 'Estado inválido' });
      state.updatedAt = Date.now();
      const raw = JSON.stringify(state);
      if (raw.length > MAX_BYTES) return res.status(413).json({ error: 'Estado demasiado grande' });

      await redis(cfg, ['SET', key, raw]);
      return res.status(200).json({ ok: true, updatedAt: state.updatedAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

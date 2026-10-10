// Persistencia compartida del bracket en Upstash Redis (integración de Vercel Marketplace).
// Variables de entorno: KV_REST_API_URL + KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
// Opcional: ADMIN_PIN — si existe, solo quien lo conozca puede guardar cambios.

const KEY = 'torneo-idm-smash:bracket';
const MAX_BYTES = 200_000;

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

function isValidState(s) {
  return (
    s && typeof s === 'object' &&
    Array.isArray(s.players) && s.players.length <= 128 &&
    Array.isArray(s.order) && s.order.length <= 128 &&
    s.results && typeof s.results === 'object' && !Array.isArray(s.results)
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const cfg = config();
  const configured = Boolean(cfg.url && cfg.token);
  const pinRequired = Boolean(cfg.pin);

  try {
    if (req.method === 'GET') {
      if (!configured) return res.status(200).json({ configured, pinRequired, state: null });
      const raw = await redis(cfg, ['GET', KEY]);
      return res.status(200).json({ configured, pinRequired, state: raw ? JSON.parse(raw) : null });
    }

    if (req.method === 'POST') {
      if (pinRequired && req.headers['x-admin-pin'] !== cfg.pin) {
        return res.status(401).json({ error: 'PIN incorrecto' });
      }
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body || '{}');
      if (body && body.check) return res.status(200).json({ ok: true });
      if (!configured) return res.status(503).json({ error: 'Almacenamiento no configurado' });

      const state = body && body.state;
      if (!isValidState(state)) return res.status(400).json({ error: 'Estado inválido' });
      state.updatedAt = Date.now();
      const raw = JSON.stringify(state);
      if (raw.length > MAX_BYTES) return res.status(413).json({ error: 'Estado demasiado grande' });

      await redis(cfg, ['SET', KEY, raw]);
      return res.status(200).json({ ok: true, updatedAt: state.updatedAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

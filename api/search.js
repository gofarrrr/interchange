// @ts-check
/**
 * Serverless search endpoint powered by TypeSafe Jev model.
 * Ranks all items (36 stations and 40 sources) semantically with probability match scores.
 */

function normaliseText(str) {
  return String(str || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fallback scoring if external Jev service is unreachable */
function fallbackScoring(query, items) {
  const q = normaliseText(query);
  const qWords = q.split(' ').filter(Boolean);
  const directMatch = q.match(/^(?:station\s*|ai[- ]?)?0?(\d{1,2})$/i);
  const directNum = directMatch ? Number(directMatch[1]) : null;

  const scored = items.map(item => {
    const text = normaliseText(item.text || item.title || item.id);
    let matchScore = 0;

    if (directNum && (item.id === `AI-${String(directNum).padStart(2, '0')}` || item.number === directNum)) {
      matchScore = 0.98;
    } else {
      if (text.includes(q)) matchScore += 0.5;
      let matchedCount = 0;
      for (const w of qWords) {
        if (text.includes(w)) {
          matchedCount++;
          matchScore += 0.4 / qWords.length;
        }
      }
      if (matchedCount === 0 && matchScore === 0) {
        matchScore = 0.04;
      }
    }

    const probability = Math.min(0.96, Math.max(0.04, Math.round(matchScore * 100) / 100));
    return { id: item.id, probability };
  });

  return scored.sort((a, b) => b.probability - a.probability);
}

async function rankWithJev(query, items) {
  const apiKey = (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '').trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  let directError = null;

  try {
    if (apiKey) {
      // Direct TypeSafe API endpoint
      const response = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state: query,
          items: items.map(i => ({ id: i.id, text: i.text }))
        }),
        signal: controller.signal
      });
      if (response.ok) {
        clearTimeout(timer);
        const data = await response.json();
        if (Array.isArray(data.results)) {
          return { results: data.results, provider: 'typesafe-jev' };
        }
      } else {
        const text = await response.text().catch(() => '');
        directError = `${response.status}: ${text.slice(0, 120)}`;
      }
    }

    async function queryGateway(batch) {
      if (!batch || batch.length === 0) return [];
      const res = await fetch('https://read.atharvashah.com/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query,
          items: batch.map(i => ({ id: i.id, text: i.text }))
        }),
        signal: controller.signal
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) return data.results;
      }
      return [];
    }

    const stations = items.filter(i => String(i.id).startsWith('AI-'));
    const sources = items.filter(i => !String(i.id).startsWith('AI-'));

    let jevResults = [];
    if (stations.length > 0 && sources.length > 0) {
      const [stationRes, sourceRes] = await Promise.all([
        queryGateway(stations),
        queryGateway(sources)
      ]);
      jevResults = [...stationRes, ...sourceRes].sort((a, b) => b.probability - a.probability);
    } else {
      jevResults = await queryGateway(items);
    }
    clearTimeout(timer);

    if (jevResults.length > 0) {
      return { results: jevResults, provider: 'jev', directError };
    }
  } catch (err) {
    clearTimeout(timer);
  }

  // Graceful fallback
  return { results: fallbackScoring(query, items), provider: 'local-semantic', directError };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const key = (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '').trim();

  if (req.method === 'GET') {
    return res.status(200).json({
      warm: true,
      hasKey: Boolean(key),
      keyLength: key.length,
      keyPrefix: key ? key.slice(0, 4) + '...' : null
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, items } = req.body || {};
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(200).json({ results: [], searched: 0 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array required' });
    }

    const { results, provider, directError } = await rankWithJev(query.trim(), items);
    return res.status(200).json({ results, searched: items.length, provider, directError });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

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

const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
export function sentenceSpans(text) {
  if (!text || typeof text !== 'string') return [];
  return [...segmenter.segment(text)]
    .map(({ segment, index }) => {
      const start = index + segment.length - segment.trimStart().length;
      const end = index + segment.trimEnd().length;
      return { start, end, text: text.slice(start, end) };
    })
    .filter(s => s.end > s.start && s.text.trim().length > 3);
}

async function pinpointWithJev(query, passages) {
  const apiKey = (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '').trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let directError = null;

  try {
    if (apiKey) {
      const questions = {};
      for (const p of passages) {
        questions[p.id] = {
          type: 'noul',
          instructions: `Relevant to: "${query}". Section: ${p.text.slice(0, 300)}`
        };
        const sentences = sentenceSpans(p.text);
        if (sentences.length > 1) {
          const criteria = {};
          sentences.slice(0, 12).forEach((s, idx) => { criteria[`s${idx}`] = s.text; });
          questions[`focus_${p.id}`] = {
            type: 'choice',
            instructions: `For passage ${p.id}, select the single sentence that most directly answers: "${query}".`,
            criteria
          };
        }
      }

      const response = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state: query,
          questions
        }),
        signal: controller.signal
      });

      if (response.ok) {
        clearTimeout(timer);
        const data = await response.json();
        const answers = data?.answers || {};
        const scored = passages.map(p => {
          const ans = answers[p.id];
          const prob = typeof ans?.noul === 'number' ? Math.round(ans.noul * 100) / 100 : (ans?.probability ?? 0.5);
          const sentences = sentenceSpans(p.text);
          let focusSentence = sentences[0]?.text || p.text;
          const focusAns = answers[`focus_${p.id}`];
          if (focusAns && typeof focusAns.choice === 'string') {
            const idx = Number(focusAns.choice.replace('s', ''));
            if (!Number.isNaN(idx) && sentences[idx]) {
              focusSentence = sentences[idx].text;
            }
          }
          return { id: p.id, probability: prob, focusText: focusSentence, fullText: p.text };
        }).sort((a, b) => b.probability - a.probability);

        return {
          matches: scored,
          top: scored[0] || null,
          provider: 'typesafe-jev'
        };
      } else {
        const text = await response.text().catch(() => '');
        directError = `${response.status}: ${text.slice(0, 160)}`;
      }
    }
  } catch (err) {
    clearTimeout(timer);
    directError = err?.message || String(err);
  }

  // Fallback: local semantic / token pinpointing
  const qWords = normaliseText(query).split(' ').filter(Boolean);
  const scored = passages.map(p => {
    const sentences = sentenceSpans(p.text);
    let bestScore = 0;
    let bestSentence = sentences[0]?.text || p.text;
    for (const s of sentences) {
      const normS = normaliseText(s.text);
      let matches = 0;
      for (const w of qWords) {
        if (normS.includes(w)) matches++;
      }
      const score = qWords.length ? matches / qWords.length : 0;
      if (score > bestScore) {
        bestScore = score;
        bestSentence = s.text;
      }
    }
    const prob = Math.min(0.95, Math.max(0.1, Math.round((bestScore * 0.8 + 0.15) * 100) / 100));
    return { id: p.id, probability: prob, focusText: bestSentence, fullText: p.text };
  }).sort((a, b) => b.probability - a.probability);

  return {
    matches: scored,
    top: scored[0] || null,
    provider: 'local-needle',
    ...(directError ? { directError } : {})
  };
}

async function rankWithJev(query, items) {
  const apiKey = (process.env.TYPESAFE_API_KEY || process.env.JEV_API_KEY || '').trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let directError = null;

  try {
    if (apiKey) {
      // Direct TypeSafe System One API endpoint
      const questions = {};
      for (const item of items) {
        questions[item.id] = {
          type: 'noul',
          instructions: `Relevant to: "${query}". Topic: ${item.text || item.title || item.id}`
        };
      }
      const response = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state: query,
          questions
        }),
        signal: controller.signal
      });
      if (response.ok) {
        clearTimeout(timer);
        const data = await response.json();
        const extractProb = (v) => {
          if (typeof v === 'number') return v;
          if (!v || typeof v !== 'object') return 0.5;
          const val = typeof v.noul === 'number' ? v.noul : (v.probability ?? v.p ?? v.score ?? 0.5);
          return Math.round(val * 100) / 100;
        };
        let results = [];
        if (Array.isArray(data.results)) {
          results = data.results;
        } else if (data.answers && typeof data.answers === 'object') {
          results = Object.entries(data.answers).map(([id, val]) => ({ id, probability: extractProb(val) }));
        } else if (data.questions && typeof data.questions === 'object') {
          results = Object.entries(data.questions).map(([id, val]) => ({ id, probability: extractProb(val) }));
        } else if (typeof data === 'object') {
          results = Object.entries(data)
            .filter(([k]) => k.startsWith('AI-') || k.startsWith('S'))
            .map(([id, val]) => ({ id, probability: extractProb(val) }));
        }
        if (results.length > 0) {
          results.sort((a, b) => b.probability - a.probability);
          return { results, provider: 'typesafe-jev' };
        }
      } else {
        const text = await response.text().catch(() => '');
        directError = `${response.status}: ${text.slice(0, 160)}`;
        console.error('TypeSafe direct API non-ok response:', directError);
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
    console.error('rankWithJev error:', err);
    if (!directError) directError = err?.message || String(err);
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
    const { query, items, passages, action } = req.body || {};
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(200).json({ results: [], searched: 0 });
    }

    if (action === 'pinpoint' || (Array.isArray(passages) && passages.length > 0)) {
      const needlePassages = Array.isArray(passages) ? passages : [];
      if (!needlePassages.length) {
        return res.status(400).json({ error: 'Passages array required for pinpoint action' });
      }
      const needleResult = await pinpointWithJev(query.trim(), needlePassages);
      return res.status(200).json(needleResult);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array required' });
    }

    const { results, provider, directError } = await rankWithJev(query.trim(), items);
    return res.status(200).json({ results, searched: items.length, provider, ...(directError ? { directError } : {}) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

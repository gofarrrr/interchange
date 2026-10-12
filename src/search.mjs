/** Deterministic search and semantic scoring utility powered by Jev / local fallback. */
export function normaliseQuery(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function rankSearch(items, rawQuery, limit = 12) {
  const query = normaliseQuery(rawQuery);
  if (!query) return [];
  const direct = query.match(/^(?:station\s*|ai[- ]?)?0?(\d{1,2})$/i);
  const words = query.split(' ').filter(Boolean);

  return items.map(item => {
    const title = normaliseQuery(item.title + ' ' + (item.short || ''));
    const summary = normaliseQuery(item.summary || '');
    const body = normaliseQuery(item.text || '');
    const id = normaliseQuery(item.id || '');
    const author = normaliseQuery(item.author || '');

    let score = 0;
    if (direct && item.number === Number(direct[1])) score += 1000;
    if (id === query) score += 500;
    if (author && author.includes(query)) score += 300;
    if (title.includes(query)) score += 100;
    if (summary.includes(query)) score += 40;

    let matched = 0;
    for (const word of words) {
      if (id.includes(word)) { score += 40; matched++; }
      else if (author.includes(word)) { score += 30; matched++; }
      else if (title.includes(word)) { score += 20; matched++; }
      else if (summary.includes(word)) { score += 8; matched++; }
      else if (body.includes(word)) { score += 2; matched++; }
    }

    if (matched < words.length && !(direct && item.number === Number(direct[1]))) {
      return { item, score: 0 };
    }

    const probability = Math.min(0.96, Math.max(0.20, Math.round((Math.min(score, 200) / 220) * 100) / 100));
    const scoredItem = Object.assign({}, item, { probability });
    return { item: scoredItem, score };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score || (a.item.number || 999) - (b.item.number || 999))
  .slice(0, limit)
  .map(x => x.item);
}

export function sentenceSpans(text) {
  if (!text || typeof text !== 'string') return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
      return [...segmenter.segment(text)]
        .map(({ segment, index }) => {
          const start = index + segment.length - segment.trimStart().length;
          const end = index + segment.trimEnd().length;
          return { start, end, text: text.slice(start, end) };
        })
        .filter(s => s.end > s.start && s.text.trim().length > 3);
    } catch {}
  }
  const spans = [];
  const regex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const trimL = raw.length - raw.trimStart().length;
    const start = match.index + trimL;
    const end = match.index + raw.trimEnd().length;
    const spanText = text.slice(start, end);
    if (spanText.trim().length > 3) {
      spans.push({ start, end, text: spanText });
    }
  }
  return spans;
}

/** Deterministic local search. No telemetry, network or generated answers. */
export function normaliseQuery(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
}
export function rankSearch(items, rawQuery, limit=12) {
  const query=normaliseQuery(rawQuery); if(!query)return [];
  const direct=query.match(/^(?:station\s*|ai[- ]?)?0?(\d{1,2})$/);
  const words=query.split(' ').filter(Boolean);
  return items.map(item=>{
    const title=normaliseQuery(item.title+' '+item.short);const summary=normaliseQuery(item.summary);const body=normaliseQuery(item.text);
    let score=0;
    if(direct&&item.number===Number(direct[1]))score+=1000;
    if(title.includes(query))score+=100;
    if(summary.includes(query))score+=40;
    let matched=0;
    for(const word of words){if(title.includes(word)){score+=20;matched++;}else if(summary.includes(word)){score+=8;matched++;}else if(body.includes(word)){score+=2;matched++;}}
    if(matched<words.length&&!(direct&&item.number===Number(direct[1])))return {item,score:0};
    return {item,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.item.number-b.item.number).slice(0,limit).map(x=>x.item);
}

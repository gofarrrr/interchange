import {safeURL} from './url.mjs';
import {validateAbout,projectAbout} from './about.mjs';
/** Domain rules shared by the build, optional Astro adapter and tests. */
export const LINE_IDS = ['A','B','C','D','E','F'];
export const LINE_COUNTS = [6,7,6,5,6,6];
export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const jsonForHTML = value => JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export {safeURL} from './url.mjs';
export function normalizeBase(base='/') {
  if (!base || base==='/') return '/';
  if (!/^\/?[a-zA-Z0-9/_-]+\/?$/.test(base)) throw Error('BASE_PATH must be an ordinary URL path.');
  return '/'+base.replace(/^\/+|\/+$/g,'')+'/';
}
export const stationPath = s => `/stations/${String(s.number).padStart(2,'0')}-${s.slug}/`;
export const linkTo = (path,base='/') => normalizeBase(base)+path.replace(/^\//,'');
export function reviewerApproved(review) {
  return review?.status==='approved' && typeof review.approved_by==='string' && review.approved_by.trim().length>0 && typeof review.approved_at==='string' && /^\d{4}-\d{2}-\d{2}/.test(review.approved_at) && !Number.isNaN(Date.parse(review.approved_at));
}
export function sourceChecked(review) {
  return review?.status==='checked' && typeof review.checked_by==='string' && review.checked_by.trim().length>0 && typeof review.checked_at==='string' && !Number.isNaN(Date.parse(review.checked_at));
}
export function validate(data) {
  const errors=validateAbout(data.about); const {stations,lines,evidence,sources,transfers,journeys,layout}=data;
  const unique=(list,name) => { if(new Set(list.map(x=>x.id)).size!==list.length)errors.push(`Duplicate ${name} IDs`); };
  for(const [name,list] of Object.entries({stations,lines,evidence,sources,transfers,journeys}))unique(list,name);
  if(stations.length!==36)errors.push('Exactly 36 stations are required.');
  if(lines.length!==6)errors.push('Exactly six lines are required.');
  if(new Set(stations.map(s=>s.number)).size!==stations.length)errors.push('Duplicate station numbers');
  unique(layout.stations,'map station');
  if(layout.routes.length!==6||new Set(layout.routes.map(r=>r.line)).size!==6)errors.push('Map needs six unique routes.');
  const sm=new Map(stations.map(s=>[s.id,s]));const em=new Map(evidence.map(e=>[e.id,e]));const so=new Map(sources.map(s=>[s.id,s]));
  for(let i=1;i<=36;i++)if(!sm.has(`AI-${String(i).padStart(2,'0')}`))errors.push(`Missing station ${i}`);
  LINE_IDS.forEach((id,i)=>{const l=lines.find(x=>x.id===id);if(!l)errors.push(`Missing line ${id}`);if(stations.filter(s=>s.line_id===id).length!==LINE_COUNTS[i])errors.push(`Incorrect count on ${id}`);});
  for(const s of stations) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.slug))errors.push(`Unsafe slug: ${s.id}`);
    if(s.id!==`AI-${String(s.number).padStart(2,'0')}`)errors.push(`Station number/ID mismatch: ${s.id}`);
    const home=s.number<=6?'A':s.number<=13?'B':s.number<=19?'C':s.number<=24?'D':s.number<=30?'E':'F';
    if(s.line_id!==home)errors.push(`Canonical home line changed: ${s.id}`);
    if(!s.title||!s.summary||!s.diagnosis||!s.short_title)errors.push(`Missing copy: ${s.id}`);
    for(const id of s.related_ids)if(!sm.has(id))errors.push(`Unknown related ID ${id}`);
    for(const id of s.evidence_ids)if(!em.has(id))errors.push(`Unknown evidence ${id}`);
    for(const id of s.source_ids)if(!so.has(id))errors.push(`Unknown source ${id}`);
  }
  for(const s of sources){if(!safeURL(s.original_url))errors.push(`Unsafe source URL ${s.id}`);if(!s.title||!s.author_or_organization||!s.limitations)errors.push(`Missing source context ${s.id}`);}
  for(const e of evidence)if(!so.has(e.source_id)||!e.qualification)errors.push(`Missing source/qualification: ${e.id}`);
  for(const t of transfers)if(!sm.has(t.from)||!sm.has(t.to)||!t.reason||sm.get(t.from)?.line_id===sm.get(t.to)?.line_id)errors.push(`Invalid transfer ${t.id}`);
  for(const j of journeys)for(const n of j.points)if(!stations.some(s=>s.number===n))errors.push(`Unknown journey station ${n}`);
  if(layout.stations.length!==36)errors.push('Map must contain 36 stations.');
  const onSegment=(p,a,b)=>Math.abs((p.x-a[0])*(b[1]-a[1])-(p.y-a[1])*(b[0]-a[0]))<0.01&&p.x>=Math.min(a[0],b[0])-.01&&p.x<=Math.max(a[0],b[0])+.01&&p.y>=Math.min(a[1],b[1])-.01&&p.y<=Math.max(a[1],b[1])+.01;
  for(const route of layout.routes){for(let i=1;i<route.points.length;i++){const [x,y]=route.points[i];const [a,b]=route.points[i-1];if(!(x===a||y===b||Math.abs(x-a)===Math.abs(y-b)))errors.push(`Non-octilinear segment on ${route.line}`);}}
  for(const p of layout.stations){const s=sm.get(p.id);const r=layout.routes.find(r=>r.line===s?.line_id);if(!r||!r.points.slice(1).some((b,i)=>onSegment(p,r.points[i],b)))errors.push(`Station off its route: ${p.id}`);}
  return errors;
}
/** Public publication is intentionally fail-closed. Preview never upgrades approval. */
export function checkPublication(data) {
  const errors=[];const so=new Map(data.sources.map(s=>[s.id,s]));const ev=new Map(data.evidence.map(e=>[e.id,e]));
  for(const s of data.stations){
    if(s.publication_status!=='approved'||!reviewerApproved(s.review))errors.push(`${s.id}: station needs named editorial approval`);
    const approved=s.evidence_ids.filter(id=>{const e=ev.get(id);return e&&reviewerApproved(e.review)&&sourceChecked(so.get(e.source_id)?.review)&&e.public_locator?.kind!=='unverified'&&e.public_locator?.value;});
    if(!approved.length)errors.push(`${s.id}: no checked and approved public evidence with original locator`);
  }
  return errors;
}
export function project(data, {preview=true}={}) {
  const sources=data.sources.filter(s=>safeURL(s.original_url)&&(preview||sourceChecked(s.review))).map(s=>({id:s.id,title:s.title,author:s.author_or_organization,type:s.source_type,date:s.date_as_supplied||'Date not supplied',url:safeURL(s.original_url),limitations:s.limitations,access:s.access||'not-verified',checked:sourceChecked(s.review)}));
  const sourceIDs=new Set(sources.map(s=>s.id));
  const evidence=data.evidence.filter(e=>sourceIDs.has(e.source_id)&&(preview||reviewerApproved(e.review))).map(e=>({id:e.id,source_id:e.source_id,type:e.type,title:e.title,text:e.text,attribution:e.attribution_layer,qualification:e.qualification,locator:e.public_locator.value,approved:reviewerApproved(e.review)}));
  const evIDs=new Set(evidence.map(e=>e.id));
  const stations=data.stations.map(s=>({id:s.id,number:s.number,slug:s.slug,title:s.title,short:s.short_title,line:s.line_id,summary:s.summary,diagnosis:s.diagnosis,questions:s.diagnostic_questions,actions:s.proposed_actions,artifact:s.working_artifact,measures:s.measures,tradeoff:s.tradeoff,example:s.illustrative_case,evidence_ids:s.evidence_ids.filter(id=>evIDs.has(id)),source_ids:s.source_ids.filter(id=>sourceIDs.has(id)),related_ids:s.related_ids,report_reference:preview?s.report_reference:null,omitted_evidence_count:s.omitted_evidence_count||0,approved:s.publication_status==='approved'&&reviewerApproved(s.review)}));
  const transfers=data.transfers.filter(t=>preview||reviewerApproved(t.review)).map(t=>({id:t.id,from:t.from,to:t.to,reason:t.reason,proposed:!reviewerApproved(t.review)}));
  return {stations,sources,evidence,transfers,lines:data.lines,journeys:data.journeys,layout:data.layout,about:projectAbout(data.about),preview};
}

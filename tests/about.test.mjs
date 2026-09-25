import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRaw,load} from '../src/load.mjs';
import {validate,project,checkPublication} from '../src/domain.mjs';
import {validateAbout,projectAbout,aboutMarkdown} from '../src/about.mjs';
import {createRenderer} from '../src/render.mjs';
const data=loadRaw();
const site=load();
const aboutBody=(d=site,base='/')=>createRenderer(d,{base}).pages.find(p=>p.path==='/about/').body;
const urls=[
  'https://x.com/mardehaym/status/2103172822067466587',
  'https://x.com/businessbarista/status/2102763567422251107'
];
test('About credits both original authors and the exact owner-supplied posts',()=>{
  const html=aboutBody();
  for(const url of urls)assert.ok(html.includes(`href="${url}"`));
  for(const name of ['Mark Ajzenstadt','Alex Lieberman','@mardehaym','@businessbarista'])assert.ok(html.includes(name));
  assert.equal((html.match(/data-origin-link=/g)||[]).length,2);
  assert.deepEqual(site.about.origins.credits.map(c=>c.list_size),[30,37]);
});
test('Living-guide copy explains nuance, disagreement and alternatives without claiming automation',()=>{
  const html=aboutBody();
  for(const phrase of ['A living guide, not a finished checklist.','different lens','counterargument','expand, qualify or correct','not 36 final answers','not an automatic feed','not a longer bibliography'])assert.ok(html.includes(phrase),phrase);
});
test('Origin credits are not presented as research evidence or endorsement',()=>{
  assert.equal(site.sources.length,31);assert.equal(site.evidence.length,60);
  assert.ok(aboutBody().includes('does not imply their endorsement'));
  assert.ok(!site.evidence.some(e=>e.source_id.startsWith('origin-')));
  assert.equal(checkPublication(data).length,72);
});
test('About has visible sections and original links without embedded X scripts or hidden panels',()=>{
  const html=aboutBody();
  for(const id of ['origins','living-guide','editorial-approach','how-to-read','review-status'])assert.ok(html.includes(`id="${id}"`));
  assert.ok(!/<iframe|<script|role="tab"|<details/.test(html));
  assert.ok(!html.includes('target="_blank"'));
});
test('Missing, unsafe or duplicate origin records fail validation',()=>{
  const x=structuredClone(data);delete x.about;assert.match(validate(x).join(','),/Missing About/);
  const a=structuredClone(data.about);a.origins.credits[0].url='javascript:alert(1)';assert.match(validateAbout(a).join(','),/Unsafe origin URL/);
  a.origins.credits[0]=structuredClone(a.origins.credits[1]);assert.match(validateAbout(a).join(','),/Duplicate origin/);
});
test('Internal About provenance and nested notes are excluded from public projections',()=>{
  const x=structuredClone(data);x.about._provenance.secret='NOT-FOR-PUBLICATION';x.about.origins.credits[0].private_note='PRIVATE-CREDIT-NOTE';
  const output=JSON.stringify(project(x));
  assert.ok(!output.includes('NOT-FOR-PUBLICATION'));assert.ok(!output.includes('PRIVATE-CREDIT-NOTE'));
  assert.ok(!('_provenance' in projectAbout(x.about)));
});
test('Editable About text is escaped as text, including intro and original titles',()=>{
  const x=structuredClone(data);const attack='<img src=x onerror=alert(1)>';
  x.about.intro=attack;x.about.origins.credits[0].title=attack;x.about.living_guide.paragraphs[0]=attack;
  const html=aboutBody(project(x));assert.ok(!html.includes(attack));assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});
test('About and the source directory preserve internal subpath navigation without rewriting original links',()=>{
  const rr=createRenderer(site,{base:'/field-guide/'});
  const html=rr.pages.find(p=>p.path==='/about/').body;
  assert.ok(html.includes('href="/field-guide/index/"'));
  for(const url of urls)assert.ok(html.includes(`href="${url}"`));
  assert.ok(rr.pages.find(p=>p.path==='/sources/').body.includes('href="/field-guide/about/#origins"'));
});
test('The Markdown export uses the same origin and living-guide content',()=>{
  const md=aboutMarkdown(data.about);for(const url of urls)assert.ok(md.includes(url));
  assert.ok(md.includes(data.about.living_guide.principle));assert.ok(!md.includes('_provenance'));
});
test('About updates do not pretend that draft station research was approved',()=>{
  assert.equal(site.stations.filter(s=>s.approved).length,0);
  assert.ok(aboutBody().includes('The new origin credits do not change the review status'));
  assert.ok(!aboutBody({...site,preview:false}).includes('The inherited 36-point research package remains draft'));
});

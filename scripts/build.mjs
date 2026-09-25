import {readFileSync,writeFileSync,mkdirSync,rmSync,cpSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {root,load} from '../src/load.mjs';
import {aboutMarkdown} from '../src/about.mjs';
import {createRenderer} from '../src/render.mjs';
import {normalizeBase,jsonForHTML,safeURL} from '../src/domain.mjs';
const args=new Set(process.argv.slice(2));
const preview=!args.has('--public');
const base=normalizeBase(process.env.BASE_PATH||'/');
const siteURL=process.env.SITE_URL||'';
if(siteURL&&!safeURL(siteURL))throw Error('SITE_URL must use HTTP or HTTPS without credentials.');
// Check all content before touching existing output, so a failed public build preserves the review build.
let data;
try{data=load({preview});}catch(error){console.error(error.message);process.exit(1);}
const renderer=createRenderer(data,{base,siteURL});
writeFileSync(join(root,'ABOUT.md'),aboutMarkdown(data.about));
const css=readFileSync(join(root,'src/styles/style.css'),'utf8');
const search=readFileSync(join(root,'src/search.mjs'),'utf8').replace(/^export /gm,'');
const client=search+'\n'+readFileSync(join(root,'src/scripts/app.js'),'utf8');
const out=resolve(root,process.env.OUT_DIR||'dist');
if(out===root||!out.startsWith(root+'/'))throw Error('OUT_DIR must be inside the project and not its root.');
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
const favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="#fafafa"/><path d="M4 10h24M4 22h24M10 4v24M22 4v24" fill="none" stroke="#171717" stroke-width="2"/><circle cx="10" cy="10" r="4" fill="#fafafa" stroke="#171717" stroke-width="2"/><circle cx="22" cy="22" r="4" fill="#fafafa" stroke="#171717" stroke-width="2"/></svg>';
mkdirSync(join(out,'assets'),{recursive:true});
writeFileSync(join(out,'assets/style.css'),css);
writeFileSync(join(out,'assets/app.js'),client);
writeFileSync(join(out,'assets/data.js'),'window.__SITE_DATA__='+jsonForHTML(renderer.clientData)+';');
writeFileSync(join(out,'favicon.svg'),favicon);
for(const page of renderer.pages){const dir=join(out,page.path.replace(/^\//,''));mkdirSync(dir,{recursive:true});let html=renderer.document(page);html=html.replace(/<script id="site-data" type="application\/json">[\s\S]*?<\/script>/,`<script src="${base}assets/data.js" defer></script>`);writeFileSync(join(dir,'index.html'),html);}
cpSync(join(out,'404/index.html'),join(out,'404.html'));
writeFileSync(join(out,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':'User-agent: *\nAllow: /\n'+(siteURL?`Sitemap: ${new URL(base+'sitemap.xml',siteURL)}\n`:''));
if(!preview&&siteURL){writeFileSync(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+renderer.pages.filter(p=>!['/404/','/saved/','/search/'].includes(p.path)).map(p=>`<url><loc>${new URL(base+p.path.replace(/^\//,''),siteURL).href}</loc></url>`).join('')+'</urlset>');}
// Astro adapter uses precisely the same public asset projection.
mkdirSync(join(root,'public/assets'),{recursive:true});for(const f of ['style.css','app.js','data.js'])cpSync(join(out,'assets',f),join(root,'public/assets',f));
for(const f of ['favicon.svg','robots.txt'])cpSync(join(out,f),join(root,'public',f));
if(!args.has('--no-offline')){
  const offline=createRenderer(data,{base:'/'});
  const bodies=Object.fromEntries(offline.pages.map(p=>[p.path,offline.fragment(p)]));
  const offlineData='window.__OFFLINE__=true;window.__SITE_DATA__='+jsonForHTML(offline.clientData)+';window.__PAGES__='+jsonForHTML(bodies)+';';
  const router=readFileSync(join(root,'src/scripts/offline-router.js'),'utf8');
  let html=offline.document(offline.pages[0],{inlineCSS:css,inlineJS:client,offlineData,offlineRouter:router});
  html=html.replace(/<link rel="icon"[^>]*\/>/,`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}"/>`);
  writeFileSync(join(root,'INTERCHANGE.html'),html);
}
const report={built_at:new Date().toISOString(),mode:preview?'review-preview':'approved-public',base,pages:renderer.pages.length,stations:data.stations.length,lines:data.lines.length,source_links:data.sources.length,source_perspectives:data.evidence.length,proposed_connections:data.transfers.filter(t=>t.proposed).length,approved_stations:data.stations.filter(s=>s.approved).length,script_bytes:Buffer.byteLength(client),script_gzip_bytes:gzipSync(client).length,stylesheet_bytes:Buffer.byteLength(css),data_bytes:Buffer.byteLength(JSON.stringify(renderer.clientData)),runtime_dependencies:0,build:'Dependency-free Node static renderer. Astro adapter not invoked by this command.'};
writeFileSync(join(out,'build-info.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
console.log(`\nBuilt ${renderer.pages.length} pages in ${out}`);

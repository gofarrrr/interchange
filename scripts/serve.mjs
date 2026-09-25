import {createServer} from 'node:http';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {root} from '../src/load.mjs';
import {normalizeBase} from '../src/domain.mjs';
const directory=resolve(root,process.env.OUT_DIR||'dist');const base=normalizeBase(process.env.BASE_PATH||'/');
const port=Number(process.env.PORT||4173);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
if(!existsSync(join(directory,'index.html')))throw Error('Build first: npm run build');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.wasm':'application/wasm'};
createServer((req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method||'')){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    const parsed=new URL(req.url||'/','http://localhost');const pathname=decodeURIComponent(parsed.pathname);
    if(pathname.includes('\0')||pathname.split('/').includes('..')){res.writeHead(400).end();return;}
    if(base!=='/'&&!pathname.startsWith(base)){res.writeHead(404).end('Outside configured BASE_PATH');return;}
    const rel=pathname.slice(base.length).replace(/^\//,'');let path=resolve(directory,rel||'.');
    if(path!==directory&&!path.startsWith(directory+'/')){res.writeHead(403).end();return;}
    let status=200;
    if(existsSync(path)&&statSync(path).isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'+parsed.search}).end();return;}
      path=join(path,'index.html');
    }
    if(!existsSync(path)||!statSync(path).isFile()){path=join(directory,'404.html');status=404;}
    res.writeHead(status,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
    res.end(req.method==='HEAD'?undefined:readFileSync(path));
  }catch(error){res.writeHead(400,{'Content-Type':'text/plain'}).end('Invalid request');}
}).listen(port,'0.0.0.0',()=>console.log(`Interchange running at http://localhost:${port}${base}\nReview server only; protect any externally accessible review deployment.`));

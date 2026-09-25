import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validate,checkPublication,project} from './domain.mjs';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const folder=path=>readdirSync(resolve(root,path)).filter(f=>f.endsWith('.json')).sort().map(f=>read(path+'/'+f));
export function loadRaw(){return {about:read('content/about.json'),stations:folder('content/stations'),sources:folder('content/sources'),evidence:folder('content/evidence'),lines:read('src/data/lines.json'),transfers:read('src/data/transfers.json'),journeys:read('src/data/journeys.json'),layout:read('src/data/map-layout.json')};}
export function load({preview=true}={}){const data=loadRaw();const errors=validate(data);if(errors.length)throw Error(errors.join('\n'));if(!preview){const blocked=checkPublication(data);if(blocked.length)throw Error('PUBLIC RELEASE BLOCKED\n'+blocked.join('\n'));}return project(data,{preview});}

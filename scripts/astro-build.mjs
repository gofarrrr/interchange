import {spawnSync} from 'node:child_process';
const publicMode=process.env.PUBLIC_RELEASE==='1';
const preparation=spawnSync(process.execPath,['scripts/build.mjs','--no-offline',...(publicMode?['--public']:[])],{stdio:'inherit'});
if(preparation.status!==0)process.exit(preparation.status||1);
const build=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['--no-install','astro','build','--root','astro'],{stdio:'inherit'});
process.exit(build.status||0);

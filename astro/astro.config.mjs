import {defineConfig} from 'astro/config';
export default defineConfig({
  output:'static',
  outDir:'../dist-astro',
  publicDir:'../public',
  base:process.env.BASE_PATH||'/',
  site:process.env.SITE_URL||undefined,
  build:{format:'directory'},
  srcDir:'.',
});

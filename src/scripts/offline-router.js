/* Standalone-file routing only. Static hosted pages use normal browser navigation. */
(() => {
  const pages=window.__PAGES__ || {};
  if(!Object.keys(pages).length)return;
  let current=''; const positions=new Map();
  const parse=()=>new URL('https://offline.invalid'+(location.hash.startsWith('#/')?location.hash.slice(1):'/'));
  function render(){
    const route=parse();const key=route.pathname.endsWith('/')?route.pathname:route.pathname+'/';
    if(current!==key+route.search){
      if(current)positions.set(current,window.scrollY);
      window.Interchange?.dispose();
      const app=document.getElementById('app');if(!app)return;app.innerHTML=pages[key]||pages['/404/'];
      current=key+route.search;
      document.title=(document.querySelector('h1')?.textContent||'Interchange')+' — Interchange';
      window.Interchange?.boot();
      const main=document.querySelector('main');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}
    }
    requestAnimationFrame(()=>{if(route.hash){const id=decodeURIComponent(route.hash.slice(1));document.getElementById(id)?.scrollIntoView({block:'start'});}else{window.scrollTo({top:positions.get(current)||0,behavior:"instant"});}});
  }
  window.__NAVIGATE__=path=>{location.hash='#'+path;};
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const a=event.target instanceof Element?event.target.closest('a'):null;
    if(!a||a.hasAttribute('download')||a.target==='_blank')return;
    const raw=a.getAttribute('href')||'';
    if(raw.startsWith('/')&&!raw.startsWith('//')){event.preventDefault();if(location.hash==='#'+raw)render();else location.hash='#'+raw;}
    else if(raw.startsWith('#')&&!raw.startsWith('#/')){event.preventDefault();const route=parse();location.hash='#'+route.pathname+route.search+raw;}
  });
  window.addEventListener('hashchange',render);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){const dialog=document.querySelector('dialog[open]');if(dialog instanceof HTMLDialogElement)dialog.close();}});
  render();
})();

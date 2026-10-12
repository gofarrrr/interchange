// @ts-check
/** Progressive enhancement. The same HTML works without this script. */
(() => {
  /** @type {AbortController | null} */ let lifecycle=null;
  /** @type {ReturnType<typeof setTimeout> | undefined} */ let toastTimer;
  /** @type {ReturnType<typeof setTimeout> | undefined} */ let searchTimer;
  /** @type {import('../types').PageData} */
  const data = window.__SITE_DATA__ || JSON.parse(document.getElementById('site-data')?.textContent || '{}');
  if(!data?.previews || !data?.search) return;
  const previewById = new Map(data.previews.map(x=>[x.id,x]));
  /** @param {string} key @returns {string[]} */
  function stored(key) { try {const value=JSON.parse(localStorage.getItem('interchange:'+key)||'[]');return Array.isArray(value)?value.filter(v=>typeof v==='string'&&previewById.has(v)):[];} catch{return [];} }
  /** @param {string} key @param {string[]} value */
  function store(key,value) {try{localStorage.setItem('interchange:'+key,JSON.stringify(value));return true;}catch{return false;}}
  /** @param {string} message */
  function toast(message){const box=document.querySelector('.toast');if(!(box instanceof HTMLElement))return;box.textContent=message;box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{box.hidden=true;},3200);}
  /** @param {string} text @param {string} success */
  async function copy(text,success){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw Error('Clipboard unavailable');}toast(success);}catch{toast('Clipboard unavailable. Select and copy the text manually.');}}
  function updateSaved(){const ids=stored('saved');document.querySelectorAll('[data-save]').forEach(el=>{const id=el.getAttribute('data-save');const saved=id!==null&&ids.includes(id);el.setAttribute('aria-pressed',String(saved));el.textContent=saved?'✓ Saved station':'+ Save station';});document.querySelectorAll('[data-saved-count]').forEach(el=>{el.textContent=ids.length?`(${ids.length})`:'';});document.querySelectorAll('[data-saved-row]').forEach(el=>{if(el instanceof HTMLElement)el.hidden=!ids.includes(el.dataset.savedRow||'');});const empty=document.querySelector('[data-saved-empty]');if(empty instanceof HTMLElement)empty.hidden=ids.length>0;}
  let activeSearchTab='all';
  let cachedSearchResults=[];
  let currentSearchQuery='';
  /** @type {AbortController | null} */ let searchFetchAbort=null;

  function renderFiltered(container,status){
    container.replaceChildren();
    const filtered=cachedSearchResults.filter(x=>{
      if(activeSearchTab==='stations')return x.item.kind==='station';
      if(activeSearchTab==='sources')return x.item.kind==='source';
      return true;
    });
    if(!cachedSearchResults.length){
      status.textContent='NO MATCHES. TRY DIFFERENT WORDS OR AN AUTHOR NAME.';
      return;
    }
    status.textContent=`RANKED BY JEV ACROSS ${data.search.length} ITEMS · ${filtered.length} MATCHES`;
    for(const {item,probability} of filtered){
      const a=document.createElement('a');
      a.className='search-result'+(item.kind==='source'?' is-source':' is-station');
      const needleHref = (item.kind==='station'&&currentSearchQuery)
        ? item.url+'?needle='+encodeURIComponent(currentSearchQuery)
        : item.url;
      a.href=needleHref;
      if(item.kind==='source'&&item.external_url)a.setAttribute('data-source-out',item.id);

      const badgeCol=document.createElement('div');
      badgeCol.className='result-badge-col';
      if(item.kind==='station'){
        const badgeSpan=document.createElement('span');
        badgeSpan.className='line-badge small';
        badgeSpan.style.setProperty('--line-color',item.line_color||'#147AD6');
        badgeSpan.textContent=item.line;
        const numSpan=document.createElement('span');
        numSpan.className='mono';
        numSpan.textContent=String(item.number).padStart(2,'0');
        badgeCol.append(badgeSpan,numSpan);
      }else{
        const tag=document.createElement('span');
        tag.className='source-tag mono';
        tag.textContent=item.id;
        badgeCol.append(tag);
      }

      const content=document.createElement('div');
      content.className='result-content';
      if(item.kind==='source'&&item.author){
        const authorEl=document.createElement('span');
        authorEl.className='source-author-tag mono';
        authorEl.textContent=item.author;
        content.append(authorEl);
      }
      const title=document.createElement('h3');
      title.textContent=item.short||item.title;
      const summary=document.createElement('p');
      summary.textContent=item.summary;

      const matchWrap=document.createElement('div');
      matchWrap.className='jev-match';
      const pctValue=Math.max(4,Math.min(100,Math.round(probability*100)));
      matchWrap.title=`Jev semantic match: ${pctValue}%`;
      const bar=document.createElement('span');
      bar.className='jev-bar';
      const fill=document.createElement('i');
      fill.style.width=`${pctValue}%`;
      bar.append(fill);
      const pct=document.createElement('span');
      pct.className='jev-pct mono';
      pct.textContent=`${pctValue}% match`;
      matchWrap.append(bar,pct);

      content.append(title,summary,matchWrap);

      if(item.kind==='station'&&currentSearchQuery){
        const rawSentences=String(item.text||'')
          .split(/(?<=[.?!])\s+/)
          .map(s=>s.trim())
          .filter(s=>s.length>25&&!s.startsWith('Station ')&&!s.startsWith('AI-'));
        const qWords=normaliseQuery(currentSearchQuery).split(' ').filter(Boolean);
        let bestSentence='';
        let bestScore=0;
        for(const s of rawSentences){
          const norm=normaliseQuery(s);
          let hits=0;
          for(const w of qWords){if(norm.includes(w))hits++;}
          const score=qWords.length?hits/qWords.length:0;
          if(score>bestScore){bestScore=score;bestSentence=s;}
        }
        if(bestSentence&&(bestScore>0||probability>=0.7)){
          const snippet=document.createElement('div');
          snippet.className='needle-snippet';
          const snLabel=document.createElement('span');
          snLabel.className='needle-snippet-label mono';
          snLabel.innerHTML='<span class="needle-icon">🪡</span> Key sentence (in context):';
          const snText=document.createElement('p');
          snText.textContent=bestSentence;
          snippet.append(snLabel,snText);
          content.append(snippet);
        }
      }

      const ar=document.createElement('span');
      ar.className='search-arrow';
      ar.textContent='↗';
      ar.setAttribute('aria-hidden','true');
      a.append(badgeCol,content,ar);
      container.append(a);
    }
  }

  /** @param {HTMLElement} scope @param {string} query */
  async function renderResults(scope,query){
    const container=scope.querySelector('[data-search-results]');
    const status=scope.querySelector('[data-search-status]');
    if(!container||!status)return;
    const trimmed=query.trim();
    currentSearchQuery=trimmed;
    if(!trimmed){
      cachedSearchResults=[];
      container.replaceChildren();
      status.textContent=`RANKED BY JEV ACROSS ${data.search.length} ITEMS.`;
      return;
    }
    status.textContent='RANKING WITH JEV ACROSS STATIONS & SOURCES…';
    searchFetchAbort?.abort();
    searchFetchAbort=new AbortController();
    const fetchSignal=searchFetchAbort.signal;
    let scored=[];
    try{
      const res=await fetch('/api/search/',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          query:trimmed,
          items:data.search.map(i=>({id:i.id,text:i.text||(i.title+' '+(i.summary||''))}))
        }),
        signal:fetchSignal
      });
      if(res.ok){
        const body=await res.json();
        if(Array.isArray(body.results)&&body.results.length>0){
          const itemMap=new Map(data.search.map(s=>[s.id,s]));
          scored=body.results
            .filter(r=>itemMap.has(r.id)&&(r.probability>=0.12||body.results.slice(0,6).includes(r)))
            .map(r=>({item:itemMap.get(r.id),probability:r.probability}));
        }
      }
    }catch(err){
      if(/** @type {Error} */(err)?.name==='AbortError')return;
    }
    if(!scored.length){
      const local=rankSearch(data.search,trimmed,24);
      scored=local.map((item,idx)=>({
        item,
        probability:item.probability??Math.max(0.35,Math.round((1-idx*0.04)*100)/100)
      }));
    }
    cachedSearchResults=scored;
    renderFiltered(container,status);
  }
  function boot(){
    lifecycle?.abort();lifecycle=new AbortController();const signal=lifecycle.signal;
    clearTimeout(searchTimer);clearTimeout(toastTimer);
    updateSaved();

    function clearNeedleHighlights(){
      if(globalThis.CSS?.highlights){
        CSS.highlights.delete('needle-focus');
        CSS.highlights.delete('needle-context');
      }
      document.querySelectorAll('.is-needle-target').forEach(el=>el.classList.remove('is-needle-target'));
    }

    function highlightSentence(targetEl,sentenceText){
      clearNeedleHighlights();
      if(!targetEl)return;
      targetEl.classList.add('is-needle-target');
      targetEl.scrollIntoView({behavior:'smooth',block:'center'});

      if(globalThis.CSS?.highlights&&globalThis.Highlight&&window.Range){
        try{
          const trimmed=sentenceText.trim();
          const walker=document.createTreeWalker(targetEl,NodeFilter.SHOW_TEXT);
          let node;
          while((node=walker.nextNode())){
            const idx=node.textContent.indexOf(trimmed);
            if(idx!==-1){
              const r=new Range();
              r.setStart(node,idx);
              r.setEnd(node,idx+trimmed.length);
              const ctxRange=new Range();
              ctxRange.selectNodeContents(targetEl);
              CSS.highlights.set('needle-focus',new Highlight(r));
              CSS.highlights.set('needle-context',new Highlight(ctxRange));
              return;
            }
          }
          const r=new Range();
          r.selectNodeContents(targetEl);
          CSS.highlights.set('needle-focus',new Highlight(r));
        }catch{}
      }
    }

    async function pinpointInStation(query){
      const doc=document.querySelector('.reading-document');
      if(!doc||!query.trim())return;
      const candidates=Array.from(doc.querySelectorAll('p, li, .working-artifact p'))
        .filter(el=>!el.closest('.meta, nav, .article-rail, .rail-actions, footer')&&el.textContent.trim().length>20);
      if(!candidates.length)return;

      const passages=candidates.map((el,i)=>({id:'p'+i,text:el.textContent.trim()}));
      let topMatch=null;

      try{
        const res=await fetch('/api/search/',{
          method:'POST',
          headers:{'content-type':'application/json'},
          body:JSON.stringify({action:'pinpoint',query,passages})
        });
        if(res.ok){
          const body=await res.json();
          topMatch=body.top;
        }
      }catch{}

      if(!topMatch){
        const qWords=normaliseQuery(query).split(' ').filter(Boolean);
        let bestScore=0;
        candidates.forEach((el,i)=>{
          const sentences=(el.textContent||'').split(/(?<=[.?!])\s+/);
          sentences.forEach(s=>{
            const norm=normaliseQuery(s);
            let hits=0;
            qWords.forEach(w=>{if(norm.includes(w))hits++;});
            const score=qWords.length?hits/qWords.length:0;
            if(score>bestScore){
              bestScore=score;
              topMatch={id:'p'+i,focusText:s.trim(),probability:Math.min(0.9,0.3+bestScore*0.6)};
            }
          });
        });
      }

      if(topMatch&&topMatch.focusText){
        const idx=Number(topMatch.id.replace('p',''));
        const targetEl=candidates[idx];
        if(targetEl){
          highlightSentence(targetEl,topMatch.focusText);
          toast(`🪡 Needle: Pointing to matching sentence in context.`);
        }
      }else{
        toast('No matching sentence found on this station.');
      }
    }

    const stationPage=document.querySelector('[data-station-page]');
    if(stationPage){
      const id=stationPage.getAttribute('data-station-page');
      if(id)store('visited',[...new Set([...stored('visited'),id])]);

      const urlParams=new URLSearchParams(location.search);
      const needleQuery=urlParams.get('needle')||urlParams.get('q');
      if(needleQuery){
        setTimeout(()=>pinpointInStation(needleQuery),350);
      }

      const railActions=document.querySelector('.rail-actions');
      if(railActions){
        const needleBtn=document.createElement('button');
        needleBtn.className='text-button';
        needleBtn.setAttribute('data-needle-trigger','');
        needleBtn.textContent='🪡 Find in station';

        const needleBox=document.createElement('div');
        needleBox.className='needle-inpage-box';
        needleBox.hidden=true;
        needleBox.innerHTML='<input data-needle-input placeholder="Ask about this station…" autocomplete="off" /><span class="needle-inpage-status mono" data-needle-status>Press Enter to pinpoint</span><button type="button" class="text-button" data-needle-clear style="margin-top:6px;font-size:11px;">✕ Clear</button>';

        needleBtn.addEventListener('click',()=>{
          needleBox.hidden=!needleBox.hidden;
          if(!needleBox.hidden)needleBox.querySelector('input')?.focus();
        },{signal});

        const needleInput=needleBox.querySelector('input');
        needleInput?.addEventListener('keydown',e=>{
          if(e.key==='Enter'){
            e.preventDefault();
            const q=needleInput.value.trim();
            if(q){
              const status=needleBox.querySelector('[data-needle-status]');
              if(status)status.textContent='Pinpointing with Jev…';
              pinpointInStation(q).then(()=>{
                if(status)status.textContent='Sentence highlighted in context';
              });
            }
          }
        },{signal});

        needleBox.querySelector('[data-needle-clear]')?.addEventListener('click',()=>{
          clearNeedleHighlights();
          needleBox.hidden=true;
        },{signal});

        railActions.append(needleBtn,needleBox);
      }
    }
    document.querySelectorAll('[data-save]').forEach(el=>el.addEventListener('click',()=>{const id=el.getAttribute('data-save');if(!id)return;let ids=stored('saved');ids=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];if(store('saved',ids)){updateSaved();toast(ids.includes(id)?'Station saved locally on this device.':'Station removed from this device.');}else{toast('Browser storage is unavailable. Save the station link instead.');}},{signal}));
    document.querySelectorAll('[data-copy-link]').forEach(el=>el.addEventListener('click',()=>{if(window.__OFFLINE__){void copy(location.href,'Local preview link copied. Share the HTML file with it.');}else{void copy(location.href,'Station link copied.');}},{signal}));
    document.querySelectorAll('[data-copy-artifact]').forEach(el=>el.addEventListener('click',()=>{const text=el.closest('.working-artifact')?.querySelector('p:not(.meta)')?.textContent||'';void copy(text,'Working artifact copied.');},{signal}));
    document.querySelectorAll('[data-clear-storage]').forEach(el=>el.addEventListener('click',()=>{const success=store('saved',[])&&store('visited',[]);updateSaved();toast(success?'Saved and visited stations cleared.':'Browser storage is unavailable.');},{signal}));
    document.querySelectorAll('[data-source-out]').forEach(el=>el.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('interchange:source-out',{detail:{source:el.getAttribute('data-source-out')}}));},{signal}));
    // Native dialog has keyboard containment, Escape and a real fallback search URL.
    const dialog=document.getElementById('search-dialog');let lastFocus=document.activeElement;
    const openSearch=()=>{if(!(dialog instanceof HTMLDialogElement))return;lastFocus=document.activeElement;dialog.showModal();const input=dialog.querySelector('input');input?.focus();};
    document.querySelectorAll('.search-trigger').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();openSearch();},{signal}));
    document.querySelector('[data-close-search]')?.addEventListener('click',()=>{if(dialog instanceof HTMLDialogElement)dialog.close();},{signal});
    dialog?.addEventListener('close',()=>{if(lastFocus instanceof HTMLElement)lastFocus.focus();},{signal});
    dialog?.addEventListener('click',event=>{if(!(dialog instanceof HTMLDialogElement))return;if(event.target===dialog){const box=dialog.getBoundingClientRect();const e=/** @type {MouseEvent} */(event);if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();}},{signal});
    document.addEventListener('keydown',event=>{const target=event.target;const editing=target instanceof HTMLElement&&(target.matches('input,textarea,select')||target.isContentEditable);if((event.key==='/'&&!editing)||((event.ctrlKey||event.metaKey)&&event.key==='k')){event.preventDefault();openSearch();}},{signal});
    document.querySelectorAll('[data-search-tab]').forEach(tab=>{tab.addEventListener('click',()=>{const val=tab.getAttribute('data-search-tab')||'all';activeSearchTab=val;document.querySelectorAll('[data-search-tab]').forEach(t=>{const active=t.getAttribute('data-search-tab')===val;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',String(active));});const scope=tab.closest('dialog')||tab.closest('main');if(scope instanceof HTMLElement){const container=scope.querySelector('[data-search-results]');const status=scope.querySelector('[data-search-status]');if(container&&status)renderFiltered(container,status);}},{signal});});
    document.querySelectorAll('[data-search-input]').forEach(el=>{if(!(el instanceof HTMLInputElement))return;const scope=el.closest('dialog')||el.closest('main');if(!(scope instanceof HTMLElement))return;el.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>renderResults(scope,el.value),180);},{signal});});
    // Text index: no layout or source details enter the search query pipeline.
    let filter='all';const indexInput=document.querySelector('[data-index-query]');
    const filterIndex=()=>{const query=indexInput instanceof HTMLInputElement?normaliseQuery(indexInput.value):'';let count=0;document.querySelectorAll('.index-line .station-row').forEach(el=>{if(!(el instanceof HTMLElement))return;const matches=(filter==='all'||el.dataset.indexLine===filter)&&normaliseQuery(el.dataset.searchText||'').includes(query);el.hidden=!matches;if(matches)count++;});document.querySelectorAll('[data-index-section]').forEach(el=>{if(el instanceof HTMLElement)el.hidden=!Array.from(el.querySelectorAll('.station-row')).some(row=>row instanceof HTMLElement&&!row.hidden);});const countEl=document.querySelector('[data-index-count]');if(countEl)countEl.textContent=`${count} station${count===1?'':'s'}`;const empty=document.querySelector('[data-index-empty]');if(empty instanceof HTMLElement)empty.hidden=count>0;};
    indexInput?.addEventListener('input',filterIndex,{signal});document.querySelectorAll('[data-index-filter]').forEach(el=>el.addEventListener('click',()=>{filter=el.getAttribute('data-index-filter')||'all';document.querySelectorAll('[data-index-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));filterIndex();},{signal}));
    const sourceInput=document.querySelector('[data-source-query]');sourceInput?.addEventListener('input',()=>{if(!(sourceInput instanceof HTMLInputElement))return;const query=normaliseQuery(sourceInput.value);let count=0;document.querySelectorAll('[data-source-filter]').forEach(el=>{if(!(el instanceof HTMLElement))return;el.hidden=!normaliseQuery(el.dataset.sourceFilter||'').includes(query);if(!el.hidden)count++;});const label=document.querySelector('[data-source-count]');if(label)label.textContent=`${count} matching source${count===1?'':'s'}`;const empty=document.querySelector('[data-source-empty]');if(empty instanceof HTMLElement)empty.hidden=count>0;},{signal});
    // Fixed geometry: only emphasis changes when a line or interchange is focused.
    const svg=document.querySelector('.metro-map');const detail=document.getElementById('line-detail');const reset=document.querySelector('[data-reset-network]');
    let selected='';
    /** @param {string[]} ids */
    const emphasize=ids=>{if(!svg)return;if(ids.length)svg.setAttribute('data-active-lines',ids.join(' '));else svg.removeAttribute('data-active-lines');svg.querySelectorAll('[data-network-part]').forEach(el=>{const own=(el.getAttribute('data-lines')||'').split(' ');el.classList.toggle('is-muted',ids.length>0&&!own.some(id=>ids.includes(id)));});};
    /** @param {string} line @param {boolean} move */
    const setLine=(line,move=false)=>{selected=line;emphasize(line?[line]:[]);document.querySelectorAll('[data-select-line]').forEach(el=>{const active=el.getAttribute('data-select-line')===line;if(active)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');el.setAttribute('aria-expanded',String(active));el.classList.toggle('is-dimmed',Boolean(line)&&!active);});document.querySelectorAll('[data-line-panel]').forEach(el=>{if(el instanceof HTMLElement)el.hidden=el.dataset.linePanel!==line;});if(detail)detail.hidden=!line;if(reset instanceof HTMLElement)reset.hidden=!line;const status=document.getElementById('line-state');if(status)status.textContent=line?`Line ${line} · ${data.previews.filter(s=>s.line===line).length} stations`:'Six lines · 36 stations';if(move&&matchMedia('(max-width:1200px)').matches&&line){detail?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}};
    document.querySelectorAll('[data-select-line]').forEach(el=>{el.addEventListener('click',event=>{event.preventDefault();const value=el.getAttribute('data-select-line')||'';setLine(selected===value?'':value,true);},{signal});el.addEventListener('pointerenter',()=>emphasize([el.getAttribute('data-select-line')||'']),{signal});el.addEventListener('pointerleave',()=>emphasize(selected?[selected]:[]),{signal});});
    reset?.addEventListener('click',()=>setLine(''),{signal});
    const tooltip=document.getElementById('station-tooltip');const canvas=document.getElementById('network');
    /** @param {Element} el */
    const showTip=el=>{const id=el.getAttribute('data-station');const s=id?previewById.get(id):null;if(!s||!tooltip||!canvas)return;tooltip.querySelector('[data-tip-meta]')?.replaceChildren(document.createTextNode(`Station ${String(s.number).padStart(2,'0')} · Line ${s.line}`));tooltip.querySelector('[data-tip-title]')?.replaceChildren(document.createTextNode(s.title));tooltip.querySelector('[data-tip-summary]')?.replaceChildren(document.createTextNode(s.summary));tooltip.hidden=false;const a=el.getBoundingClientRect();const box=canvas.getBoundingClientRect();const tipWidth=tooltip.offsetWidth;let left=a.left-box.left+22;let top=a.top-box.top-35;if(left+tipWidth>box.width-5)left=a.left-box.left-tipWidth-18;left=Math.max(4,left);top=Math.max(0,Math.min(top,box.height-tooltip.offsetHeight-5));tooltip.style.left=`${left}px`;tooltip.style.top=`${top}px`;el.setAttribute('aria-describedby','station-tooltip');};
    const hideTip=()=>{if(tooltip)tooltip.hidden=true;svg?.querySelectorAll('[aria-describedby="station-tooltip"]').forEach(el=>el.removeAttribute('aria-describedby'));};
    svg?.querySelectorAll('[data-station]').forEach(el=>{el.addEventListener('pointerenter',()=>showTip(el),{signal});el.addEventListener('pointerleave',hideTip,{signal});el.addEventListener('focus',()=>showTip(el),{signal});el.addEventListener('blur',hideTip,{signal});});
    svg?.querySelectorAll('.transfer-mark').forEach(el=>{el.addEventListener('pointerenter',()=>emphasize((el.getAttribute('data-lines')||'').split(' ')),{signal});el.addEventListener('pointerleave',()=>emphasize(selected?[selected]:[]),{signal});el.addEventListener('focusin',()=>emphasize((el.getAttribute('data-lines')||'').split(' ')),{signal});el.addEventListener('focusout',()=>emphasize(selected?[selected]:[]),{signal});});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!(dialog instanceof HTMLDialogElement&&dialog.open)){hideTip();setLine('');}},{signal});
    const currentURL=window.__OFFLINE__?new URL('https://preview.invalid'+(location.hash.slice(1)||'/')):new URL(location.href);
    const fromLine=currentURL.searchParams.get('line');if(fromLine&&/^[A-F]$/.test(fromLine))setLine(fromLine);
    const fromStation=currentURL.searchParams.get('station');if(fromStation&&previewById.has(fromStation)){svg?.querySelector(`[data-station="${fromStation}"]`)?.classList.add('is-current');}
    const fromQuery=currentURL.searchParams.get('q');
    if(fromQuery){
      document.querySelectorAll('[data-search-input]').forEach(input=>{
        if(input instanceof HTMLInputElement){
          input.value=fromQuery;
          const scope=input.closest('dialog')||input.closest('main');
          if(scope instanceof HTMLElement){
            renderResults(scope,fromQuery);
          }
        }
      });
    }
    // The article's margin anchors reflect actual scroll position without moving content.
    if('IntersectionObserver' in window&&document.querySelector('.article-rail nav')){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('.article-rail nav a').forEach(a=>{if(a.getAttribute('href')==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-90px 0px -65% 0px',threshold:0});document.querySelectorAll('.reading-document>section[id]').forEach(section=>observer.observe(section));signal.addEventListener('abort',()=>observer.disconnect(),{once:true});}
  }
  window.Interchange={boot,dispose:()=>{lifecycle?.abort();clearTimeout(searchTimer);clearTimeout(toastTimer);}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

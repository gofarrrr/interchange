"""Browser checks for the actual standalone build.

pip install playwright
playwright install chromium
python tests/browser-checks.py

CHROMIUM_BIN can select a locally installed Chromium.
This harness uses set_content: no browser navigation or outside sources are needed.
It tests the same generated DOM/CSS/client code delivered in INTERCHANGE.html.
The storage-success check uses a test double on the isolated about:blank origin;
the real unavailable-storage path is tested separately.
"""
from pathlib import Path
import json, os, time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/'reports';REPORT.mkdir(exist_ok=True)
SHOTS=ROOT/'screenshots';SHOTS.mkdir(exist_ok=True)
html=(ROOT/'INTERCHANGE.html').read_text()
results=[];js_errors=[]
def check(name,fn):
    try:
        fn();results.append({'test':name,'status':'passed'})
    except Exception as error:
        results.append({'test':name,'status':'failed','detail':str(error)[:1600]})
def expect(value,message):
    if not value:raise AssertionError(message)
with sync_playwright() as p:
    opts={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('CHROMIUM_BIN'):opts['executable_path']=os.environ['CHROMIUM_BIN']
    b=p.chromium.launch(**opts)
    page=b.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    page.on('pageerror',lambda e:js_errors.append(str(e)))
    page.set_content(html,wait_until='load')
    def navigate(path):
        page.evaluate('(path)=>{location.hash="#"+path}',path)
        page.wait_for_timeout(130)
    check('Homepage renders 36 unique station anchors',lambda:expect(page.locator('.map-station').count()==36,'Expected 36 anchors'))
    def hover():
        page.locator('[data-station="AI-20"]').hover()
        expect(page.locator('#station-tooltip').is_visible(),'Tooltip not visible')
        expect('Enforce permissions' in page.locator('#station-tooltip').inner_text(),'Wrong preview copy')
        page.screenshot(path=str(SHOTS/'03-station-preview.png'))
        page.mouse.move(10,10)
    check('Station hover shows real station copy',hover)
    def line_focus():
        before=page.locator('.route-path').evaluate_all('(els)=>els.map(e=>e.getAttribute("d"))')
        page.locator('[data-select-line="D"]').click()
        expect(page.locator('[data-line-panel="D"] .strip-station').count()==5,'Wrong line count')
        expect(page.locator('[data-line-panel="D"]').is_visible(),'Focused line hidden')
        expect(page.locator('.metro-map').get_attribute('data-active-lines')=='D','Line emphasis absent')
        after=page.locator('.route-path').evaluate_all('(els)=>els.map(e=>e.getAttribute("d"))')
        expect(before==after,'Geometry moved')
        page.locator('[data-reset-network]').click()
        expect(page.locator('#line-detail').is_hidden(),'Reset failed')
    check('Line focus filters stations without moving geometry',line_focus)
    def keyboard():
        page.locator('[data-station="AI-20"]').focus()
        page.keyboard.press('Enter')
        page.wait_for_timeout(150)
        expect(page.locator('[data-station-page="AI-20"]').count()==1,'Enter did not open station')
        expect('Confusing instructions with access controls' in page.locator('h1').inner_text(),'Wrong station')
        page.screenshot(path=str(SHOTS/'02-reading-page.png'))
    check('Keyboard Enter opens canonical station content',keyboard)
    def sources():
        a=page.locator('#source-S01 .source-link')
        expect(a.get_attribute('href').startswith('https://assets-'),'Original PDF URL missing')
        expect('#page=' in a.get_attribute('href'),'PDF locator missing')
        expect(page.locator('.evidence-caveat').count()>0,'Qualifications missing')
        page.locator('.article-source-shortcut').click()
        page.wait_for_timeout(160)
        expect('#originals' in page.url,'Section anchor missing')
        expect(page.locator('#originals').is_visible(),'Sources not available')
    check('Visible evidence qualifications and original-source deep link',sources)
    def storage_unavailable():
        navigate('/stations/20-enforced-agent-permissions/')
        # Storage access on this origin may be disallowed; force that scenario explicitly.
        page.evaluate("Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Blocked','SecurityError')}})")
        page.locator('[data-save]').click()
        expect('unavailable' in page.locator('.toast').inner_text(),'No useful storage error')
    check('Unavailable storage has an honest fallback',storage_unavailable)
    def saved():
        page.evaluate("""() => {const memory=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}});window.Interchange.boot();}""")
        page.locator('[data-save]').click()
        expect(page.locator('[data-save]').get_attribute('aria-pressed')=='true','Save state missing')
        navigate('/saved/')
        expect(page.locator('[data-saved-row="AI-20"]').is_visible(),'Saved list did not update')
        navigate('/stations/20-enforced-agent-permissions/')
        expect(page.locator('[data-save]').get_attribute('aria-pressed')=='true','Save lost during navigation')
        page.locator('[data-save]').click()
    check('Saved-station behavior and route persistence (storage test double)',saved)
    def search_dialog():
        navigate('/')
        page.keyboard.press('/')
        expect(page.locator('#search-dialog').is_visible(),'Search shortcut failed')
        page.locator('#dialog-query').fill('permissions')
        page.wait_for_timeout(200)
        expect('Enforce permissions' in page.locator('#search-dialog .search-result').first.inner_text(),'Wrong search ranking')
        page.screenshot(path=str(SHOTS/'06-search.png'))
        page.keyboard.press('Escape')
        expect(page.locator('#search-dialog').is_hidden(),'Escape did not dismiss search')
        page.locator('.search-trigger').click()
        page.locator('#dialog-query').fill('AI-20')
        page.wait_for_timeout(200)
        page.locator('#search-dialog .search-result').first.click()
        page.wait_for_timeout(150)
        expect(page.locator('[data-station-page="AI-20"]').count()==1,'Search result did not navigate')
    check('Search shortcut, ranking, Escape and result navigation',search_dialog)
    def index():
        navigate('/index/')
        expect(page.locator('.index-line .station-row:visible').count()==36,'Index not complete')
        page.locator('[data-index-filter="D"]').click()
        expect(page.locator('.index-line .station-row:visible').count()==5,'Line filter failed')
        page.locator('#index-query').fill('permissions')
        expect(page.locator('.index-line .station-row:visible').count()==1,'Text filter failed')
        page.locator('#index-query').fill('zzzzxxyyyy')
        expect(page.locator('[data-index-empty]').is_visible(),'Empty state missing')
    check('Index line filter, text filter and empty state',index)
    def source_filter():
        navigate('/sources/')
        expect(page.locator('[data-source-filter]').count()==31,'Wrong source count')
        page.locator('#source-query').fill('Microsoft')
        expect(page.locator('[data-source-filter]:visible').count()==1,'Source filtering failed')
    check('Source directory contains and filters 31 supplied public links',source_filter)
    def journey():
        navigate('/routes/prove-value/')
        expect(page.locator('.journey-stop').count()==6,'Expected six journey stops')
    check('Curated journey opens existing stations',journey)
    def all_stations():
        records=json.loads((ROOT/'dist/assets/data.js').read_text().removeprefix('window.__SITE_DATA__=').removesuffix(';'))['previews']
        for s in records:
            navigate(s['url'])
            expect(page.locator('[data-station-page="'+s['id']+'"]').count()==1,'Missing '+s['id'])
            expect(page.locator('#originals .source-link').count()>0,'No source link on '+s['id'])
            expect(page.locator('.article-header h1').count()==1,'Bad heading on '+s['id'])
    check('All 36 station pages open with original-source links',all_stations)
    def hero_network_collision():
        # Regression for route strokes crossing the hero CTA text on wide screens.
        # Sample each visible route path in screen coordinates and ensure it stays
        # outside the readable boxes (including a 5px breathing buffer).
        script = """() => {
          const targets=[...document.querySelectorAll('.hero-actions a')].map(el=>({
            label:el.textContent.trim(), rect:el.getBoundingClientRect()
          }));
          const hits=[];
          for(const path of document.querySelectorAll('.route-path')){
            const length=path.getTotalLength();
            const ctm=path.getScreenCTM();
            if(!ctm) continue;
            for(let d=0; d<=length; d+=1){
              const p=path.getPointAtLength(d);
              const x=ctm.a*p.x+ctm.c*p.y+ctm.e;
              const y=ctm.b*p.x+ctm.d*p.y+ctm.f;
              for(const target of targets){
                const r=target.rect;
                if(x>=r.left-5 && x<=r.right+5 && y>=r.top-5 && y<=r.bottom+5){
                  hits.push({label:target.label,x,y});
                  d=length+1;
                  break;
                }
              }
            }
          }
          return hits;
        }"""
        for width in [1280, 1365, 1440, 1536, 1600]:
            page.set_viewport_size({'width':width,'height':950});navigate('/')
            hits=page.evaluate(script)
            expect(len(hits)==0,f'Hero/network collision at {width}px: {hits}')
    check('Hero actions stay clear of route strokes at wide desktop widths',hero_network_collision)

    def responsive():
        for width in [320,390,768,1024,1280,1600]:
            page.set_viewport_size({'width':width,'height':950})
            for path in ['/','/stations/20-enforced-agent-permissions/','/index/','/sources/']:
                navigate(path)
                size=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
                expect(size['scroll']<=size['width']+1,f'Horizontal overflow at {width} on {path}: {size}')
        page.set_viewport_size({'width':390,'height':844});navigate('/')
        expect(page.locator('.network-canvas').is_hidden(),'Tiny desktop map exposed on mobile')
        page.locator('[data-select-line="D"]').click();page.wait_for_timeout(650)
        expect(page.locator('[data-line-panel="D"] .strip-station:visible').count()==5,'Mobile route strip not working')
        page.screenshot(path=str(SHOTS/'05-mobile-line.png'))
    check('Reflow at six widths and functional mobile route strip',responsive)
    def reduced_motion():
        page.emulate_media(reduced_motion='reduce');page.set_viewport_size({'width':1440,'height':1100});navigate('/')
        expect(page.locator('.route-ink').first.evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s','Motion not disabled')
        page.emulate_media(reduced_motion='no-preference')
    check('Reduced-motion preference disables transitions',reduced_motion)
    def unknown():
        navigate('/this-station-does-not-exist/')
        expect('isn’t on the network' in page.locator('h1').inner_text(),'Missing 404 state')
    check('Unknown route has a useful 404 page',unknown)
    def all_names():
        navigate('/')
        missing=page.locator('a,button').evaluate_all('(els)=>els.filter(e=>!e.getAttribute("aria-label")&&!e.textContent.trim()).length')
        expect(missing==0,'Unnamed controls')
    check('Interactive controls have readable or explicit accessible names',all_names)
    def without_js():
        ctx=b.new_context(java_script_enabled=False,viewport={'width':1440,'height':1100})
        static=ctx.new_page()
        css=(ROOT/'src/styles/style.css').read_text()
        source=(ROOT/'dist/index/index.html').read_text().replace('</head>','<style>'+css+'</style></head>')
        static.set_content(source,wait_until='load')
        expect(static.locator('.index-line .station-row').count()==36,'No-JS index incomplete')
        expect(static.locator('h1').count()==1,'No-JS header missing')
        ctx.close()
    check('No-JavaScript text index remains complete',without_js)
    navigate('/');page.set_viewport_size({'width':1440,'height':1100});page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(350)
    page.screenshot(path=str(SHOTS/'01-desktop-map.png'))
    page.screenshot(path=str(SHOTS/'01-desktop-full.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(350)
    page.screenshot(path=str(SHOTS/'04-mobile.png'))
    navigate('/stations/20-enforced-agent-permissions/')
    page.screenshot(path=str(SHOTS/'07-mobile-reading.png'))
    b.close()
report={'environment':'Chromium, isolated-document rendering of the standalone build','browser_url_navigation':'Not tested: container-managed Chromium blocks URL navigation. HTTP serving tested separately.','storage_success':'Uses explicit in-memory test double; blocked storage branch tested separately.','external_source_availability':'Not tested. Source URLs and locators are inherited, not re-verified.','tests':results,'javascript_errors':js_errors,'passed':sum(x['status']=='passed' for x in results),'failed':sum(x['status']=='failed' for x in results),'not_certified':['Safari','Firefox','real screen-reader workflows','WCAG compliance','Astro adapter','Pagefind binary']}
(REPORT/'browser-tests.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if report['failed'] or js_errors:raise SystemExit(1)

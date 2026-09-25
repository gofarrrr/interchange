"""Targeted v1.1 checks. No live X traffic, claims of source verification or mocks of the app."""
from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
results=[]; errors=[]
URLS=[
 'https://x.com/mardehaym/status/2103172822067466587',
 'https://x.com/businessbarista/status/2102763567422251107'
]
def check(name,fn):
    try:
        fn();results.append({'test':name,'status':'passed'})
    except Exception as e:results.append({'test':name,'status':'failed','detail':str(e)})
def expect(v,m):
    if not v:raise AssertionError(m)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_BIN','/usr/bin/chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content((ROOT/'INTERCHANGE.html').read_text(),wait_until='load')
    page.evaluate('location.hash="#/about/"');page.wait_for_timeout(200)
    def credits():
        expect(page.locator('[data-origin-link]').count()==2,'Missing credits')
        expect(page.locator('[data-origin-link]').evaluate_all('(els)=>els.map(e=>e.href)')==URLS,'Original URLs changed')
        for phrase in ['Mark Ajzenstadt','Alex Lieberman','@mardehaym','@businessbarista']:
            expect(phrase in page.locator('#origins').inner_text(),'Missing '+phrase)
        expect(page.locator('iframe').count()==0,'X embed found')
    check('Offline About shows both names and exact original links, without X embeds',credits)
    def living():
        page.locator('.about-jump-links a[href="#living-guide"]').click();page.wait_for_timeout(300)
        expect('#/about/#living-guide' in page.url,'Offline anchor was not retained')
        expect('not a longer bibliography' in page.locator('#living-guide').inner_text(),'Purpose missing')
        expect(page.locator('#editorial-approach dt').count()==3,'Editorial approaches absent')
    check('Living-guide section and progressive document anchors work',living)
    page.evaluate('location.hash="#/about/"');page.wait_for_timeout(150)
    page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(250)
    page.screenshot(path=str(ROOT/'screenshots/08-about-origins.png'),full_page=True)
    page.screenshot(path=str(ROOT/'screenshots/09-about-desktop.png'))
    def layout():
        for width in [320,390,768,1024,1280,1600]:
            page.set_viewport_size({'width':width,'height':1000})
            expect(page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'Overflow at {width}')
    check('About reflows at six widths from 320 to 1600 pixels',layout)
    page.set_viewport_size({'width':390,'height':844});page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(200)
    page.screenshot(path=str(ROOT/'screenshots/10-about-mobile.png'),full_page=True)
    def keyfocus():
        a=page.locator('[data-origin-link]').first;a.focus()
        expect(a.evaluate('(e)=>document.activeElement===e'),'Origin link not focusable')
        expect('Mark Ajzenstadt' in a.get_attribute('aria-label'),'Link missing descriptive name')
    check('Origin links are keyboard-focusable and explicitly named',keyfocus)
    def sources_route():
        page.evaluate('location.hash="#/sources/"');page.wait_for_timeout(150)
        page.locator('.source-directory-note a').click();page.wait_for_timeout(300)
        expect('#/about/#origins' in page.url,'Source directory did not reach origin section')
        expect(page.locator('[data-origin-link]').count()==2,'Origin links missing after navigation')
    check('Source directory links to origin credits without increasing evidence counts',sources_route)
    def static_no_js():
        ctx=browser.new_context(java_script_enabled=False,viewport={'width':1440,'height':1000})
        q=ctx.new_page()
        html=(ROOT/'dist/about/index.html').read_text().replace('</head>','<style>'+(ROOT/'src/styles/style.css').read_text()+'</style></head>')
        q.set_content(html)
        expect(q.locator('[data-origin-link]').count()==2,'Static credit links missing')
        expect(q.locator('#living-guide').is_visible(),'Static living-guide text missing')
        ctx.close()
    check('Static About retains credits and living-guide text without JavaScript',static_no_js)
    browser.close()
report={'version':'1.1.0','method':'Chromium, standalone build via set_content; static About with JavaScript disabled','tests':results,'javascript_errors':errors,'passed':sum(t['status']=='passed' for t in results),'failed':sum(t['status']=='failed' for t in results),'external_posts':'Not loaded by the browser tests; author/title search-index check documented separately.'}
(ROOT/'reports/about-browser-tests.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if report['failed'] or errors:raise SystemExit(1)

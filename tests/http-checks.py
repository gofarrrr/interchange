"""Test generated pages through the actual HTTP server (standard library only).

python tests/http-checks.py
BASE_PATH=/field-guide/ OUT_DIR=dist-subpath python tests/http-checks.py
"""
from pathlib import Path
import json, os, subprocess, time, urllib.request, urllib.error, socket
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / os.environ.get('OUT_DIR', 'dist')
BASE = '/' + os.environ.get('BASE_PATH', '/').strip('/') + '/'
if BASE == '//': BASE = '/'
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
env = dict(os.environ, PORT=str(port), BASE_PATH=BASE)
server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
origin = f'http://127.0.0.1:{port}'
results=[]
def fetch(path, method='GET'):
    try:
        with urllib.request.urlopen(urllib.request.Request(origin+path,method=method),timeout=5) as response:
            return response.status, response.read(), response.headers
    except urllib.error.HTTPError as error:
        return error.code, error.read(), error.headers
try:
    for _ in range(60):
        try:
            if fetch(BASE)[0]==200: break
        except OSError: pass
        time.sleep(.1)
    else: raise RuntimeError('Server did not start')
    pages=sorted(OUT.rglob('index.html'))
    for f in pages:
        rel=f.relative_to(OUT).parent.as_posix()
        path=BASE+(rel+'/' if rel!='.' else '')
        status,body,headers=fetch(path)
        if status!=200 or b'<!doctype html>' not in body.lower():
            raise AssertionError(f'Invalid page response {path}: {status}')
        if 'nosniff'!=headers.get('X-Content-Type-Options'): raise AssertionError('Missing nosniff')
    results.append({'test':'All generated canonical pages return HTML with HTTP 200','count':len(pages),'status':'passed'})
    for name,mime in [('assets/app.js','text/javascript'),('assets/data.js','text/javascript'),('assets/style.css','text/css'),('favicon.svg','image/svg+xml'),('robots.txt','text/plain')]:
        status,body,headers=fetch(BASE+name)
        if status!=200 or not headers.get('Content-Type','').startswith(mime):raise AssertionError('Bad asset '+name)
    results.append({'test':'Five shared assets return their correct MIME type','status':'passed'})
    status,body,headers=fetch(BASE+'not-a-route/')
    assert status==404 and b'network' in body
    assert fetch(BASE,'POST')[0]==405
    assert fetch(BASE,'HEAD')[0]==200 and fetch(BASE,'HEAD')[1]==b''
    results.append({'test':'404, POST 405, HEAD 200 with empty body','status':'passed'})
    assert fetch(BASE+'content/stations/20-enforced-agent-permissions.json')[0]==404
    assert fetch(BASE+'src/render.mjs')[0]==404
    results.append({'test':'Server exposes output only, not authoring content or source code','status':'passed'})
    if BASE!='/':
        assert fetch('/')[0]==404
        results.append({'test':'BASE_PATH boundary enforced','status':'passed'})
    report={'base':BASE,'output':OUT.name,'transport':'Real Node HTTP server + Python urllib','tests':results,'failures':0,'browser_HTTP_navigation':'Not claimed by this transport check','external_sources':'Not fetched'}
    target=ROOT/'reports'/('http-subpath.json' if BASE!='/' else 'http-tests.json')
    target.write_text(json.dumps(report,indent=2)); print(json.dumps(report,indent=2))
finally:
    server.terminate(); server.wait(timeout=5)

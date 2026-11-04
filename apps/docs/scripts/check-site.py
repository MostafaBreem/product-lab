#!/usr/bin/env python3
"""Check a built docs site in headless Chrome: every component Playground renders,
has live controls, its docs page shows the Playground, foundation pages load, no console errors.

Run after `npm run build -w apps/docs` (cloud session: the side browser cannot open localhost):
    python3 apps/docs/scripts/check-site.py [--dist apps/docs/dist] [--port 6070] [--chrome /usr/bin/google-chrome]
Needs Python playwright + a Chrome binary. Exit 1 when any row fails.
"""
import argparse, asyncio, functools, http.server, pathlib, re, sys, threading

from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument('--dist', default=str(HERE.parent / 'dist'))
ap.add_argument('--port', type=int, default=6070)
ap.add_argument('--chrome', default='/usr/bin/google-chrome')
a = ap.parse_args()

STORIES = sorted(p.name.replace('.stories.tsx', '') for p in (HERE.parent / 'src' / 'stories').glob('*.stories.tsx'))
FOUNDATIONS = ['colour', 'elevation', 'radius', 'size', 'spacing', 'type']


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    h = functools.partial(Quiet, directory=a.dist)
    s = http.server.ThreadingHTTPServer(('127.0.0.1', a.port), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


async def main():
    base = f'http://127.0.0.1:{a.port}/?path='
    rows, errs = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=a.chrome, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 900})
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        frame = pg.frame_locator('#storybook-preview-iframe')
        for name in STORIES:
            sid = name.lower()
            await pg.goto(f'{base}/story/components-{sid}-examples--playground')
            await pg.wait_for_timeout(2000)
            err = await frame.locator('.sb-errordisplay').is_visible()
            text = (await frame.locator('#storybook-root').inner_text()).strip()
            ctrls = await pg.locator('.docblock-argstable tbody tr').count()
            await pg.goto(f'{base}/docs/components-{sid}-docs--docs')
            await pg.wait_for_timeout(2500)
            body = await frame.locator('body').inner_text()
            docs_pg = 'Playground' in body
            ok = not err and bool(text or name == 'Switch') and ctrls > 0 and docs_pg
            rows.append((name, 'ok' if ok else 'FAIL', f'controls {ctrls}', 'docs playground' if docs_pg else 'docs: NO playground', 'render error' if err else re.sub(r'\s+', ' ', text)[:40]))
        for f in FOUNDATIONS:
            await pg.goto(f'{base}/docs/foundations-{f}--docs')
            await pg.wait_for_timeout(2000)
            body = await frame.locator('body').inner_text()
            ok = 'Full table' in body
            rows.append((f'Foundations/{f}', 'ok' if ok else 'FAIL', '', '', 'table' if ok else 'no table'))
        await b.close()
    for r in rows:
        print(' | '.join(r))
    print(f'console errors: {len(errs)}')
    for e in errs[:5]:
        print('  ', e[:200])
    return 0 if all(r[1] == 'ok' for r in rows) and not errs else 1


srv = serve()
code = asyncio.run(main())
srv.shutdown()
sys.exit(code)

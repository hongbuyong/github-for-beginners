// social 폴더를 브라우저에서 열 수 있게 해 주는 작은 웹 서버
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml',
};

export async function listCases() {
  return (await readdir(join(ROOT, 'cases')))
    .filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
}

export function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    try {
      if (url.pathname === '/') { res.writeHead(302, { location: '/template/index.html' }); return res.end(); }
      if (url.pathname === '/api/cases') {
        res.writeHead(200, { 'content-type': TYPES['.json'] });
        return res.end(JSON.stringify(await listCases()));
      }
      const file = normalize(join(ROOT, decodeURIComponent(url.pathname)));
      if (!file.startsWith(ROOT + sep)) throw new Error('outside');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

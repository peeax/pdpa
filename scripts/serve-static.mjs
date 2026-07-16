import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { SECURITY_HEADERS } from '../lib/security-headers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'out');
const port = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    ...Object.fromEntries(SECURITY_HEADERS),
    ...headers,
  });
  res.end(body);
}

function resolveFile(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  const cleanPath = decodedPath.replace(/^\/+/, '');
  const requested = path.resolve(outDir, cleanPath);
  if (!requested.startsWith(outDir)) return null;

  const candidates = [];
  if (path.extname(requested)) candidates.push(requested);
  candidates.push(path.join(requested, 'index.html'));
  candidates.push(`${requested}.html`);

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

if (!fs.existsSync(outDir)) {
  console.error('Missing ./out. Run `npm run build` before `npm run start`.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  const filePath = resolveFile(req.url || '/');
  if (!filePath) {
    const notFoundPath = path.join(outDir, '404.html');
    const body = fs.existsSync(notFoundPath) ? fs.readFileSync(notFoundPath) : 'Not Found';
    send(res, 404, req.method === 'HEAD' ? '' : body, { 'Content-Type': 'text/html; charset=utf-8' });
    return;
  }

  const ext = path.extname(filePath);
  const body = req.method === 'HEAD' ? '' : fs.readFileSync(filePath);
  send(res, 200, body, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=300',
  });
});

server.listen(port, () => {
  console.log(`Serving ./out at http://localhost:${port}`);
});

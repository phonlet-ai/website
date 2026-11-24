// Serves the static export (out/) the way GitHub Pages does: index.html for directories, a
// redirect to the trailing slash, 404.html for anything missing, the same content types and gzip.
// Usage: node scripts/serve.mjs [dir] [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const binary = new Set(['.png', '.ico', '.woff', '.woff2']);
const cache = new Map();
// Compressed bodies, cached per file until it changes (the generator module is 18 MB).
async function gzipped(file, body) {
  const { mtimeMs } = await stat(file);
  const hit = cache.get(file);
  if (hit?.mtimeMs === mtimeMs) return hit.body;
  const compressed = await promisify(gzip)(body);
  cache.set(file, { mtimeMs, body: compressed });
  return compressed;
}

const root = process.argv[2] ?? 'out';
const port = Number(process.argv[3] ?? 3002);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};
const isFile = (path) =>
  stat(path).then(
    (s) => s.isFile(),
    () => false,
  );
const isDir = (path) =>
  stat(path).then(
    (s) => s.isDirectory(),
    () => false,
  );

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, path);
  if (path.endsWith('/')) file = join(file, 'index.html');
  else if (await isDir(file)) {
    response.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
    return;
  }
  let status = 200;
  if (!(await isFile(file))) {
    status = 404;
    file = join(root, '404.html');
  }
  let body = await readFile(file);
  const headers = { 'content-type': types[extname(file)] ?? 'application/octet-stream' };
  // Like Pages: gzip everything but images and fonts when the client accepts it, with
  // Content-Length counting the compressed bytes.
  if (/\bgzip\b/.test(request.headers['accept-encoding'] ?? '') && !binary.has(extname(file))) {
    body = await gzipped(file, body);
    headers['content-encoding'] = 'gzip';
    headers.vary = 'Accept-Encoding';
  }
  headers['content-length'] = body.length;
  response.writeHead(status, headers);
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(port, '0.0.0.0', () => console.log(`Serving ${root} on http://localhost:${port}`));

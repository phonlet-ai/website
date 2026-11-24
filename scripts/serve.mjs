// Serves the static export (out/) the way GitHub Pages does: index.html for directories, a
// redirect to the trailing slash, 404.html for anything missing, and the same content types.
// Usage: node scripts/serve.mjs [dir] [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

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
  const body = await readFile(file);
  response.writeHead(status, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
    'content-length': body.length,
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(port, '0.0.0.0', () => console.log(`Serving ${root} on http://localhost:${port}`));

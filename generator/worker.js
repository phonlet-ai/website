// The Phonlet Wake threshold generator in the browser: the same Rust code as the wake-threshold
// command-line tool, compiled to WebAssembly. One JSON request in, one keyword file out. Nothing
// leaves the page. While the module downloads, the worker posts {progress: [loaded, total]}.
let exports = null;
let loading = null;

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`cannot load the generator: HTTP ${response.status}`);
  // Content-Length counts the bytes on the wire. A compressed response (GitHub Pages gzips the
  // module) decodes to more than that, so it only estimates the progress; the chunks decide.
  const length = Number(response.headers.get('content-length')) || 0;
  if (!response.body || !length) return new Uint8Array(await response.arrayBuffer());
  const chunks = [];
  const reader = response.body.getReader();
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    self.postMessage({ progress: [loaded, Math.max(length, loaded)] });
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

async function load() {
  const bytes = await download(new URL('./wake_threshold.wasm', self.location.href));
  const { instance } = await WebAssembly.instantiate(bytes, {});
  exports = instance.exports;
  const result = call({ command: 'load' });
  if (result.error) throw new Error(result.error);
}

function call(request) {
  const bytes = new TextEncoder().encode(JSON.stringify(request));
  const pointer = exports.wt_alloc(bytes.length);
  new Uint8Array(exports.memory.buffer, pointer, bytes.length).set(bytes);
  const length = exports.wt_call(pointer, bytes.length);
  const out = new Uint8Array(exports.memory.buffer, exports.wt_result(), length);
  return JSON.parse(new TextDecoder().decode(out));
}

self.onmessage = async ({ data }) => {
  try {
    loading ??= load();
    await loading;
    self.postMessage({ id: data.id, result: call(data.request) });
  } catch (error) {
    // A trap leaves the instance unusable: load a fresh one for the next request.
    exports = null;
    loading = null;
    self.postMessage({ id: data.id, error: String(error?.message ?? error) });
  }
};

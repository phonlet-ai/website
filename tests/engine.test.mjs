import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { load } from '../public/wake/js/kws.mjs';
import { supportsWasmSimd } from '../features/wake/simd.ts';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const MODEL = '8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8';

test('served engine, model and generator files match their pinned hashes', async () => {
  const assets = JSON.parse(await read('asset-hashes.json'));
  assert.ok(assets.length >= 10);
  for (const asset of assets)
    assert.equal(sha256(await read(asset.path)), asset.sha256, asset.path);
});

test('the site keyword file belongs to the served en-1 model', async () => {
  assert.equal(sha256(await read('public/wake/model.pwake')), MODEL);
  const file = JSON.parse(await read('public/wake/keywords.json'));
  assert.deepEqual(file.model, { id: 'en-1', sha256: MODEL });
  assert.deepEqual(
    file.keywords.map((k) => k.name),
    ['hey nova', 'computer', 'okay kettle', 'hey marvin'],
  );
  for (const k of file.keywords) {
    assert.deepEqual(Object.keys(k), [
      'name',
      'pronunciations',
      'threshold_loose',
      'threshold_strict',
      'endpoint',
      'metadata',
    ]);
    assert.ok(k.threshold_loose <= k.threshold_strict, k.name);
    assert.deepEqual(k.metadata.warnings, [], k.name);
  }
});

const pcm = Int16Array.from({ length: 16031 }, (_, i) => ((i * 7919) % 65536) - 32768);
for (const simd of [false, true]) {
  test(`browser engine: frontend golden and streaming parity (${simd ? 'SIMD' : 'scalar'})`, async () => {
    if (simd) assert.equal(await supportsWasmSimd(), true, 'valid SIMD probe on this Node runtime');
    const engine = await load({
      simd,
      wasmBinary: await read(`public/wake/dist/kws_engine${simd ? '.simd' : ''}.wasm`),
    });
    assert.equal(engine.frontendId, '3f047efa');
    const model = engine.loadModel(new Uint8Array(await read('public/wake/model.pwake')));
    assert.equal(model.nClasses, 40);
    const frontend = engine.frontend();
    const mel = frontend.push(pcm.slice(0, 8192));
    assert.equal(
      sha256(new Uint8Array(mel.buffer, mel.byteOffset, mel.byteLength)),
      '26027391afd651bf2b575b0a2887a7afaf6311e1bb817e49fecead507ab55cf0',
    );
    frontend.close();
    const { keywords } = JSON.parse(await read('public/wake/keywords.json'));
    const options = { keywords, outputs: { scores: true, events: true } };
    const whole = engine.session(model, options);
    const expected = whole.pushPcm(pcm);
    const final = whole.finish();
    const stream = engine.session(model, options);
    const parts = [pcm.slice(0, 113), pcm.slice(113, 5555), pcm.slice(5555)].map((p) =>
      stream.pushPcm(p),
    );
    assert.deepEqual(stream.finish(), final);
    for (const name of ['scores', 'fires'])
      assert.deepEqual(
        Array.from(expected[name]),
        parts.flatMap((p) => Array.from(p[name])),
      );
    // Synthetic noise is not a wake word.
    assert.equal(Array.from(expected.fires).some(Boolean), false, 'no phrase fires on the fixture');
    whole.close();
    stream.close();
    model.close();
  });
}

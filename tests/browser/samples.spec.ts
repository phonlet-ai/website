import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { quickstartCode, wakeCode } from '../../lib/samples';

// Runs each published browser sample unchanged as an ES module in the page. Only the
// root-relative /wake/ imports are made absolute, because a blob: module has no base URL.
async function importSample(page: import('@playwright/test').Page, code: string, origin: string) {
  await page.evaluate(
    async ({ source, origin }) => {
      const absolute = source.replaceAll("from '/wake/", `from '${origin}/wake/`);
      const url = URL.createObjectURL(new Blob([absolute], { type: 'text/javascript' }));
      (window as unknown as { sample: unknown }).sample = await import(url);
    },
    { source: code, origin },
  );
}

test('quickstart sample scores audio with the site keyword file', async ({ page, baseURL }) => {
  const logs: string[] = [];
  page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto('/privacy');
  await importSample(page, quickstartCode, baseURL!);
  const exported = await page.evaluate(async () => {
    const sample = (window as unknown as { sample: Record<string, (...a: unknown[]) => unknown> })
      .sample;
    for (let i = 0; i < 4; i++) await sample.onAudio(new Int16Array(4000));
    await sample.close();
    return Object.keys(sample).sort();
  });
  expect(exported).toEqual(['close', 'onAudio']);
  expect(logs).toEqual([]);
});

test('home sample starts and stops the microphone', async ({ page, baseURL }) => {
  const logs: string[] = [];
  page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto('/privacy');
  await importSample(page, wakeCode, baseURL!);
  const exported = await page.evaluate(async () => {
    const sample = (window as unknown as { sample: Record<string, () => Promise<void>> }).sample;
    await sample.start();
    await new Promise((r) => setTimeout(r, 800));
    await sample.stop();
    return Object.keys(sample).sort();
  });
  expect(exported).toEqual(['start', 'stop']);
  expect(logs).toEqual([]);
});

test('/wake/ serves the SDK, model and keyword file byte for byte', async ({ request }) => {
  for (const [path, type] of [
    ['model.pwake', 'application/octet-stream'],
    ['keywords.json', 'application/json'],
    ['index.mjs', 'text/javascript'],
    ['capture.mjs', 'text/javascript'],
    ['dist/kws_engine.wasm', 'application/wasm'],
    ['LICENSE', 'application/octet-stream'],
  ]) {
    const response = await request.get(`/wake/${path}`);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toContain(type);
    expect(Buffer.compare(await response.body(), readFileSync(`public/wake/${path}`)), path).toBe(
      0,
    );
  }
});

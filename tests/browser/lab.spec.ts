import { test, expect, type Page } from '@playwright/test';

const MODEL = {
  id: 'en-1',
  sha256: '8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8',
};

// Every stream the page opens, so a test can prove each track ends.
async function captureStreams(page: Page) {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    const captured: MediaStream[] = [];
    Object.defineProperty(window, 'capturedStreams', { value: captured });
    navigator.mediaDevices.getUserMedia = async (options) => {
      const stream = await original(options);
      captured.push(stream);
      return stream;
    };
  });
}
const allEnded = (page: Page) =>
  page.evaluate(() =>
    (window as unknown as { capturedStreams: MediaStream[] }).capturedStreams.every((s) =>
      s.getTracks().every((t) => t.readyState === 'ended'),
    ),
  );

test('the lab starts with the site phrases and lists their sounds', async ({ page }) => {
  await page.goto('/#lab');
  const phrases = page.getByRole('group', { name: 'Wake phrases' });
  for (const name of ['hey nova', 'computer', 'okay kettle', 'hey marvin'])
    await expect(phrases.getByRole('button', { name, exact: true })).toBeVisible();
  await expect(page.getByLabel('Pronunciation of hey nova')).toHaveText('HHEYNOWVAH');
  await phrases.getByRole('button', { name: 'computer', exact: true }).click();
  await expect(page.getByLabel('Pronunciation of computer')).toContainText('K');
  await page.getByLabel('Sensitivity').fill('1');
  await expect(page.getByText('≈ 10 false alarms per hour of speech')).toBeVisible();
  await phrases.getByRole('button', { name: 'Remove hey marvin' }).click();
  await expect(phrases.getByRole('button', { name: 'hey marvin', exact: true })).toHaveCount(0);
});

test('a typed phrase is calibrated in the browser', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/#lab');
  await page.getByLabel('Type a wake phrase').fill('zorblax');
  await page.getByLabel('Type a wake phrase').press('Enter');
  const chip = page.getByRole('group', { name: 'Wake phrases' }).getByRole('button', {
    name: 'zorblax',
    exact: true,
  });
  await expect(chip).toBeVisible({ timeout: 90_000 });
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Pronunciation of zorblax')).toHaveText('ZAORBAHLKS');
  await expect(page.locator('.lab-facts')).toContainText('Predicted');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'keywords.json' }).click();
  const file = JSON.parse(
    await (await download).createReadStream().then(async (stream) => {
      let text = '';
      for await (const chunk of stream) text += chunk;
      return text;
    }),
  );
  expect(file.model).toEqual(MODEL);
  expect(file.keywords.map((k: { name: string }) => k.name)).toContain('zorblax');
});

test('listening runs the engine and releases the microphone when leaving the page', async ({
  page,
}) => {
  await captureStreams(page);
  await page.goto('/#lab');
  await page.getByRole('button', { name: 'Start listening' }).click();
  await expect(page.getByRole('button', { name: 'Stop listening' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Listening.' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Docs' })
    .click();
  await expect(page).toHaveURL(/\/docs\/$/);
  await expect.poll(() => allEnded(page)).toBe(true);
});

test('a detection bursts, names the phrase and counts it', async ({ page }) => {
  // A deliberately permissive test phrase (one phone, loosest thresholds) fires on the fake
  // microphone's tone: the real engine and SDK run end to end, without an audio fixture.
  await page.route('**/wake/keywords.json', (route) =>
    route.fulfill({
      json: {
        model: MODEL,
        keywords: [
          {
            name: 'test phrase',
            pronunciations: [[1]],
            threshold_loose: -32,
            threshold_strict: 0,
            endpoint: false,
            metadata: { source: 'explicit', warnings: [] },
          },
        ],
        metadata: {
          resolved: [{ text: 'test phrase', source: 'explicit', pronunciations: ['AA'] }],
        },
      },
    }),
  );
  await captureStreams(page);
  await page.goto('/#lab');
  await page.getByLabel('Sensitivity').fill('1');
  await page.getByRole('button', { name: 'Start listening' }).click();
  const burst = page.locator('.lab-burst');
  await expect(burst).toContainText('“test phrase”', { timeout: 20_000 });
  await expect(page.locator('.lab-heard li').first()).toContainText('test phrase');
  await expect(page.locator('.lab-count')).not.toHaveText('00 HEARD');
  await page.getByRole('button', { name: 'Stop listening' }).click();
  await expect(page.getByRole('button', { name: 'Start listening' })).toBeVisible();
  await expect.poll(() => allEnded(page)).toBe(true);
});

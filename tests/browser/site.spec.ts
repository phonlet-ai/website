import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/',
  '/docs',
  '/docs/wake-word',
  '/docs/python',
  '/docs/custom-wake-words',
  '/docs/esp32',
  '/generator',
  '/contact',
];

test('homepage hydrates, opens mobile navigation, and respects reduced motion', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Any wake word.');
  await expect(page.locator('.lab')).toHaveCount(1);
  await expect(page.locator('.hero-specs')).toContainText('of memory while it listens');
  await expect(page.locator('.hero-specs')).toContainText('of an ESP32-S3 core');
  // The footprint section measures this browser live once it is in view.
  await page.locator('#footprint').scrollIntoViewIfNeeded();
  await expect(page.locator('#footprint .meter').nth(4).locator('b')).toHaveText(/^\d+(\.\d)?%$/, {
    timeout: 20_000,
  });
  await expect(page.locator('#how .step')).toHaveCount(4);
  await expect(page.locator('#esp32')).toContainText('ESP32-S3');
  await expect(page.locator('#licence')).toContainText('Non-commercial use');
  await expect(page.locator('#licence')).toContainText('PolyForm Noncommercial License 1.0.0');
  await expect(page.locator('#licence').getByRole('link', { name: 'Contact us' })).toHaveAttribute(
    'href',
    '/contact/',
  );
  await expect(page.locator('.platform-list li')).toHaveCount(8);
  // The keyword file, then one code window per platform tab with only the selected one shown.
  await expect(page.locator('.keyword-card')).toContainText('"threshold_loose"');
  const tabs = page.getByRole('tablist', { name: 'Code examples by platform' });
  await expect(tabs.getByRole('tab')).toHaveCount(6);
  await tabs.getByRole('tab', { name: 'Python' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('from phonlet_wake import Wake');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'C / C++' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('phonlet_wake_init');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const selector of ['.eyebrow-dot', '.marquee-track', '.chip-art .trace'])
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      selector,
    ).toBe('none');
  expect(errors).toEqual([]);
});

test('project brief download', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Your name').fill('Test User');
  await page.getByLabel('Wake phrase').fill('Hey Nova');
  await page.getByLabel('Platform').selectOption('ESP32-S3');
  await page
    .getByLabel('Tell us about the product')
    .fill('A kitchen appliance on ESP32-S3 with an I2S microphone, about 5,000 units a year.');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save project brief' }).click();
  expect((await download).suggestedFilename()).toBe('phonlet-project-brief.txt');
  await expect(page.getByRole('status')).toContainText('Nothing has been submitted');
});

test('email button opens a prefilled message', async ({ page }) => {
  // The address is fixed at build time (.env.production); TEST_CONTACT_EMAIL overrides it for
  // builds made with another CONTACT_EMAIL.
  const email = process.env.TEST_CONTACT_EMAIL ?? 'contact@phonletai.com';
  await page.addInitScript(() => {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.href.startsWith('mailto:')) {
        (window as unknown as { mailto: string }).mailto = this.href;
        return;
      }
      return click.call(this);
    };
  });
  await page.goto('/contact');
  await page.getByLabel('Your name').fill('Test User');
  await page.getByLabel('Organization').fill('Kettle & Co');
  await page.getByLabel('Wake phrase').fill('Hey Nova');
  await page
    .getByLabel('Tell us about the product')
    .fill('A kettle with a wake word, about 5,000 a year.');
  await page.getByRole('button', { name: 'Open in email app' }).click();
  const url = new URL(await page.evaluate(() => (window as unknown as { mailto: string }).mailto));
  expect(url.pathname).toBe(email);
  expect(url.searchParams.get('subject')).toBe('Phonlet Wake: A commercial licence (Kettle & Co)');
  const body = url.searchParams.get('body')!;
  expect(body).toContain('Wake phrase: Hey Nova');
  expect(body).toContain('A kettle with a wake word, about 5,000 a year.');
  await expect(page.getByRole('status')).toContainText('Nothing is sent until you press Send');
  await expect(page.locator('.form-note a')).toHaveAttribute('href', `mailto:${email}`);
});

test('responsive pages have no horizontal overflow', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${path} at ${width}`,
        ).toBe(true);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible();
});

test('main page accessibility', async ({ page }) => {
  test.setTimeout(240_000); // 8 pages x 2 widths x 2 themes, each settled before checking
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const path of pages) {
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
        // Check the page as a reader sees it: every section scrolled into view and settled.
        await page.evaluate(() =>
          document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')),
        );
        await page.waitForTimeout(1300);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map((v) => ({
            id: v.id,
            description: v.description,
            nodes: v.nodes.map((n) => n.target),
          })),
          `${path} (${theme}, ${width}px)`,
        ).toEqual([]);
      }
    }
  }
});

test('public content routes and unknown routes return the right status', async ({ request }) => {
  const paths = [
    '/',
    '/docs',
    '/generator',
    '/contact',
    '/privacy',
    '/docs/wake-word',
    '/docs/custom-wake-words',
    '/docs/audio-lifecycle',
    '/docs/esp32',
    '/docs/nodejs',
    '/docs/python',
    '/docs/c',
    '/docs/android',
    '/examples/wake.html',
  ];
  for (const path of paths) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  for (const gone of ['/playground', '/products', '/cookbook', '/branding', '/open-source']) {
    expect((await request.get(gone)).status(), gone).toBe(404);
  }
  expect((await request.get('/this-page-does-not-exist')).status()).toBe(404);
  const llms = await request.get('/llms.txt');
  expect(llms.headers()['content-type']).toContain('text/plain'); // how GitHub Pages serves .txt
  const llmsText = await llms.text();
  expect(llmsText).toContain('# Phonlet Wake');
  expect(llmsText).toContain('(https://phonletai.com/docs/python/)');
  expect(llmsText).toContain('from phonlet_wake import Wake');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://phonletai.com/docs/</loc>');
  expect(sitemap).not.toContain('/demo');
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://phonletai.com/sitemap.xml',
  );
  const agents = await request.get('/agents.md');
  expect(agents.headers()['content-type']).toContain('text/markdown');
  const agentsText = await agents.text();
  expect(agentsText).toContain('# Phonlet Wake: instructions for AI coding agents');
  expect(agentsText).toContain('https://github.com/phonlet-ai/wake/releases/download/v0.1.0/');
  expect(agentsText).toContain('"threshold_loose"');
});

import { test, expect } from '@playwright/test';

// The threshold generator runs as WebAssembly in a worker; its values are the CLI's.
test('generator writes the keyword file for typed phrases', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/generator');
  await page.getByLabel('One phrase per line').fill('hey kettle\nzorblax');
  await page.getByRole('button', { name: 'Generate thresholds' }).click();
  const rows = page.locator('.generator-table tbody tr');
  await expect(rows).toHaveCount(2, { timeout: 90_000 });
  await expect(rows.nth(0)).toContainText('HH EY K EH T AH L');
  await expect(rows.nth(0)).toContainText('Dictionary');
  await expect(rows.nth(0)).toContainText('-1.21875');
  await expect(rows.nth(0)).toContainText('-0.8740234375');
  await expect(rows.nth(1)).toContainText('Predicted');
  await page.getByText('Show the JSON').click();
  const file = JSON.parse((await page.locator('.generator-json code').textContent()) ?? '');
  expect(file.model).toEqual({
    id: 'en-1',
    sha256: '8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8',
  });
  expect(Object.keys(file.keywords[0])).toEqual([
    'name',
    'pronunciations',
    'threshold_loose',
    'threshold_strict',
    'endpoint',
    'metadata',
  ]);
  await expect(page.getByRole('button', { name: 'Start listening' })).toBeVisible();
  expect(errors).toEqual([]);
});

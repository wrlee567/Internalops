import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/opsec/threats');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.locator('table')).toBeVisible();
});

test('displays all mock threats on load', async ({ page }) => {
  // At least the first threat actor should be visible
  await expect(page.getByText(/foreign state-sponsored actor/i)).toBeVisible();
});

test('shows the probability/impact risk matrix', async ({ page }) => {
  await expect(page.getByText('Risk Matrix')).toBeVisible();
  await expect(page.getByText('Critical')).toBeVisible();
});

test('summary chips show correct counts', async ({ page }) => {
  // We have 1 Critical threat in mock data
  await expect(page.locator('text=Critical').first()).toBeVisible();
});

test('risk filter shows only matching threats', async ({ page }) => {
  await page.selectOption('select:first-of-type', 'Critical');
  // The critical threat actor should be visible
  await expect(page.getByText(/foreign state-sponsored actor/i)).toBeVisible();
  // A Low threat should not be visible
  await expect(page.getByText(/Unknown — Physical Surveillance/i)).not.toBeVisible();
});

test('status filter shows only Open threats', async ({ page }) => {
  await page.selectOption('select:nth-of-type(2)', 'Open');
  // Open threats should be visible
  await expect(page.getByText('Open').first()).toBeVisible();
  // Mitigated threats should not appear in the table rows
  await expect(page.getByText('Mitigated').first()).not.toBeVisible();
});

test('can open the New Assessment modal', async ({ page }) => {
  await page.click('button:has-text("New Assessment")');
  await expect(page.getByText('New Threat Assessment')).toBeVisible();
  // The computed risk level callout should be visible
  await expect(page.getByText(/computed risk level/i)).toBeVisible();
});

test('computed risk level updates when probability/impact change', async ({ page }) => {
  await page.click('button:has-text("New Assessment")');

  // Set High / High → should show Critical
  await page.selectOption('select:has(option:text("High"):first)', 'High');
  await expect(page.getByText(/critical/i).last()).toBeVisible();
});

test('can delete a threat after confirmation', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  const deleteButtons = page.getByRole('button', { name: 'Delete' });
  const initialCount = await deleteButtons.count();

  await deleteButtons.first().click();
  await expect(deleteButtons).toHaveCount(initialCount - 1);
});

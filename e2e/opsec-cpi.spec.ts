import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/opsec/cpi');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  // Wait for the page to fully load (the table should appear)
  await expect(page.locator('table')).toBeVisible();
});

// ─── Read ──────────────────────────────────────────────────────────────────────
test('CPI Registry displays all mock CPIs on first load', async ({ page }) => {
  await expect(page.getByText('GUARDIAN')).toBeVisible();
  await expect(page.getByText('CIPHER')).toBeVisible();
  await expect(page.getByText('NIGHTWATCH')).toBeVisible();
  await expect(page.getByText('PRISM-7')).toBeVisible();
  await expect(page.getByText('STARGATE')).toBeVisible();
});

test('shows correct classification badges', async ({ page }) => {
  await expect(page.getByText('TS/SCI')).toBeVisible();
  await expect(page.getByText('TOP SECRET').first()).toBeVisible();
});

// ─── Search ────────────────────────────────────────────────────────────────────
test('search filters the table in real time', async ({ page }) => {
  await page.fill('input[placeholder*="Search"]', 'GUARDIAN');
  await expect(page.getByText('GUARDIAN')).toBeVisible();
  await expect(page.getByText('CIPHER')).not.toBeVisible();
});

test('shows empty state message when search matches nothing', async ({ page }) => {
  await page.fill('input[placeholder*="Search"]', 'ZZZNOTEXIST');
  await expect(page.getByText(/no cpis match/i)).toBeVisible();
});

// ─── Create ────────────────────────────────────────────────────────────────────
test('can add a new CPI and it appears in the table', async ({ page }) => {
  await page.click('button:has-text("Add CPI")');
  await expect(page.getByText('Register New CPI')).toBeVisible();

  // Fill required fields
  await page.locator('input').first().fill('PHANTOM');
  // CPI Name is the next text input after program name
  await page.locator('textarea').first().fill('Stealth array test entry');
  await page.locator('input').nth(1).fill('Stealth Propulsion Array');

  await page.click('button:has-text("Register CPI")');

  await expect(page.getByText('PHANTOM')).toBeVisible();
});

test('add CPI modal closes without saving when Cancel is clicked', async ({ page }) => {
  await page.click('button:has-text("Add CPI")');
  await page.click('button:has-text("Cancel")');
  await expect(page.getByText('Register New CPI')).not.toBeVisible();
  // Row count unchanged
  await expect(page.getByText('5 of 5 CPIs shown')).toBeVisible();
});

// ─── Edit ──────────────────────────────────────────────────────────────────────
test('can edit an existing CPI', async ({ page }) => {
  // Click the first Edit button in the table
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByText('Edit CPI')).toBeVisible();

  // Change the program name
  const programInput = page.locator('input').first();
  await programInput.clear();
  await programInput.fill('GUARDIAN-UPDATED');

  await page.click('button:has-text("Save Changes")');
  await expect(page.getByText('GUARDIAN-UPDATED')).toBeVisible();
});

// ─── Delete ────────────────────────────────────────────────────────────────────
test('can delete a CPI after confirming', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());

  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('4 of 4 CPIs shown')).toBeVisible();
});

test('does not delete when the confirmation is dismissed', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.dismiss());

  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('5 of 5 CPIs shown')).toBeVisible();
});

// ─── Persistence ──────────────────────────────────────────────────────────────
test('persists data across page reloads', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());

  // Delete one CPI
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('4 of 4 CPIs shown')).toBeVisible();

  // Reload the page — the deletion should persist via localStorage
  await page.reload();
  await expect(page.locator('table')).toBeVisible();
  await expect(page.getByText('4 of 4 CPIs shown')).toBeVisible();
});

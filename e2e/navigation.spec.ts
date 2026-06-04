import { test, expect } from '@playwright/test';

// These tests verify the sidebar navigation and page titles work correctly.
// They run in a real Chromium browser against a live Next.js dev server.

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test so state doesn't bleed between tests
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
});

test('dashboard loads and shows the main heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /security operations dashboard/i })).toBeVisible();
});

test('sidebar shows all six module links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('OPSEC')).toBeVisible();
  await expect(page.getByText('Personnel Security')).toBeVisible();
  await expect(page.getByText('Access Control')).toBeVisible();
  await expect(page.getByText('Document Control')).toBeVisible();
  await expect(page.getByText('Training & Compliance')).toBeVisible();
  await expect(page.getByText('Visitor Management')).toBeVisible();
});

test('clicking OPSEC in sidebar navigates to OPSEC overview', async ({ page }) => {
  await page.goto('/');
  await page.click('text=OPSEC');
  await expect(page).toHaveURL('/opsec');
  await expect(page.getByRole('heading', { name: /opsec program/i })).toBeVisible();
});

test('OPSEC sub-navigation expands in the sidebar', async ({ page }) => {
  await page.goto('/opsec');
  await expect(page.getByRole('link', { name: 'CPI Registry' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Threat Assessments' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Indicators' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Countermeasures' })).toBeVisible();
});

test('navigates to each OPSEC sub-page', async ({ page }) => {
  const routes = [
    { path: '/opsec/cpi', heading: /cpi registry/i },
    { path: '/opsec/threats', heading: /threat assessments/i },
    { path: '/opsec/indicators', heading: /opsec indicators/i },
    { path: '/opsec/countermeasures', heading: /countermeasures log/i },
  ];

  for (const { path, heading } of routes) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('stub pages load without errors', async ({ page }) => {
  const stubs = ['/personnel', '/access-control', '/document-control', '/training', '/visitor'];
  for (const path of stubs) {
    await page.goto(path);
    await expect(page.getByText('Module In Development')).toBeVisible();
  }
});

test('breadcrumb links navigate back correctly', async ({ page }) => {
  await page.goto('/opsec/cpi');
  await page.click('text=Home');
  await expect(page).toHaveURL('/');
});

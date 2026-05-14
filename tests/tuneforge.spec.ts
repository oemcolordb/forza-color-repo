import { test, expect } from '@playwright/test';

test.describe('TuneForge - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tuneforge');
  });

  test('tuneforge page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/TuneForge/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('car selection works', async ({ page }) => {
    await page.waitForSelector('[data-testid="car-select"]', { timeout: 10000 });
    const carSelect = page.locator('[data-testid="car-select"]');
    await carSelect.selectOption({ label: /Ferrari/i });
    
    await expect(carSelect).toHaveValue(/ferrari/i);
  });

  test('track selection works', async ({ page }) => {
    await page.waitForSelector('[data-testid="track-select"]', { timeout: 10000 });
    const trackSelect = page.locator('[data-testid="track-select"]');
    await trackSelect.selectOption({ label: /Mojave/i });
    
    await expect(trackSelect).toHaveValue(/mojave/i);
  });

  test('calculate button generates tune', async ({ page }) => {
    await page.waitForSelector('[data-testid="calculate-button"]', { timeout: 10000 });
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    
    // Select a car first
    const carSelect = page.locator('[data-testid="car-select"]');
    if (await carSelect.isVisible()) {
      await carSelect.selectOption({ index: 0 });
    }
    
    await calculateButton.click();
    
    // Verify tune results appear
    await expect(page.locator('[data-testid="tune-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('tune results display car stats', async ({ page }) => {
    await page.waitForSelector('[data-testid="car-stats"]', { timeout: 10000 });
    const carStats = page.locator('[data-testid="car-stats"]');
    await expect(carStats).toBeVisible();
  });

  test('navigation to car detail page works', async ({ page }) => {
    await page.waitForSelector('[data-testid="car-link"]', { timeout: 10000 });
    const carLink = page.locator('[data-testid="car-link"]').first();
    await carLink.click();
    
    await expect(page).toHaveURL(/\/tuneforge\/car\//);
  });
});

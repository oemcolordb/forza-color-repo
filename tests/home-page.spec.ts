import { test, expect } from '@playwright/test';

test.describe('Home Page - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Forza Color Universe/);
    await expect(page.locator('h1')).toContainText('Forza-Color-Repo');
  });

  test('color grid renders', async ({ page }) => {
    await page.waitForSelector('[data-testid="color-grid"]', { timeout: 10000 });
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards.first()).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i]');
    await searchInput.fill('Ferrari');
    
    await page.waitForTimeout(500); // Wait for debounced search
    
    // Verify search results
    const colorCards = page.locator('[data-testid="color-card"]');
    const firstCard = colorCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="theme" i]');
    await themeButton.click();
    
    // Verify theme changed (check for dark mode class or similar indicator)
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark/);
  });

  test('navigation to TuneForge works', async ({ page }) => {
    const tuneforgeLink = page.locator('a[href="/tuneforge"]');
    await tuneforgeLink.click();
    
    await expect(page).toHaveURL(/\/tuneforge/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation to Garage works', async ({ page }) => {
    const garageLink = page.locator('a[href="/garage"]');
    await garageLink.click();
    
    await expect(page).toHaveURL(/\/garage/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('color card displays details on click', async ({ page }) => {
    await page.waitForSelector('[data-testid="color-card"]', { timeout: 10000 });
    const firstCard = page.locator('[data-testid="color-card"]').first();
    await firstCard.click();
    
    // Verify color details appear
    await expect(page.locator('[data-testid="color-details"]')).toBeVisible();
  });

  test('favorite toggle works', async ({ page }) => {
    await page.waitForSelector('[data-testid="color-card"]', { timeout: 10000 });
    const firstCard = page.locator('[data-testid="color-card"]').first();
    const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');
    
    await favoriteButton.click();
    
    // Verify favorite state changed
    await expect(favoriteButton).toHaveClass(/favorited/);
  });

  test('filter by manufacturer works', async ({ page }) => {
    await page.waitForSelector('[data-testid="manufacturer-filter"]', { timeout: 10000 });
    const manufacturerFilter = page.locator('[data-testid="manufacturer-filter"]');
    await manufacturerFilter.selectOption('Ferrari');
    
    await page.waitForTimeout(500); // Wait for filter to apply
    
    // Verify filtered results
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards.first()).toBeVisible();
  });

  test('responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[data-testid="color-grid"]', { timeout: 10000 });
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards.first()).toBeVisible();
    
    // Verify mobile-optimized grid (fewer columns)
    const grid = page.locator('[data-testid="color-grid"]');
    await expect(grid).toHaveClass(/grid-cols-2/);
  });
});

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Image Color Extraction', () => {
  test('should extract colors from uploaded image', async ({ page }) => {
    await page.goto('/image-match');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Image-to-Paint Matcher');

    // Upload test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-car.jpg'));

    // Wait for processing
    await expect(page.locator('text=AI clustering colors')).toBeVisible({ timeout: 10000 });
    
    // Wait for results
    await expect(page.locator('.color-card, .extracted-colors')).toBeVisible({ timeout: 15000 });

    // Verify color matches are displayed
    const matches = page.locator('text=Suggested Paints, text=Closest Forza Colors');
    await expect(matches.first()).toBeVisible();

    // Verify at least one color card is shown
    const colorCards = page.locator('[class*="color"]').filter({ hasText: /Ferrari|Porsche|BMW/ });
    await expect(colorCards.first()).toBeVisible();
  });

  test('should handle invalid file upload', async ({ page }) => {
    await page.goto('/image-match');

    // Try to upload non-image file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test.txt'));

    // Should show error
    await expect(page.locator('text=/error|invalid|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow color selection', async ({ page }) => {
    await page.goto('/image-match');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-car.jpg'));

    // Wait for results
    await page.waitForSelector('button:has-text("Select")', { timeout: 15000 });

    // Click first select button
    await page.locator('button:has-text("Select")').first().click();

    // Verify color details are shown
    await expect(page.locator('text=Selected Color')).toBeVisible();
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/image-match');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-car.jpg'));

    // Wait for results
    await page.waitForSelector('button:has-text("Select")', { timeout: 15000 });

    // Test Escape key to close
    await page.keyboard.press('Escape');
    
    // Test Ctrl+F to open history
    await page.keyboard.press('Control+F');
  });
});

test.describe('Color Search', () => {
  test('should search colors by name', async ({ page }) => {
    await page.goto('/');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill('Rosso Corsa');

    // Wait for results
    await page.waitForTimeout(1000);

    // Verify results contain search term
    await expect(page.locator('text=Rosso Corsa')).toBeVisible();
  });

  test('should filter by manufacturer', async ({ page }) => {
    await page.goto('/');

    // Find manufacturer filter
    const manufacturerSelect = page.locator('select, [role="combobox"]').filter({ hasText: /Make|Manufacturer/i }).first();
    
    if (await manufacturerSelect.isVisible()) {
      await manufacturerSelect.selectOption('Ferrari');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify Ferrari colors are shown
      await expect(page.locator('text=Ferrari')).toBeVisible();
    }
  });
});

test.describe('Export Functionality', () => {
  test('should export colors as JSON', async ({ page }) => {
    await page.goto('/image-match');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, '../fixtures/test-car.jpg'));

    // Wait for results
    await page.waitForSelector('button:has-text("Export")', { timeout: 15000 });

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    await page.locator('text=JSON').click();
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('.json');
  });
});

test.describe('Offline Support', () => {
  test('should work offline with service worker', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker to register
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Navigate to another page
    await page.goto('/image-match');

    // Should still load from cache
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if mobile menu exists
    const mobileMenu = page.locator('[aria-label="Menu"], button:has-text("Menu")');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test('verify color count displayed', async ({ page }) => {
  // Capture console logs
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Color data loaded') || text.includes('colors')) {
      consoleMessages.push(text);
    }
  });

  // Navigate to the main page
  await page.goto('/');

  // Wait for loading to complete
  await page.waitForSelector('text=Loading Paint Codes', { state: 'hidden', timeout: 20000 });

  // Wait a bit for any async loading
  await page.waitForTimeout(2000);

  // Get the innerText of key elements that show counts
  const heroText = await page.locator('text=/\\d{1,5}.*Forza paint codes/i').first().innerText().catch(() => 'Not found');
  const filteredText = await page.locator('text=/\\d{1,5} colors/i').first().innerText().catch(() => 'Not found');
  const footerText = await page.locator('text=/Base Colors:/i').first().innerText().catch(() => 'Not found');

  console.log('Hero count:', heroText);
  console.log('Filtered count:', filteredText);
  console.log('Footer count:', footerText);

  // Extract numbers
  const heroMatch = heroText.match(/([\d,]+)/);
  const filteredMatch = filteredText.match(/([\d,]+)/);
  const footerMatch = footerText.match(/([\d,]+)/);

  console.log('Hero number:', heroMatch ? heroMatch[1] : 'none');
  console.log('Filtered number:', filteredMatch ? filteredMatch[1] : 'none');
  console.log('Footer number:', footerMatch ? footerMatch[1] : 'none');

  // Log all console messages about colors
  console.log('Console messages:');
  consoleMessages.forEach(m => console.log('  -', m));

  // Take screenshot
  await page.screenshot({ path: 'test-results/color-count.png', fullPage: true });

  // Verify we have the expected count (should be ~12,995)
  const count = parseInt(heroMatch?.[1]?.replace(/,/g, '') || '0');
  console.log('Parsed count:', count);

  // Expect at least 10,000 colors
  expect(count).toBeGreaterThan(10000);
});

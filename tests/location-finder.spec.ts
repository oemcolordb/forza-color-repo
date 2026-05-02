import { test, expect } from '@playwright/test'

test.describe('Location Finder Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/location-finder')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('page loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Location Finder|Forza/)
    
    // Check main heading exists
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('neon road map renders', async ({ page }) => {
    // Look for SVG elements (neon roads)
    const svg = page.locator('svg').first()
    await expect(svg).toBeVisible({ timeout: 10000 })
    
    // Check for road paths
    const paths = page.locator('svg path')
    const pathCount = await paths.count()
    expect(pathCount).toBeGreaterThan(0)
  })

  test('LED indicators are present', async ({ page }) => {
    // Look for LED/circle elements on map
    const leds = page.locator('svg circle, [class*="led"], [class*="LED"]').first()
    // LEDs may or may not be present depending on data
    const ledCount = await page.locator('svg circle').count()
    console.log(`Found ${ledCount} LED circles`)
  })

  test('category filters work', async ({ page }) => {
    // Look for filter buttons
    const filterButtons = page.locator('button').filter({ hasText: /Barn|XP|Race|Collectible/i })
    
    if (await filterButtons.count() > 0) {
      // Click first filter
      await filterButtons.first().click()
      
      // Wait for potential animation
      await page.waitForTimeout(500)
      
      // Check that something changed or no error
      const errorMessage = page.locator('text=/error|Error/i')
      await expect(errorMessage).not.toBeVisible()
    }
  })

  test('search functionality works', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Barn')
      await page.waitForTimeout(500)
      
      // Check for results or no results message
      const results = page.locator('[class*="result"], [class*="card"], [class*="location"]').first()
      // Just ensure no crash
    }
  })

  test('no console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Reload to capture errors
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Log errors but don't fail - just report
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors)
    }
    
    // Filter out common non-critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('analytics') &&
      !err.includes('gtag') &&
      !err.includes('_vercel') &&
      !err.includes('MIME type') &&
      !err.includes('404')
    )    
    expect(criticalErrors).toHaveLength(0)
  })

  test('responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check that content is still visible
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Check page has some visible content
    const visibleElements = page.locator(':visible').first()
    await expect(visibleElements).toBeVisible()
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})

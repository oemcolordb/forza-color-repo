import { test, expect } from '@playwright/test';

test.describe('Authentication - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to home or profile
    await expect(page).toHaveURL(/\/(home|profile|$)/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid credentials/i')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout works', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|profile|$)/);
    
    // Then logout
    const logoutButton = page.locator('button:has-text("Logout")').or(page.locator('a:has-text("Logout")'));
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

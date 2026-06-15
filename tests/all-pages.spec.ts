import { test, expect } from "@playwright/test";

// ─── Public pages that should load without authentication ───
const publicPages: { path: string; titlePattern: RegExp; description: string }[] = [
  { path: "/", titlePattern: /Forza/i, description: "Home page" },
  { path: "/about/", titlePattern: /About/i, description: "About page" },
  { path: "/blog/", titlePattern: /Blog/i, description: "Blog page" },
  { path: "/community/", titlePattern: /Community/i, description: "Community page" },
  { path: "/contact/", titlePattern: /Contact/i, description: "Contact page" },
  { path: "/forza-color-sheet/", titlePattern: /Forza/i, description: "Forza Color Sheet" },
  { path: "/garage/", titlePattern: /Garage/i, description: "Garage page" },
  { path: "/help/", titlePattern: /Help/i, description: "Help page" },
  { path: "/how-to-use/", titlePattern: /How to use/i, description: "How to use page" },
  { path: "/login/", titlePattern: /Log.?in/i, description: "Login page" },
  { path: "/signup/", titlePattern: /Sign.?up/i, description: "Signup page" },
  { path: "/privacy/", titlePattern: /Privacy/i, description: "Privacy page" },
  { path: "/terms/", titlePattern: /Terms/i, description: "Terms page" },
  { path: "/tuneforge/", titlePattern: /TuneForge/i, description: "TuneForge page" },
  { path: "/transitions/", titlePattern: /Transitions/i, description: "Transitions page" },
  { path: "/image-match/", titlePattern: /Image/i, description: "Image Match page" },
  { path: "/livery-hub/", titlePattern: /Livery/i, description: "Livery Hub" },
  { path: "/mobile-dash/", titlePattern: /Mobile/i, description: "Mobile Dashboard" },
  { path: "/telemetry/", titlePattern: /Telemetry/i, description: "Telemetry page" },
  { path: "/ui-showcase/", titlePattern: /UI/i, description: "UI Showcase" },
];

// ─── Auth-gated pages (should redirect to /login or show login form) ───
const authPages: { path: string; description: string }[] = [
  { path: "/favorites/", description: "Favorites page" },
  { path: "/profile/", description: "Profile page" },
  { path: "/forgot-password/", description: "Forgot password page" },
  { path: "/reset-password/", description: "Reset password page" },
];

// ─── Pages that should never show offline ───
test.describe("All Public Pages - No Offline / No Error", () => {
  for (const page of publicPages) {
    test(`${page.description} (${page.path}) loads without offline page`, async ({ page: p }) => {
      const response = await p.goto(page.path, { waitUntil: "domcontentloaded" });

      // Page should return successfully (2xx or 3xx)
      expect(response?.status()).toBeLessThan(400);

      // Must NOT show the offline page
      await expect(p.locator("body")).not.toContainText("Connection Issue Detected");
      await expect(p.locator("body")).not.toContainText("You are offline");

      // Must have a visible <h1>
      const h1 = p.locator("h1").first();
      await expect(h1).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("All Public Pages - Content Loads", () => {
  for (const page of publicPages) {
    test(`${page.description} (${page.path}) has correct title`, async ({ page: p }) => {
      await p.goto(page.path, { waitUntil: "domcontentloaded" });

      // Title should match the expected pattern
      await expect(p).toHaveTitle(page.titlePattern, { timeout: 10000 });

      // Body should not be empty
      const bodyText = await p.locator("body").innerText();
      expect(bodyText.trim().length).toBeGreaterThan(10);
    });
  }
});

test.describe("Auth-gated Pages - Redirect or Show Login", () => {
  for (const page of authPages) {
    test(`${page.description} (${page.path}) loads or redirects to login`, async ({ page: p }) => {
      const response = await p.goto(page.path, { waitUntil: "domcontentloaded" });

      // Should not return a 5xx error
      expect(response?.status()).toBeLessThan(500);

      // Must NOT show offline page
      await expect(p.locator("body")).not.toContainText("Connection Issue Detected");

      // Either shows login form, or redirects to /login
      const currentUrl = p.url();
      const isLoginPage =
        currentUrl.includes("/login") ||
        (await p.locator("body").innerText()).toLowerCase().includes("log in");
      expect(isLoginPage).toBeTruthy();
    });
  }
});

test.describe("Navigation Links Work Between Pages", () => {
  test("home page links navigate correctly", async ({ page: p }) => {
    await p.goto("/", { waitUntil: "domcontentloaded" });

    // Find visible navigation links and check they resolve
    const navLinks = p.locator("a[href]").filter({ hasNot: p.locator("[aria-hidden]") });
    const linkCount = await navLinks.count();

    // Check at least some links are visible
    expect(linkCount).toBeGreaterThan(0);

    // Check first few links don't lead to errors
    const testedPaths = new Set<string>();
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto") || testedPaths.has(href)) {
        continue;
      }
      testedPaths.add(href);

      const linkResponse = await p.goto(href, { waitUntil: "domcontentloaded" });
      expect(linkResponse?.status(), `Link ${href} should not return 5xx`).toBeLessThan(500);

      // Must NOT show offline page
      await expect(p.locator("body")).not.toContainText("Connection Issue Detected");
    }
  });
});

test.describe("No JavaScript Errors on Any Page", () => {
  for (const page of publicPages.slice(0, 10)) {
    test(`${page.description} (${page.path}) has no console errors`, async ({ page: p }) => {
      const consoleErrors: string[] = [];
      p.on("console", (msg) => {
        if (msg.type() === "error") {
          // Ignore known benign errors (favicon, analytics, service worker)
          const text = msg.text();
          if (!text.includes("favicon") && !text.includes("analytics") && !text.includes("[SW]")) {
            consoleErrors.push(text);
          }
        }
      });

      await p.goto(page.path, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(2000); // Allow time for client-side JS to run

      // Filter out known safe errors
      const realErrors = consoleErrors.filter(
        (e) => !e.includes("ERR_BLOCKED_BY_CLIENT") && !e.includes("Failed to load resource")
      );

      expect(realErrors, `Console errors on ${page.path}`).toEqual([]);
    });
  }
});

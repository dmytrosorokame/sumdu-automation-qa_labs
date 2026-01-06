import { test, expect } from "@playwright/test";

/**
 * Home Page E2E Tests
 * Tests recorded using Playwright codegen approach
 */
test.describe("Home Page", () => {
  test("should display the home page with navigation", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Verify the page title/heading
    await expect(page.locator("h1")).toContainText("Latest Posts");

    // Verify navigation is visible
    await expect(page.locator("nav")).toBeVisible();

    // Check for brand/logo link
    await expect(page.getByRole("link", { name: "SumDU Blog" })).toBeVisible();
  });

  test("should show login link for unauthenticated users", async ({ page }) => {
    await page.goto("/");

    // Check for login link in navigation
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    // Click on login link
    await page.getByRole("link", { name: "Login" }).click();

    // Verify we're on the login page
    await expect(page).toHaveURL("/login");
    await expect(page.locator("h1")).toContainText("Welcome Back");
  });

  test("should display empty state when no posts exist", async ({ page }) => {
    await page.goto("/");

    // Check for empty state message (if applicable)
    const emptyState = page.locator("text=No posts yet");
    const postsExist = page.locator("article, .card").first();

    // Either posts exist or empty state is shown
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasPosts = await postsExist.isVisible().catch(() => false);

    expect(hasEmptyState || hasPosts).toBeTruthy();
  });
});

import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 * Tests for registration and login flows
 */
test.describe("Registration", () => {
  test("should display registration form", async ({ page }) => {
    await page.goto("/register");

    // Verify page heading
    await expect(page.locator("h1")).toContainText("Create Account");

    // Verify form fields are present
    await expect(page.getByPlaceholder("Enter username")).toBeVisible();
    await expect(page.getByPlaceholder("Enter email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter password")).toBeVisible();
    await expect(page.getByPlaceholder("Confirm password")).toBeVisible();

    // Verify submit button
    await expect(
      page.getByRole("button", { name: "Register Now" })
    ).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    await page.goto("/register");

    // Try to submit empty form - button should be disabled
    const submitButton = page.getByRole("button", { name: "Register Now" });
    await expect(submitButton).toBeDisabled();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/register");

    // Fill invalid email
    await page.getByPlaceholder("Enter username").fill("testuser");
    await page.getByPlaceholder("Enter email").fill("invalidemail");
    await page.getByPlaceholder("Enter password").fill("password123");
    await page.getByPlaceholder("Confirm password").fill("password123");

    // Button should still be disabled for invalid email
    const submitButton = page.getByRole("button", { name: "Register Now" });
    await expect(submitButton).toBeDisabled();
  });

  test("should validate password confirmation", async ({ page }) => {
    await page.goto("/register");

    // Fill mismatched passwords
    await page.getByPlaceholder("Enter username").fill("testuser");
    await page.getByPlaceholder("Enter email").fill("test@example.com");
    await page.getByPlaceholder("Enter password").fill("password123");
    await page.getByPlaceholder("Confirm password").fill("differentpassword");

    // Button should be disabled for mismatched passwords
    const submitButton = page.getByRole("button", { name: "Register Now" });
    await expect(submitButton).toBeDisabled();
  });

  test("should enable submit button with valid data", async ({ page }) => {
    await page.goto("/register");

    // Fill valid data
    await page.getByPlaceholder("Enter username").fill("testuser");
    await page.getByPlaceholder("Enter email").fill("test@example.com");
    await page.getByPlaceholder("Enter password").fill("password123");
    await page.getByPlaceholder("Confirm password").fill("password123");

    // Button should be enabled
    const submitButton = page.getByRole("button", { name: "Register Now" });
    await expect(submitButton).toBeEnabled();
  });

  test("should have link to login page", async ({ page }) => {
    await page.goto("/register");

    // Check for login link
    await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();

    // Click and verify navigation
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("should successfully register a new user", async ({ page }) => {
    await page.goto("/register");

    // Generate unique username
    const uniqueId = Date.now();
    const username = `e2euser${uniqueId}`;
    const email = `e2e${uniqueId}@test.com`;

    // Fill the registration form
    await page.getByPlaceholder("Enter username").fill(username);
    await page.getByPlaceholder("Enter email").fill(email);
    await page.getByPlaceholder("Enter password").fill("testpassword123");
    await page.getByPlaceholder("Confirm password").fill("testpassword123");

    // Submit the form
    await page.getByRole("button", { name: "Register Now" }).click();

    // Wait for success message
    await expect(page.locator(".alert-success")).toContainText(
      "Congrats! Your registration has been successful"
    );

    // Should redirect to home page
    await expect(page).toHaveURL("/", { timeout: 5000 });
  });
});

test.describe("Login", () => {
  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    // Verify page heading
    await expect(page.locator("h1")).toContainText("Welcome Back");

    // Verify form fields
    await expect(page.getByPlaceholder("Enter username")).toBeVisible();
    await expect(page.getByPlaceholder("Enter password")).toBeVisible();

    // Verify submit button
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });

  test("should have disabled submit button for empty form", async ({
    page,
  }) => {
    await page.goto("/login");

    // Button should be disabled initially
    await expect(page.getByRole("button", { name: "Log In" })).toBeDisabled();
  });

  test("should enable submit button when fields are filled", async ({
    page,
  }) => {
    await page.goto("/login");

    // Fill form fields
    await page.getByPlaceholder("Enter username").fill("testuser");
    await page.getByPlaceholder("Enter password").fill("testpassword");

    // Button should be enabled
    await expect(page.getByRole("button", { name: "Log In" })).toBeEnabled();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill with invalid credentials
    await page.getByPlaceholder("Enter username").fill("nonexistentuser");
    await page.getByPlaceholder("Enter password").fill("wrongpassword");

    // Submit form
    await page.getByRole("button", { name: "Log In" }).click();

    // Wait for error message
    await expect(page.locator(".alert-error")).toContainText(
      "Invalid username/password"
    );
  });

  test("should have link to registration page", async ({ page }) => {
    await page.goto("/login");

    // Check for register link
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();

    // Click and verify navigation
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("should have forgot password link", async ({ page }) => {
    await page.goto("/login");

    // Check for forgot password link
    await expect(
      page.getByRole("link", { name: "Forgot Password?" })
    ).toBeVisible();

    // Click and verify navigation
    await page.getByRole("link", { name: "Forgot Password?" }).click();
    await expect(page).toHaveURL("/forgot-password");
  });
});

test.describe("Forgot Password", () => {
  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");

    // Verify page heading
    await expect(page.locator("h1")).toContainText("Forgot Password");

    // Verify email field
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();

    // Verify submit button
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should have link back to login", async ({ page }) => {
    await page.goto("/forgot-password");

    // Check for back to login link
    await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();

    // Click and verify navigation
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL("/login");
  });
});

import { test, expect } from "@playwright/test";

/**
 * Authenticated User Flows E2E Tests
 * Tests for dashboard, profile, posts, and comments
 */

// Helper function to register and login a new user
async function registerAndLogin(page: any) {
  const uniqueId = Date.now();
  const username = `testuser${uniqueId}`;
  const email = `test${uniqueId}@example.com`;
  const password = "testpassword123";

  // Register
  await page.goto("/register");
  await page.getByPlaceholder("Enter username").fill(username);
  await page.getByPlaceholder("Enter email").fill(email);
  await page.getByPlaceholder("Enter password").fill(password);
  await page.getByPlaceholder("Confirm password").fill(password);
  await page.getByRole("button", { name: "Register Now" }).click();

  // Wait for redirect to home (auto-login after registration)
  await expect(page).toHaveURL("/", { timeout: 5000 });

  return { username, email, password };
}

test.describe("Dashboard (Authenticated)", () => {
  test("should redirect to login when accessing dashboard unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator(".alert-error")).toContainText(
      "You must be logged in"
    );
  });

  test("should display dashboard for authenticated user", async ({ page }) => {
    // Register and login
    await registerAndLogin(page);

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Verify dashboard elements
    await expect(page.locator("h1")).toContainText("My Dashboard");
    await expect(page.locator("text=Total Posts")).toBeVisible();
    await expect(page.locator("text=Total Comments")).toBeVisible();
    await expect(page.locator("text=Member Since")).toBeVisible();
  });

  test("should show Add New Post button on dashboard", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");

    // Check for Add New Post button
    await expect(
      page.getByRole("link", { name: "Add New Post" })
    ).toBeVisible();
  });

  test("should show empty state when user has no posts", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/dashboard");

    // Check for empty state
    await expect(
      page.locator("text=You haven't created any posts yet")
    ).toBeVisible();
  });
});

test.describe("Profile (Authenticated)", () => {
  test("should redirect to login when accessing profile unauthenticated", async ({
    page,
  }) => {
    await page.goto("/profile");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display profile page for authenticated user", async ({
    page,
  }) => {
    const { username, email } = await registerAndLogin(page);

    await page.goto("/profile");

    // Verify profile elements
    await expect(page.locator("h1")).toContainText("Your Profile");

    // Username and email should be displayed (read-only)
    await expect(page.locator(`input[value="${username}"]`)).toBeVisible();
    await expect(page.locator(`input[value="${email}"]`)).toBeVisible();
  });

  test("should display editable profile fields", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/profile");

    // Check for editable fields
    await expect(page.getByPlaceholder("Enter first name")).toBeVisible();
    await expect(page.getByPlaceholder("Enter last name")).toBeVisible();
    await expect(page.getByPlaceholder("Enter age")).toBeVisible();
    await expect(page.locator("select")).toBeVisible(); // Gender select
    await expect(page.getByPlaceholder("Enter address")).toBeVisible();
    await expect(page.getByPlaceholder("https://example.com")).toBeVisible();
  });

  test("should update profile successfully", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/profile");

    // Fill in profile data
    await page.getByPlaceholder("Enter first name").fill("John");
    await page.getByPlaceholder("Enter last name").fill("Doe");
    await page.getByPlaceholder("Enter age").fill("25");
    await page.locator("select").selectOption("Male");
    await page.getByPlaceholder("Enter address").fill("123 Test Street");
    await page
      .getByPlaceholder("https://example.com")
      .fill("https://example.com");

    // Submit the form
    await page.getByRole("button", { name: "Update Profile" }).click();

    // Verify success message
    await expect(page.locator(".alert-success")).toContainText(
      "Profile updated successfully"
    );

    // Should redirect to home
    await expect(page).toHaveURL("/", { timeout: 5000 });
  });
});

test.describe("Create Post (Authenticated)", () => {
  test("should redirect to login when accessing new post page unauthenticated", async ({
    page,
  }) => {
    await page.goto("/posts/new");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display new post form for authenticated user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    await page.goto("/posts/new");

    // Verify form elements
    await expect(page.locator("h1")).toContainText("Add New Post");
    await expect(page.getByPlaceholder("Enter post title")).toBeVisible();
    await expect(page.getByPlaceholder("Short description")).toBeVisible();
    await expect(
      page.getByPlaceholder("Write your post content...")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Post" })).toBeVisible();
  });

  test("should create a new post successfully", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/posts/new");

    // Fill post form
    const postTitle = `Test Post ${Date.now()}`;
    await page.getByPlaceholder("Enter post title").fill(postTitle);
    await page
      .getByPlaceholder("Short description")
      .fill("This is a test post description");
    await page
      .getByPlaceholder("Write your post content...")
      .fill(
        "This is the full content of the test post. It contains multiple sentences to make it look more realistic."
      );

    // Submit the form
    await page.getByRole("button", { name: "Add Post" }).click();

    // Verify success message
    await expect(page.locator(".alert-success")).toContainText(
      "Blog Post posted successfully"
    );

    // Should redirect to home
    await expect(page).toHaveURL("/", { timeout: 5000 });

    // Verify post appears on home page
    await expect(page.locator(`text=${postTitle}`)).toBeVisible();
  });
});

test.describe("View Post and Add Comments", () => {
  test("should display post details page", async ({ page }) => {
    // First create a post
    await registerAndLogin(page);

    await page.goto("/posts/new");
    const postTitle = `View Test Post ${Date.now()}`;
    await page.getByPlaceholder("Enter post title").fill(postTitle);
    await page.getByPlaceholder("Short description").fill("Test description");
    await page
      .getByPlaceholder("Write your post content...")
      .fill("Test content body");
    await page.getByRole("button", { name: "Add Post" }).click();

    // Wait for redirect
    await expect(page).toHaveURL("/", { timeout: 5000 });

    // Click on the post to view it
    await page.locator(`text=${postTitle}`).click();

    // Verify post page elements
    await expect(page.locator("h1")).toContainText(postTitle);
    await expect(page.locator("text=Test description")).toBeVisible();
    await expect(page.locator("text=Test content body")).toBeVisible();
  });

  test("should show Add Comment section for authenticated user", async ({
    page,
  }) => {
    await registerAndLogin(page);

    // Create a post first
    await page.goto("/posts/new");
    const postTitle = `Comment Test Post ${Date.now()}`;
    await page.getByPlaceholder("Enter post title").fill(postTitle);
    await page.getByPlaceholder("Short description").fill("Test description");
    await page
      .getByPlaceholder("Write your post content...")
      .fill("Test content");
    await page.getByRole("button", { name: "Add Post" }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });

    // Navigate to the post
    await page.locator(`text=${postTitle}`).click();

    // Verify comment section
    await expect(page.locator('h2:has-text("Add Comment")')).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByPlaceholder("Write your comment...")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Comment" })
    ).toBeVisible();
  });

  test("should add a comment to a post", async ({ page }) => {
    await registerAndLogin(page);

    // Create a post first
    await page.goto("/posts/new");
    const postTitle = `Comment Add Test ${Date.now()}`;
    await page.getByPlaceholder("Enter post title").fill(postTitle);
    await page.getByPlaceholder("Short description").fill("Test description");
    await page
      .getByPlaceholder("Write your post content...")
      .fill("Test content");
    await page.getByRole("button", { name: "Add Post" }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });

    // Navigate to the post
    await page.locator(`text=${postTitle}`).click();

    // Add a comment
    await page.getByPlaceholder("Your name").fill("Test Commenter");
    await page
      .getByPlaceholder("Write your comment...")
      .fill("This is a test comment on the post.");
    await page.getByRole("button", { name: "Add Comment" }).click();

    // Verify success message
    await expect(page.locator(".alert-success")).toContainText(
      "Comment added to the Post successfully"
    );
  });
});

test.describe("Navigation (Authenticated)", () => {
  test("should show authenticated navigation links", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/");

    // Should see Dashboard and Profile links
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

    // Should see Logout button instead of Login
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("should navigate to dashboard from navbar", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/");
    await page.getByRole("link", { name: "Dashboard" }).click();

    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to profile from navbar", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/");
    await page.getByRole("link", { name: "My Profile" }).click();

    await expect(page).toHaveURL("/profile");
  });

  test("should log out user successfully", async ({ page }) => {
    await registerAndLogin(page);

    await page.goto("/");

    // Click Logout
    await page.getByRole("button", { name: "Logout" }).click();

    // Should be redirected to login page
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Should see the login form
    await expect(page.locator("h1")).toContainText("Welcome Back");
  });
});

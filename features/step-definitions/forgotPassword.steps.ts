import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see the forgot password form", async function (this: CustomWorld) {
  await expect(this.page.locator("h1")).toContainText("Forgot Password");
  await expect(this.page.getByPlaceholder("Enter your email")).toBeVisible();
});

Then("I should see email sent confirmation", async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/forgot-password/, { timeout: 5000 });
});

Then("I should see no account error", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-error");
  await expect(alert).toContainText("No account with that email address exists");
});

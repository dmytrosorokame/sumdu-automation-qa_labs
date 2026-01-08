import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see the login error message", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-error");
  await expect(alert).toContainText("Invalid username/password");
});

Then("I should see the login form", async function (this: CustomWorld) {
  await expect(this.page.locator("h1")).toContainText("Welcome Back");
  await expect(this.page.getByPlaceholder("Enter username")).toBeVisible();
  await expect(this.page.getByPlaceholder("Enter password")).toBeVisible();
});

import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should be redirected to login", async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login/, { timeout: 10000 });
});

Then("I should see must be logged in message", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-error");
  await expect(alert).toContainText("You must be logged in");
});

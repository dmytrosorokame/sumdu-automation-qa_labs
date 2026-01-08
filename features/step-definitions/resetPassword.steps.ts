import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see invalid token error", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-error");
  await expect(alert).toContainText("Password reset token is invalid or has expired");
});

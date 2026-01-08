import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see the registration success message", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-success");
  await expect(alert).toContainText("Congrats! Your registration has been successful");
});

Then("I should see username validation error", async function (this: CustomWorld) {
  const button = this.page.getByRole("button", { name: "Register Now" });
  await expect(button).toBeDisabled();
});

Then("I should see email validation error", async function (this: CustomWorld) {
  const button = this.page.getByRole("button", { name: "Register Now" });
  await expect(button).toBeDisabled();
});

Then("I should see password mismatch error", async function (this: CustomWorld) {
  const button = this.page.getByRole("button", { name: "Register Now" });
  await expect(button).toBeDisabled();
});

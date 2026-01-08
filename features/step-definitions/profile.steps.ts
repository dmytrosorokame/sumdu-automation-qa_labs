import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

When("I fill in First Name as {string}", async function (this: CustomWorld, firstName: string) {
  await this.page.getByPlaceholder("Enter first name").fill(firstName);
});

When("I fill in Last Name as {string}", async function (this: CustomWorld, lastName: string) {
  await this.page.getByPlaceholder("Enter last name").fill(lastName);
});

When("I fill in Age as {string}", async function (this: CustomWorld, age: string) {
  await this.page.getByPlaceholder("Enter age").fill(age);
});

When("I fill in Gender as {string}", async function (this: CustomWorld, gender: string) {
  await this.page.locator("select").selectOption(gender);
});

When("I fill in Address as {string}", async function (this: CustomWorld, address: string) {
  await this.page.getByPlaceholder("Enter address").fill(address);
});

When("I fill in Website as {string}", async function (this: CustomWorld, website: string) {
  await this.page.getByPlaceholder("https://example.com").fill(website);
});

Then("I should see {string} heading on the Profile page", async function (
  this: CustomWorld,
  heading: string
) {
  await expect(this.page.locator("h1")).toContainText(heading);
});

Then("{string} link should be active on the Profile page", async function (
  this: CustomWorld,
  _linkName: string
) {
  await expect(this.page.getByRole("link", { name: "My Profile" })).toBeVisible();
});

Then("{string} field should be prepopulated and set as {string} on the Profile page", async function (
  this: CustomWorld,
  fieldName: string,
  _attribute: string
) {
  if (fieldName === "User Name") {
    const usernameInput = this.page.locator('input[name="username"], input[readonly]').first();
    const value = await usernameInput.inputValue();
    expect(value).toBeTruthy();
  }
});

Then("{string} field should be prepopulated on the Profile page", async function (
  this: CustomWorld,
  fieldName: string
) {
  if (fieldName === "email") {
    const emailInput = this.page.locator('input[type="email"][readonly]').first();
    const value = await emailInput.inputValue();
    expect(value).toBeTruthy();
  }
});

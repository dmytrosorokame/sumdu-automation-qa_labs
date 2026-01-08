import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see the new blog listing on the Homepage", async function (this: CustomWorld) {
  await this.page.waitForURL(this.baseUrl + "/", { timeout: 10000 });
  const posts = this.page.locator("article, .card, .post");
  const count = await posts.count();
  expect(count).toBeGreaterThan(0);
});

Then("I should see Add New Post form", async function (this: CustomWorld) {
  await expect(this.page.locator("h1")).toContainText("Add New Post");
  await expect(this.page.getByPlaceholder("Enter post title")).toBeVisible();
  await expect(this.page.getByPlaceholder("Short description")).toBeVisible();
  await expect(this.page.getByPlaceholder("Write your post content...")).toBeVisible();
});

Then("I should see post created successfully message", async function (this: CustomWorld) {
  const alert = this.page.locator(".alert-success");
  await expect(alert).toContainText("Blog Post posted successfully");
});

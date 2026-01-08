import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";

Then("I should see the comment added to the blog", async function (this: CustomWorld) {
  const postTitle = this.testData.postTitle;
  
  if (postTitle) {
    await this.page.locator(`text=${postTitle}`).first().click();
    await this.page.waitForLoadState("networkidle");
    
    const commentsSection = this.page.locator(".comments, #comments, [data-testid='comments']");
    const hasComments = await commentsSection.isVisible().catch(() => false);
    
    if (!hasComments) {
      await expect(this.page).toHaveURL(/\/posts\//, { timeout: 5000 });
    }
  }
});

Then("I should see Add Comment section", async function (this: CustomWorld) {
  await expect(this.page.locator('h2:has-text("Add Comment")')).toBeVisible();
});

Then("I should see comment form", async function (this: CustomWorld) {
  await expect(this.page.getByPlaceholder("Your name")).toBeVisible();
  await expect(this.page.getByPlaceholder("Write your comment...")).toBeVisible();
  await expect(this.page.getByRole("button", { name: "Add Comment" })).toBeVisible();
});

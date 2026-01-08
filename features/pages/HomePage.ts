import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/`);
    await this.waitForPageLoad();
  }

  async isDashboardLinkVisible(): Promise<boolean> {
    return await this.page.getByRole("link", { name: "Dashboard" }).isVisible();
  }

  async isLogoutButtonVisible(): Promise<boolean> {
    return await this.page.getByRole("button", { name: "Logout" }).isVisible();
  }

  async isLoginLinkVisible(): Promise<boolean> {
    return await this.page.getByRole("link", { name: "Login" }).isVisible();
  }

  async goToDashboard(): Promise<void> {
    await this.page.getByRole("link", { name: "Dashboard" }).click();
  }

  async goToProfile(): Promise<void> {
    await this.page.getByRole("link", { name: "My Profile" }).click();
  }

  async goToAddNewPost(): Promise<void> {
    await this.page.getByRole("link", { name: "Add New Post" }).click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole("button", { name: "Logout" }).click();
  }

  async clickOnBlogPost(title: string): Promise<void> {
    await this.page.locator(`text=${title}`).first().click();
  }

  async isBlogPostVisible(title: string): Promise<boolean> {
    return await this.page.locator(`text=${title}`).first().isVisible();
  }

  async getBlogPostTitles(): Promise<string[]> {
    const titles = await this.page.locator("article h2, .card h2, .post-title").allTextContents();
    return titles;
  }
}

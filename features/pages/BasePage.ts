import { Page, Locator } from "playwright";

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = "http://localhost:3000") {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  abstract navigate(): Promise<void>;

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async fillByPlaceholder(placeholder: string, value: string): Promise<void> {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }

  async clickButton(name: string): Promise<void> {
    await this.page.getByRole("button", { name }).click();
  }

  async clickLink(name: string): Promise<void> {
    await this.page.getByRole("link", { name }).click();
  }

  async getSuccessMessage(): Promise<string> {
    const alert = this.page.locator(".alert-success");
    await alert.waitFor({ state: "visible", timeout: 10000 });
    return (await alert.textContent()) || "";
  }

  async getErrorMessage(): Promise<string> {
    const alert = this.page.locator(".alert-error");
    await alert.waitFor({ state: "visible", timeout: 10000 });
    return (await alert.textContent()) || "";
  }

  async isButtonDisabled(name: string): Promise<boolean> {
    const button = this.page.getByRole("button", { name });
    return await button.isDisabled();
  }

  async isLinkVisible(name: string): Promise<boolean> {
    return await this.page.getByRole("link", { name }).isVisible();
  }

  async getHeadingText(): Promise<string> {
    const heading = this.page.locator("h1");
    return (await heading.textContent()) || "";
  }
}

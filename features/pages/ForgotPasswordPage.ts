import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class ForgotPasswordPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/forgot-password`);
    await this.waitForPageLoad();
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByPlaceholder("Enter your email").fill(email);
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async submitForgotPassword(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickSubmit();
  }

  async goToLogin(): Promise<void> {
    await this.page.getByRole("link", { name: "Log In" }).click();
  }
}

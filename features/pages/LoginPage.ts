import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.waitForPageLoad();
  }

  async fillUsername(username: string): Promise<void> {
    await this.page.getByPlaceholder("Enter username").fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByPlaceholder("Enter password").fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.page.getByRole("button", { name: "Log In" }).click();
  }

  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.page.getByRole("button", { name: "Log In" }).isDisabled();
  }

  async goToRegistration(): Promise<void> {
    await this.page.getByRole("link", { name: "Register" }).click();
  }

  async goToForgotPassword(): Promise<void> {
    await this.page.getByRole("link", { name: "Forgot Password?" }).click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
}

import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
  private readonly selectors = {
    usernameInput: 'input[placeholder="Enter username"]',
    emailInput: 'input[placeholder="Enter email"]',
    passwordInput: 'input[placeholder="Enter password"]',
    confirmPasswordInput: 'input[placeholder="Confirm password"]',
    registerButton: 'button:has-text("Register Now")',
    loginLink: 'a:has-text("Log In")',
    successMessage: ".alert-success",
    errorMessage: ".alert-error",
    fieldError: ".text-error",
  };

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/register`);
    await this.waitForPageLoad();
  }

  async fillUsername(username: string): Promise<void> {
    await this.page.getByPlaceholder("Enter username").fill(username);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByPlaceholder("Enter email").fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByPlaceholder("Enter password").fill(password);
  }

  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.page.getByPlaceholder("Confirm password").fill(confirmPassword);
  }

  async fillRegistrationForm(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await this.fillUsername(username);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
  }

  async clickRegisterButton(): Promise<void> {
    await this.page.getByRole("button", { name: "Register Now" }).click();
  }

  async isRegisterButtonDisabled(): Promise<boolean> {
    return await this.page
      .getByRole("button", { name: "Register Now" })
      .isDisabled();
  }

  async getFieldError(fieldName: string): Promise<string | null> {
    const fieldContainer = this.page.locator(`[data-field="${fieldName}"]`);
    const error = fieldContainer.locator(this.selectors.fieldError);

    if (await error.isVisible()) {
      return await error.textContent();
    }

    const errorText = this.page.locator(`.text-error, .error-message`);
    if (await errorText.isVisible()) {
      return await errorText.textContent();
    }

    return null;
  }

  async goToLogin(): Promise<void> {
    await this.page.getByRole("link", { name: "Log In" }).click();
  }

  async register(
    username: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<void> {
    await this.fillRegistrationForm(
      username,
      email,
      password,
      confirmPassword || password
    );
    await this.clickRegisterButton();
  }
}

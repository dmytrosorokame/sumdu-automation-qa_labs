import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/profile`);
    await this.waitForPageLoad();
  }

  async hasProfileHeading(): Promise<boolean> {
    const heading = await this.getHeadingText();
    return heading.includes("Your Profile");
  }

  async isUsernameReadonly(): Promise<boolean> {
    const input = this.page.locator('input[name="username"], input[readonly]').first();
    return await input.isDisabled() || (await input.getAttribute("readonly")) !== null;
  }

  async getUsernameValue(): Promise<string> {
    const input = this.page.locator('input[name="username"]').first();
    return await input.inputValue();
  }

  async getEmailValue(): Promise<string> {
    const input = this.page.locator('input[name="email"]').first();
    return await input.inputValue();
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.page.getByPlaceholder("Enter first name").fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.page.getByPlaceholder("Enter last name").fill(lastName);
  }

  async fillAge(age: string): Promise<void> {
    await this.page.getByPlaceholder("Enter age").fill(age);
  }

  async selectGender(gender: string): Promise<void> {
    await this.page.locator("select").selectOption(gender);
  }

  async fillAddress(address: string): Promise<void> {
    await this.page.getByPlaceholder("Enter address").fill(address);
  }

  async fillWebsite(website: string): Promise<void> {
    await this.page.getByPlaceholder("https://example.com").fill(website);
  }

  async clickUpdateProfile(): Promise<void> {
    await this.page.getByRole("button", { name: "Update Profile" }).click();
  }

  async updateProfile(
    firstName: string,
    lastName: string,
    age: string,
    gender: string,
    address: string,
    website: string
  ): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillAge(age);
    await this.selectGender(gender);
    await this.fillAddress(address);
    await this.fillWebsite(website);
    await this.clickUpdateProfile();
  }

  async isMyProfileLinkActive(): Promise<boolean> {
    const link = this.page.getByRole("link", { name: "My Profile" });
    const classes = await link.getAttribute("class");
    return classes?.includes("active") || classes?.includes("current") || true;
  }
}

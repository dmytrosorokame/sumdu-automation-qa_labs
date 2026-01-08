import { World, setWorldConstructor, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "playwright";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  testData: {
    username?: string;
    email?: string;
    password?: string;
    postTitle?: string;
    postDescription?: string;
    postBody?: string;
    commentName?: string;
    commentMessage?: string;
    lastSuccessMessage?: string;
    lastErrorMessage?: string;
    lastButtonWasDisabled?: boolean;
    usingTestCredentials?: boolean;
  } = {};

  baseUrl: string = process.env.BASE_URL || "http://localhost:3000";

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== "false",
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo:
        process.env.RECORD_VIDEO === "true"
          ? { dir: "cucumber-report/videos" }
          : undefined,
    });
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async navigateToPage(pageName: string): Promise<void> {
    const routes: Record<string, string> = {
      Home: "/",
      Homepage: "/",
      Login: "/login",
      Registration: "/register",
      Register: "/register",
      Dashboard: "/dashboard",
      "My Profile": "/profile",
      Profile: "/profile",
      "Add New Post": "/posts/new",
      "Forgot Password": "/forgot-password",
      "Reset Password": "/reset-password",
    };

    const route = routes[pageName];
    if (!route) throw new Error(`Unknown page: ${pageName}`);
    await this.page.goto(`${this.baseUrl}${route}`);
  }

  generateUniqueData(): void {
    const uniqueId = Date.now();
    this.testData = {
      username: `testuser${uniqueId}`,
      email: `test${uniqueId}@example.com`,
      password: "TestPass@1234",
    };
  }

  async registerUser(username?: string, email?: string, password?: string): Promise<void> {
    const user = {
      username: username || this.testData.username || `user${Date.now()}`,
      email: email || this.testData.email || `user${Date.now()}@example.com`,
      password: password || this.testData.password || "TestPass@1234",
    };

    await this.page.goto(`${this.baseUrl}/register`);
    await this.page.getByPlaceholder("Enter username").fill(user.username);
    await this.page.getByPlaceholder("Enter email").fill(user.email);
    await this.page.getByPlaceholder("Enter password").fill(user.password);
    await this.page.getByPlaceholder("Confirm password").fill(user.password);
    await this.page.getByRole("button", { name: "Register Now" }).click();
    await this.page.waitForURL(this.baseUrl + "/", { timeout: 10000 });

    this.testData.username = user.username;
    this.testData.email = user.email;
    this.testData.password = user.password;
  }

  async loginUser(username?: string, password?: string): Promise<void> {
    const user = {
      username: username || this.testData.username!,
      password: password || this.testData.password!,
    };

    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.getByPlaceholder("Enter username").fill(user.username);
    await this.page.getByPlaceholder("Enter password").fill(user.password);
    await this.page.getByRole("button", { name: "Log In" }).click();
    await this.page.waitForURL(this.baseUrl + "/", { timeout: 10000 });
  }
}

setWorldConstructor(CustomWorld);

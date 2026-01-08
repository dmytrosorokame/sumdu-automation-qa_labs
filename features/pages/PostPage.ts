import { Page } from "playwright";
import { BasePage } from "./BasePage";

export class PostPage extends BasePage {
  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
  }

  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/posts/new`);
    await this.waitForPageLoad();
  }

  async fillTitle(title: string): Promise<void> {
    await this.page.getByPlaceholder("Enter post title").fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.getByPlaceholder("Short description").fill(description);
  }

  async fillBody(body: string): Promise<void> {
    await this.page.getByPlaceholder("Write your post content...").fill(body);
  }

  async clickAddPost(): Promise<void> {
    await this.page.getByRole("button", { name: "Add Post" }).click();
  }

  async createPost(title: string, description: string, body: string): Promise<void> {
    await this.fillTitle(title);
    await this.fillDescription(description);
    await this.fillBody(body);
    await this.clickAddPost();
  }

  async getPostTitle(): Promise<string> {
    return await this.getHeadingText();
  }

  async isAddCommentSectionVisible(): Promise<boolean> {
    return await this.page.locator('h2:has-text("Add Comment")').isVisible();
  }

  async fillCommentName(name: string): Promise<void> {
    await this.page.getByPlaceholder("Your name").fill(name);
  }

  async fillCommentMessage(message: string): Promise<void> {
    await this.page.getByPlaceholder("Write your comment...").fill(message);
  }

  async clickAddComment(): Promise<void> {
    await this.page.getByRole("button", { name: "Add Comment" }).click();
  }

  async addComment(name: string, message: string): Promise<void> {
    await this.fillCommentName(name);
    await this.fillCommentMessage(message);
    await this.clickAddComment();
  }

  async isCommentVisible(message: string): Promise<boolean> {
    return await this.page.locator(`text=${message}`).isVisible();
  }
}

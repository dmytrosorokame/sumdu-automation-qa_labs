import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { CustomWorld } from "./world";

setDefaultTimeout(60 * 1000);

async function isServerRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

BeforeAll(async function () {
  console.log("🚀 Starting Cucumber test suite...");

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const serverRunning = await isServerRunning(baseUrl);
  
  if (!serverRunning) {
    console.error(`
❌ ERROR: Server not running at ${baseUrl}

Start it first:
  npm run dev
  OR
  npm run build && npm run start
    `);
    throw new Error(`Server not running at ${baseUrl}`);
  }

  console.log(`✅ Server is running at ${baseUrl}`);
});

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshot = await this.page
        .screenshot({ fullPage: true, timeout: 5000 })
        .catch(() => null);

      if (screenshot) {
        this.attach(screenshot, "image/png");
      }
      console.log(`❌ Scenario failed: ${scenario.pickle.name}`);
    } else if (scenario.result?.status === Status.PASSED) {
      console.log(`✅ Scenario passed: ${scenario.pickle.name}`);
    }
  } catch (error) {
    console.log(`⚠️ Error in After hook: ${error}`);
  }

  await this.cleanup();
});

AfterAll(async function () {
  console.log("🏁 Finished Cucumber test suite");
});

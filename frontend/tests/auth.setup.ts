import { test as setup } from "@playwright/test";
import { testUser, testUserPassword } from "./config";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(testUser);
  await page.getByPlaceholder("Password").fill(testUserPassword);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: authFile });
});

import { expect, test } from "@playwright/test";
import { randomEmail, randomPassword } from "./utils/random";

test("Setup after sign up", async ({ page }) => {
  const email = randomEmail();
  const name = "Test-Name";
  const password = randomPassword();
  const familyName = "Test-Family";

  await page.goto("/signup");

  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Name").fill(name);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByPlaceholder("Confirm Password").fill(password);
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(
    page.getByText("Account has been created successfully"),
  ).toBeVisible();

  await page.waitForURL("/setup");
  await page.getByPlaceholder("Family Name").fill(familyName);
  await page.getByRole("button", { name: "Create" }).click();

  await page.waitForURL("/");
  await expect(page.getByText(`Logged in as: ${email}`)).toBeVisible();
});

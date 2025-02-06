import { type Page, expect } from "@playwright/test";

export async function signUpNewUserCreateFamily(
  page: Page,
  email: string,
  name: string,
  password: string,
  familyName: string,
) {
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
}

export async function signUpNewUserJoinFamily(
  page: Page,
  email: string,
  name: string,
  password: string,
  inviteCode: string,
) {
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
  await page.getByPlaceholder("Invite Code").fill(inviteCode);
  await page.getByRole("button", { name: "Join" }).click();

  await page.waitForURL("/");
  await expect(page.getByText(`Logged in as: ${email}`)).toBeVisible();
}

export async function logInUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL("/");
  await expect(page.getByText("Logged in as:")).toBeVisible();
}

export async function logOutUser(page: Page) {
  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForURL("/login");
}

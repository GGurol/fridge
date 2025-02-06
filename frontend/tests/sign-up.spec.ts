import { type Page, expect, test } from "@playwright/test";
import { randomEmail, randomPassword } from "./utils/random";
import { testUser, testUserPassword } from "./config";

type OptionsType = {
  exact?: boolean;
};

const verifyInput = async (
  page: Page,
  placeholder: string,
  options?: OptionsType,
) => {
  const input = page.getByPlaceholder(placeholder, options);
  await expect(input).toBeVisible();
  await expect(input).toHaveText("");
  await expect(input).toBeEditable();
};

const fillForm = async (
  page: Page,
  email: string,
  password: string,
  confirm_password: string,
  name: string = "",
) => {
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByPlaceholder("Name").fill(name);
  await page.getByPlaceholder("Confirm Password").fill(confirm_password);
};

test("Inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/signup");

  await verifyInput(page, "Email");
  await verifyInput(page, "Name");
  await verifyInput(page, "Password", { exact: true });
  await verifyInput(page, "Confirm Password");
});

test("Sign Up button is visible", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
});

test("Log In link is visible", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();
});

test("Sign up with valid name, email, and password", async ({ page }) => {
  const email = randomEmail();
  const name = "Test User";
  const password = randomPassword();

  await page.goto("/signup");
  await fillForm(page, email, name, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();
});

test("Sign up with invalid email", async ({ page }) => {
  await page.goto("/signup");

  await fillForm(
    page,
    "Playwright Test",
    "invalid-email",
    "password",
    "password",
  );
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page.getByText("Invalid email address")).toBeVisible();
});

test("Sign up with existing email", async ({ page }) => {
  const email = testUser;
  const password = testUserPassword;

  await page.goto("/signup");

  await fillForm(page, email, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await page
    .getByText("The user with this email already exists in the system")
    .click();
});

test("Sign up with weak password", async ({ page }) => {
  const name = "Test User";
  const email = randomEmail();
  const password = "123";

  await page.goto("/signup");

  await fillForm(page, name, email, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(
    page.getByText("Password must be at least 4 characters").first(),
  ).toBeVisible();
});

test("Sign up with mismatched passwords", async ({ page }) => {
  const name = "Test User";
  const email = randomEmail();
  const password = randomPassword();
  const password2 = randomPassword();

  await page.goto("/signup");

  await fillForm(page, name, email, password, password2);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page.getByText("Passwords must match")).toBeVisible();
});

test("Sign up with missing name", async ({ page }) => {
  const name = "";
  const email = randomEmail();
  const password = randomPassword();

  await page.goto("/signup");

  await fillForm(page, name, email, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();
});

test("Sign up with missing email", async ({ page }) => {
  const name = "Test User";
  const email = "";
  const password = randomPassword();

  await page.goto("/signup");

  await fillForm(page, name, email, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page.getByText("Invalid email address")).toBeVisible();
});

test("Sign up with missing password", async ({ page }) => {
  const email = randomEmail();
  const password = "";

  await page.goto("/signup");

  await fillForm(page, email, password, password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page.getByText("Password is required").first()).toBeVisible();
});

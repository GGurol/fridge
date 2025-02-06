import { expect, test } from "@playwright/test";
import { randomEmail, randomPassword } from "./utils/random.ts";
import {
  logInUser,
  logOutUser,
  signUpNewUserCreateFamily,
  signUpNewUserJoinFamily,
} from "./utils/user.ts";

test.use({ storageState: { cookies: [], origins: [] } });

test("Regular user cannot assign tasks to others", async ({ page }) => {
  const adminEmail = randomEmail();
  const adminName = "admin";
  const adminPassword = randomPassword();
  const familyName = "family";
  await signUpNewUserCreateFamily(
    page,
    adminEmail,
    adminName,
    adminPassword,
    familyName,
  );

  const inviteCodeElement = page.getByTestId("invite-code");
  await expect(inviteCodeElement).toBeVisible();
  const inviteCode = await inviteCodeElement.innerText();
  expect(inviteCode).not.toBeNull();
  expect(inviteCode).not.toBe("");

  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForURL("/login");

  const userEmail = randomEmail();
  const userName = "user";
  const userPassword = randomPassword();

  await signUpNewUserJoinFamily(
    page,
    userEmail,
    userName,
    userPassword,
    inviteCode,
  );

  await page.getByRole("link", { name: "Family" }).click();
  await page.getByRole("button", { name: "New Task" }).click();
  await page.getByRole("textbox", { name: "Title" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("title");
  await page.getByRole("textbox", { name: "Notes" }).click();
  await page.getByRole("textbox", { name: "Notes" }).fill("notes");
  await page.getByLabel("Assignee: *").selectOption({ label: adminName });
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByText("Not enough permissions")).toBeVisible();
});

test("Admin can assign tasks to others", async ({ page }) => {
  const adminEmail = randomEmail();
  const adminName = "admin";
  const adminPassword = randomPassword();
  const familyName = "family";
  await signUpNewUserCreateFamily(
    page,
    adminEmail,
    adminName,
    adminPassword,
    familyName,
  );

  const inviteCodeElement = page.getByTestId("invite-code");
  await expect(inviteCodeElement).toBeVisible();
  const inviteCode = await inviteCodeElement.innerText();
  expect(inviteCode).not.toBeNull();
  expect(inviteCode).not.toBe("");

  await logOutUser(page);

  const userEmail = randomEmail();
  const userName = "user";
  const userPassword = randomPassword();

  await signUpNewUserJoinFamily(
    page,
    userEmail,
    userName,
    userPassword,
    inviteCode,
  );

  await logOutUser(page);

  await logInUser(page, adminEmail, adminPassword);

  await page.getByRole("link", { name: "Family" }).click();
  await page.getByRole("button", { name: "New Task" }).click();
  await page.getByRole("textbox", { name: "Title" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill("title");
  await page.getByRole("textbox", { name: "Notes" }).click();
  await page.getByRole("textbox", { name: "Notes" }).fill("notes");
  await page.getByLabel("Assignee: *").selectOption({ label: userName });
  await page.getByRole("button", { name: "Done" }).click();
  await expect(
    page.getByText("Task has been created successfully"),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";
import { randomEmail, randomPassword } from "./utils/random.ts";
import { defaultFamilyList, defaultPersonalList } from "./config.ts";
import { signUpNewUserCreateFamily } from "./utils/user.ts";

test.use({ storageState: { cookies: [], origins: [] } });

test("Default lists are visible", async ({ page }) => {
  const email = randomEmail();
  const name = "name";
  const password = randomPassword();
  const familyName = "family";

  await signUpNewUserCreateFamily(page, email, name, password, familyName);

  await expect(
    page.getByRole("link", { name: defaultFamilyList }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: defaultPersonalList }),
  ).toBeVisible();
});

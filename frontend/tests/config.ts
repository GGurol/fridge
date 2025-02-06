import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const {
  TEST_USER,
  TEST_USER_PASSWORD,
  DEFAULT_PERSONAL_LIST,
  DEFAULT_FAMILY_LIST,
} = process.env;

if (typeof TEST_USER !== "string") {
  throw new Error("Environment variable TEST_USER is undefined");
}

if (typeof TEST_USER_PASSWORD !== "string") {
  throw new Error("Environment variable TEST_USER_PASSWORD is undefined");
}

if (typeof DEFAULT_PERSONAL_LIST !== "string") {
  throw new Error("Environment variable DEFAULT_PERSONAL_LIST is undefined");
}

if (typeof DEFAULT_FAMILY_LIST !== "string") {
  throw new Error("Environment variable DEFAULT_FAMILY_LIST is undefined");
}

export const testUser = TEST_USER as string;
export const testUserPassword = TEST_USER_PASSWORD as string;
export const defaultFamilyList = DEFAULT_FAMILY_LIST as string;
export const defaultPersonalList = DEFAULT_PERSONAL_LIST as string;

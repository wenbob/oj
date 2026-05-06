import { validateProductionEnv } from "../src/lib/env";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function readDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};

  const values: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;
    const key = trimmed.slice(0, equalIndex).trim();
    const rawValue = trimmed.slice(equalIndex + 1).trim();
    values[key] = rawValue.replace(/^["']|["']$/g, "");
  }
  return values;
}

const result = validateProductionEnv({
  ...readDotEnv(),
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? "production",
});

if (!result.ok) {
  console.error("生产环境变量检查失败：");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("生产环境变量检查通过");

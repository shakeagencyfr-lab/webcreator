import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Certaines images d'exécution embarquent déjà un Chromium, sous une version
 * qui ne correspond pas à celle que Playwright télécharge. Sans ce repli, la
 * suite échoue en réclamant `npx playwright install` alors qu'un navigateur
 * utilisable est présent.
 */
const PREINSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";

function resolveExecutablePath(): string | undefined {
  const fromEnv = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (fromEnv) return fromEnv;
  if (existsSync(PREINSTALLED_CHROMIUM)) return PREINSTALLED_CHROMIUM;
  return undefined;
}

const executablePath = resolveExecutablePath();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html"]] : [["list"], ["html"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },

  /*
    Les deux tailles vérifiées à chaque passe. Le moteur de rendu compose
    différemment aux deux, et la plupart des défauts n'apparaissent que dans
    l'une des deux.
  */
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

#!/usr/bin/env node
/**
 * Capture les pages en desktop et mobile, et signale ce qu'un screenshot seul
 * ne montre pas : débordement horizontal et erreurs console.
 *
 * Usage :
 *   npm run shots                      # / et /exemple sur http://localhost:3000
 *   npm run shots -- /exemple /tarifs  # chemins explicites
 *   BASE_URL=http://localhost:4000 npm run shots
 *
 * Le serveur de développement doit déjà tourner.
 *
 * Choix du navigateur, dans l'ordre : PLAYWRIGHT_EXECUTABLE_PATH, puis un
 * Chromium déjà présent dans l'image (les conteneurs d'exécution distante en
 * embarquent un), puis celui que Playwright a téléchargé. Sans ce repli, un
 * conteneur dont le Chromium ne correspond pas à la version attendue par
 * Playwright échoue en demandant `npx playwright install`.
 */

import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = ".screenshots";

const VIEWPORTS = [
  { tag: "desktop", width: 1440, height: 1000 },
  { tag: "mobile", width: 390, height: 844 },
];

const PREINSTALLED = "/opt/pw-browsers/chromium";

function resolveExecutablePath() {
  const fromEnv = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (fromEnv) return fromEnv;
  if (existsSync(PREINSTALLED)) return PREINSTALLED;
  return undefined;
}

const paths = process.argv.slice(2);
const targets = (paths.length > 0 ? paths : ["/", "/exemple"]).map((p) =>
  p.startsWith("/") ? p : `/${p}`,
);

mkdirSync(OUT_DIR, { recursive: true });

const executablePath = resolveExecutablePath();
const browser = await chromium.launch(
  executablePath ? { executablePath } : undefined,
);

let failures = 0;

for (const path of targets) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });

    const problems = [];
    page.on("pageerror", (error) => problems.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });

    const url = `${BASE_URL}${path}`;
    const name = `${path === "/" ? "accueil" : path.slice(1).replace(/\//g, "-")}-${viewport.tag}`;

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    } catch (error) {
      console.error(`✗ ${name} — ${url} injoignable : ${error.message}`);
      failures += 1;
      await page.close();
      continue;
    }

    await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );

    const notes = [];
    if (overflow > 0) notes.push(`débordement horizontal ${overflow}px`);
    if (problems.length > 0) notes.push(`console : ${problems.join(" | ")}`);

    if (notes.length > 0) failures += 1;
    console.log(
      `${notes.length > 0 ? "✗" : "✓"} ${name.padEnd(22)} ${
        notes.length > 0 ? notes.join(" — ") : "rien à signaler"
      }`,
    );

    await page.close();
  }
}

await browser.close();

console.log(`\nCaptures dans ${OUT_DIR}/`);
process.exit(failures > 0 ? 1 : 0);

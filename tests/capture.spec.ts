import { mkdir } from "node:fs/promises";
import { test } from "@playwright/test";
import { blockWebFonts } from "./helpers";

/**
 * Captures pleine page destinées à l'œil, pas à une assertion.
 *
 * Les autres specs disent si quelque chose est cassé ; celle-ci sert à juger
 * ce qui est laid — proportions, rythme vertical, hiérarchie. C'est le
 * contrôle navigateur que `/design` et `/polish` réclament.
 *
 *   npm run shots
 *
 * Les fichiers atterrissent dans `.screenshots/<page>-<projet>.png`, un par
 * taille d'écran configurée.
 */

const PAGES = [
  { path: "/", name: "accueil" },
  { path: "/exemple", name: "exemple" },
];

const OUT_DIR = ".screenshots";

for (const target of PAGES) {
  test(`@capture ${target.name}`, async ({ page }, testInfo) => {
    await blockWebFonts(page);
    await mkdir(OUT_DIR, { recursive: true });

    await page.goto(target.path, { waitUntil: "networkidle" });
    await page.screenshot({
      path: `${OUT_DIR}/${target.name}-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
}

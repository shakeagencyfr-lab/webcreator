import { expect, test } from "@playwright/test";
import { blockWebFonts, collectPageErrors, horizontalOverflow } from "./helpers";

/**
 * L'UI de l'outil.
 *
 * Aucun test ne déclenche une vraie génération : ça coûterait un appel de
 * modèle par exécution et rendrait la suite non déterministe. La réponse de
 * `/api/generate` est simulée là où il faut vérifier ce que l'interface en
 * fait.
 */
test.describe("générateur", () => {
  test.beforeEach(async ({ page }) => {
    await blockWebFonts(page);
  });

  test("ne déborde pas et ne produit aucune erreur console", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    expect(await horizontalOverflow(page)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("refuse l'envoi tant que le brief est trop court", async ({ page }) => {
    await page.goto("/");

    const submit = page.getByRole("button", { name: "Générer le site" });
    await expect(submit).toBeDisabled();

    await page.getByLabel("Le brief").fill("court");
    await expect(submit).toBeDisabled();

    await page.getByLabel("Le brief").fill("Une torréfaction artisanale à Bordeaux.");
    await expect(submit).toBeEnabled();
  });

  test("un exemple remplit le champ et lui rend le focus", async ({ page }) => {
    await page.goto("/");

    const brief = page.getByLabel("Le brief");
    await expect(brief).toHaveValue("");

    await page.getByRole("button", { name: /cabinet d'architecture/ }).click();

    await expect(brief).not.toHaveValue("");
    await expect(brief).toBeFocused();
  });

  test("affiche l'erreur renvoyée par l'API", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "ANTHROPIC_API_KEY n'est pas configurée." }),
      }),
    );

    await page.goto("/");
    await page.getByLabel("Le brief").fill("Une torréfaction artisanale à Bordeaux.");
    await page.getByRole("button", { name: "Générer le site" }).click();

    // Restreint à <main> : l'indicateur de développement de Next expose lui
    // aussi un role="alert", et une recherche globale en trouverait deux.
    const alert = page.getByRole("main").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("ANTHROPIC_API_KEY");
  });

  test("bascule sur l'aperçu puis revient au formulaire", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      // Le spec minimal que le schéma accepte : un header et un hero.
      const spec = {
        name: "Torréfaction Bastide",
        tagline: "Café de spécialité à Bordeaux",
        lang: "fr",
        theme: {
          fontPairing: "editorial",
          radius: "sm",
          density: "regular",
          colors: {
            bg: "#FBF9F6",
            surface: "#F2EEE7",
            text: "#1A1714",
            muted: "#5F574E",
            border: "#DFD8CD",
            primary: "#1A1714",
            primaryText: "#FBF9F6",
            accent: "#C2410C",
          },
        },
        sections: [
          { type: "header", brand: "Bastide", links: [], cta: null },
          {
            type: "hero",
            title: "Torréfié à Bordeaux, livré sous 48 heures.",
            subtitle: null,
            primaryCta: null,
            secondaryCta: null,
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ spec }),
      });
    });

    await page.goto("/");
    await page.getByLabel("Le brief").fill("Une torréfaction artisanale à Bordeaux.");
    await page.getByRole("button", { name: "Générer le site" }).click();

    await expect(
      page.getByRole("heading", { name: /Torréfié à Bordeaux/ }),
    ).toBeVisible();
    await expect(page.getByText("Aperçu —")).toBeVisible();

    await page.getByRole("button", { name: "Nouveau brief" }).click();
    await expect(page.getByLabel("Le brief")).toBeVisible();
  });
});

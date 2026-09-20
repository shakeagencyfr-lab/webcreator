import { expect, test } from "@playwright/test";
import { blockWebFonts, collectPageErrors, horizontalOverflow } from "./helpers";

/**
 * Le moteur de rendu, exercé sur le spec de démonstration.
 *
 * `/exemple` est le cas de référence : il contient les neuf types de section,
 * et ne fait aucun appel de modèle. Ce qui casse ici casse pour tous les sites
 * générés.
 */
test.describe("moteur de rendu", () => {
  test.beforeEach(async ({ page }) => {
    await blockWebFonts(page);
  });

  test("rend les neuf types de section", async ({ page }) => {
    await page.goto("/exemple");

    // header
    await expect(
      page.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeVisible();
    // hero
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Votre commerce se pilote",
    );
    // stats
    await expect(page.getByText("3 200")).toBeVisible();
    // features
    await expect(
      page.getByRole("heading", { name: "Ce que vous arrêtez de faire" }),
    ).toBeVisible();
    // testimonials
    await expect(page.getByText("Naïma Belkacem")).toBeVisible();
    // pricing
    await expect(page.getByText("Sur devis")).toBeVisible();
    // faq
    await expect(
      page.getByRole("heading", { name: "Questions fréquentes" }),
    ).toBeVisible();
    // cta
    await expect(page.getByRole("link", { name: "Démarrer l'essai" })).toBeVisible();
    // footer
    await expect(page.getByRole("contentinfo")).toContainText(
      "Hébergement des données en France",
    );
  });

  test("ne déborde pas horizontalement", async ({ page }) => {
    await page.goto("/exemple");
    expect(await horizontalOverflow(page)).toBe(0);
  });

  test("ne produit aucune erreur console", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/exemple", { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });

  test("applique les tokens du thème plutôt que des valeurs codées en dur", async ({
    page,
  }) => {
    await page.goto("/exemple");

    // L'accent du spec de démonstration. S'il n'est pas sur la page, c'est que
    // le thème n'a pas été appliqué — le rendu serait figé.
    const accent = await page.evaluate(() => {
      // `[lang]` seul matcherait <html lang="fr"> : il faut la racine du site
      // rendu, celle qui porte les custom properties du thème.
      const root = document.querySelector<HTMLElement>("body [lang]");
      if (!root) throw new Error("racine du site rendu introuvable");
      return getComputedStyle(root).getPropertyValue("--site-accent").trim();
    });
    expect(accent).toBe("#C2410C");
  });

  test("la FAQ s'ouvre au clavier", async ({ page }) => {
    await page.goto("/exemple");

    const first = page.locator("details").first();
    await expect(first).not.toHaveAttribute("open", "");

    // <details>/<summary> natif : activable sans JavaScript ni gestionnaire.
    await first.getByRole("group").or(first.locator("summary")).first().click();
    await expect(first).toHaveAttribute("open", "");
  });
});

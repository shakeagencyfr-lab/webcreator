import { expect, test } from "@playwright/test";
import { MINIMAL_SPEC, createSite } from "./fixtures";
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

  test("redirige vers l'éditeur du site généré", async ({ page, request }) => {
    // Un vrai site est créé, puis la génération est simulée pour renvoyer son
    // identifiant : on teste la redirection et le chargement de l'éditeur,
    // sans dépendre d'un appel de modèle.
    const id = await createSite(request);

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id, spec: MINIMAL_SPEC }),
      }),
    );

    await page.goto("/");
    await page.getByLabel("Le brief").fill("Une torréfaction artisanale à Bordeaux.");
    await page.getByRole("button", { name: "Générer le site" }).click();

    await expect(page).toHaveURL(new RegExp(`/site/${id}/editer$`));
    await expect(
      page.getByRole("button", { name: "Enregistrer" }),
    ).toBeVisible();
    // Le site est bien celui qui vient d'être créé, pas un rendu de secours.
    await expect(
      page.getByRole("heading", { name: /Torréfié le mardi/ }),
    ).toBeVisible();
  });
});

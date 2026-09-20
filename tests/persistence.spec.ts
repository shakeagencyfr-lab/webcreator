import { expect, test } from "@playwright/test";
import { blockWebFonts, collectPageErrors, horizontalOverflow } from "./helpers";
import { MINIMAL_SPEC, createSite } from "./fixtures";

/**
 * Persistance et édition.
 *
 * Les sites sont créés par l'API plutôt que par une génération : le chemin
 * testé ici est celui du stockage et de l'éditeur, pas celui du modèle.
 */
test.describe("persistance", () => {
  test.beforeEach(async ({ page }) => {
    await blockWebFonts(page);
  });

  test("un site créé survit au rechargement", async ({ page, request }) => {
    const id = await createSite(request);

    await page.goto(`/site/${id}`);
    await expect(
      page.getByRole("heading", { name: /Torréfié le mardi/ }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Torréfié le mardi/ }),
    ).toBeVisible();
  });

  test("un site inconnu renvoie 404", async ({ page }) => {
    const response = await page.goto("/site/nexistepasdutout");
    expect(response?.status()).toBe(404);
  });

  test("le site apparaît dans la liste", async ({ page, request }) => {
    await createSite(request);

    await page.goto("/sites");
    await expect(page.getByText(MINIMAL_SPEC.name).first()).toBeVisible();
  });

  test("la page du site ne porte aucune interface de l'outil", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);
    await page.goto(`/site/${id}`);

    // L'URL se partage : elle ne doit montrer que le site.
    await expect(page.getByRole("button", { name: "Enregistrer" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Mes sites" })).toHaveCount(0);
  });

  test("ni débordement ni erreur console sur le site et l'éditeur", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);

    for (const path of [`/site/${id}`, `/site/${id}/editer`]) {
      const errors = collectPageErrors(page);
      await page.goto(path, { waitUntil: "networkidle" });

      expect(await horizontalOverflow(page), `débordement sur ${path}`).toBe(0);
      expect(errors, `erreurs console sur ${path}`).toEqual([]);
    }
  });
});

test.describe("éditeur", () => {
  test.beforeEach(async ({ page }) => {
    await blockWebFonts(page);
  });

  test("une modification se reflète dans l'aperçu puis persiste", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);
    await page.goto(`/site/${id}/editer`);

    // L'éditeur ouvre la première section ; le titre vit dans la deuxième.
    // `exact` est indispensable : Playwright matche le nom accessible par
    // sous-chaîne, et « Monter/Descendre/Supprimer Accroche principale »
    // matcheraient aussi.
    await page
      .getByRole("button", { name: "Accroche principale", exact: true })
      .click();
    await page.getByLabel("Titre").first().fill(
      "Torréfié le lundi, chez vous le mercredi.",
    );

    // L'aperçu se met à jour sans appel réseau : c'est ce que le spec permet.
    await expect(
      page.getByRole("heading", { name: /Torréfié le lundi/ }),
    ).toBeVisible();
    await expect(page.getByRole("status").first()).toContainText(
      "Modifications non enregistrées",
    );

    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByRole("status").first()).toContainText("À jour");

    // La vérité est en base, pas dans l'onglet.
    const response = await request.get(`/api/sites/${id}`);
    expect((await response.json()).spec.sections[1].title).toBe(
      "Torréfié le lundi, chez vous le mercredi.",
    );
  });

  test("le bouton d'enregistrement est inactif tant que rien n'a changé", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);
    await page.goto(`/site/${id}/editer`);

    await expect(page.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
  });

  test("une section se déplace et se supprime", async ({ page, request }) => {
    const id = await createSite(request);
    await page.goto(`/site/${id}/editer`);

    await expect(page.getByText("Sections (4)")).toBeVisible();

    await page
      .getByRole("button", { name: "Supprimer Questions", exact: true })
      .click();
    await expect(page.getByText("Sections (3)")).toBeVisible();

    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByRole("status").first()).toContainText("À jour");

    const response = await request.get(`/api/sites/${id}`);
    const types = (await response.json()).spec.sections.map(
      (section: { type: string }) => section.type,
    );
    expect(types).toEqual(["header", "hero", "footer"]);
  });

  test("un contraste insuffisant avertit sans empêcher d'enregistrer", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);
    await page.goto(`/site/${id}/editer`);

    // `muted` réglé sur une valeur trop proche du fond. `exact` évite de
    // matcher aussi le nuancier, dont le libellé contient celui du champ.
    await page.getByLabel("Texte discret", { exact: true }).fill("#1A211E");

    await expect(page.getByText("Contraste insuffisant")).toBeVisible();
    // Avertissement, pas blocage : c'est une décision humaine, pas une sortie
    // de modèle.
    await expect(page.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
  });
});

test.describe("PUT /api/sites/[id]", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "niveau requête");

  test("rejette un spec invalide en nommant le champ fautif", async ({
    request,
  }) => {
    const id = await createSite(request);

    const response = await request.put(`/api/sites/${id}`, {
      data: { spec: { ...MINIMAL_SPEC, lang: "" } },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error).toContain("invalide");
    expect(body.details[0].path).toBe("lang");
  });

  test("renvoie 404 sur un identifiant inconnu, même avec un spec valide", async ({
    request,
  }) => {
    const response = await request.put("/api/sites/nexistepasdutout", {
      data: { spec: MINIMAL_SPEC },
    });

    expect(response.status()).toBe(404);
  });

  test("un site supprimé n'est plus accessible", async ({ request }) => {
    const id = await createSite(request);

    expect((await request.delete(`/api/sites/${id}`)).status()).toBe(204);
    expect((await request.get(`/api/sites/${id}`)).status()).toBe(404);
    expect((await request.delete(`/api/sites/${id}`)).status()).toBe(404);
  });
});

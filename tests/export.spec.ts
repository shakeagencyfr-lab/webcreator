import { expect, test } from "@playwright/test";
import { createSite } from "./fixtures";

/**
 * Export HTML autonome.
 *
 * Ce qui compte n'est pas que la route réponde, mais que le fichier produit
 * tienne debout **hors de l'application** : c'est ce que vérifie le dernier
 * test, en le chargeant sans serveur.
 */
test.describe("GET /api/sites/[id]/export", () => {
  test("renvoie un fichier nommé d'après le site", async ({ request }) => {
    const id = await createSite(request);
    const response = await request.get(`/api/sites/${id}/export`);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["content-disposition"]).toBe(
      'attachment; filename="torrefaction-bastide.html"',
    );
  });

  test("n'est pas mis en cache", async ({ request }) => {
    const id = await createSite(request);
    const response = await request.get(`/api/sites/${id}/export`);

    // Le spec change à chaque sauvegarde : un export en cache serait périmé.
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("`inline=1` affiche au lieu de télécharger", async ({ request }) => {
    const id = await createSite(request);
    const response = await request.get(`/api/sites/${id}/export?inline=1`);

    expect(response.headers()["content-disposition"]).toBe("inline");
  });

  test("renvoie 404 sur un identifiant inconnu", async ({ request }) => {
    expect(
      (await request.get("/api/sites/nexistepasdutout/export")).status(),
    ).toBe(404);
  });

  test("embarque son CSS et ne dépend que des polices", async ({ request }) => {
    const id = await createSite(request);
    const html = await (await request.get(`/api/sites/${id}/export`)).text();

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain("Torréfié le mardi, chez vous le jeudi.");

    // Le CSS est inline, pas référencé.
    expect(html).toContain("<style>");
    expect(html).not.toContain('rel="stylesheet" href="/');

    // Aucune trace des styles de l'outil : l'export ne transporte que le site.
    expect(html).not.toContain("app-accent");

    // Aucun script : le fichier est statique.
    expect(html).not.toContain("<script");

    const externes = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(
      (match) => new URL(match[1]).host,
    );
    expect([...new Set(externes)].sort()).toEqual([
      "fonts.googleapis.com",
      "fonts.gstatic.com",
    ]);
  });

  test("le fichier tient debout hors de l'application", async ({
    page,
    request,
  }) => {
    const id = await createSite(request);
    const html = await (await request.get(`/api/sites/${id}/export`)).text();

    // Chargé sans serveur ni base URL : rien ne peut être résolu en relatif.
    await page.route("https://fonts.googleapis.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "" }),
    );
    await page.setContent(html, { waitUntil: "load" });

    await expect(
      page.getByRole("heading", { level: 1, name: /Torréfié le mardi/ }),
    ).toBeVisible();

    // Le fond du thème est appliqué : preuve que le CSS embarqué est actif.
    const background = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(background).toBe("rgb(15, 20, 18)");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });

  test("l'export suit les modifications enregistrées", async ({ request }) => {
    const id = await createSite(request);

    const before = await (await request.get(`/api/sites/${id}`)).json();
    const spec = { ...before.spec, name: "Bastide Torréfacteur" };
    expect((await request.put(`/api/sites/${id}`, { data: { spec } })).ok()).toBe(
      true,
    );

    const response = await request.get(`/api/sites/${id}/export`);
    expect(response.headers()["content-disposition"]).toBe(
      'attachment; filename="bastide-torrefacteur.html"',
    );
    expect(await response.text()).toContain("<title>Bastide Torréfacteur</title>");
  });
});

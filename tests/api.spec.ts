import { expect, test } from "@playwright/test";

/**
 * Les chemins d'erreur de `/api/generate`.
 *
 * Ce sont les seuls chemins testables sans clé API — et ce sont ceux qui
 * comptent : un générateur qui échoue en silence est pire qu'un générateur qui
 * échoue. Le chemin nominal exige un vrai appel de modèle et n'est donc pas
 * couvert ici.
 *
 * Ces tests ne dépendent pas du navigateur ; un seul projet suffit.
 */
test.describe("POST /api/generate", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "tests au niveau requête, inutile de les rejouer par navigateur",
  );

  test("rejette un corps illisible", async ({ request }) => {
    // `data` en string serait sérialisé en JSON valide par Playwright : il
    // faut des octets bruts pour que `request.json()` échoue vraiment.
    const response = await request.post("/api/generate", {
      headers: { "Content-Type": "application/json" },
      data: Buffer.from("{ceci n'est pas du json"),
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("illisible");
  });

  test("rejette un payload sans champ brief", async ({ request }) => {
    const response = await request.post("/api/generate", {
      data: { autre: "chose" },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("brief");
  });

  test("rejette un brief trop court", async ({ request }) => {
    const response = await request.post("/api/generate", {
      data: { brief: "court" },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("trop court");
  });

  test("rejette un brief trop long", async ({ request }) => {
    const response = await request.post("/api/generate", {
      data: { brief: "a".repeat(2001) },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain("dépasse");
  });

  test("signale explicitement l'absence de clé API", async ({ request }) => {
    test.skip(
      Boolean(process.env.ANTHROPIC_API_KEY),
      "une clé est configurée : ce chemin n'est pas atteignable",
    );

    const response = await request.post("/api/generate", {
      data: { brief: "Une torréfaction artisanale à Bordeaux qui forme des baristas." },
    });

    expect(response.status()).toBe(503);
    expect((await response.json()).error).toContain("ANTHROPIC_API_KEY");
  });
});

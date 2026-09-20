import type { Page } from "@playwright/test";

/**
 * Coupe les requêtes vers Google Fonts.
 *
 * Les tests ne doivent pas dépendre d'un CDN tiers : sa latence, sa
 * disponibilité et les proxys d'entreprise décideraient du résultat à la place
 * du code. Les polices n'influent sur aucune assertion ici — seule la mise en
 * page est vérifiée.
 */
export async function blockWebFonts(page: Page) {
  // `route.abort()` produirait lui-même une erreur console (ERR_FAILED) et
  // ferait échouer les tests qui vérifient l'absence d'erreurs. On répond donc
  // une feuille de style vide.
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }),
  );
  await page.route("https://fonts.gstatic.com/**", (route) =>
    route.fulfill({ status: 200, body: "" }),
  );
}

/**
 * Collecte les erreurs console et les exceptions non rattrapées.
 *
 * À installer avant la navigation : les erreurs émises pendant le chargement
 * initial sont les plus intéressantes et arrivent avant tout `await` de test.
 */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

/** Nombre de pixels dont le document dépasse la largeur du viewport. */
export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}

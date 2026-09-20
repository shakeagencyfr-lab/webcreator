import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Un spec minimal mais réaliste, utilisé par les tests de persistance.
 *
 * Volontairement distinct du spec de démonstration : si un test passe parce
 * qu'il lit `/exemple` au lieu du site créé, l'écart de contenu le révèle.
 */
export const MINIMAL_SPEC = {
  name: "Torréfaction Bastide",
  tagline: "Café de spécialité à Bordeaux",
  lang: "fr",
  theme: {
    fontPairing: "technical",
    radius: "none",
    density: "compact",
    colors: {
      bg: "#0F1412",
      surface: "#161D1A",
      text: "#E7EFEA",
      muted: "#93A79C",
      border: "#26302B",
      primary: "#7FD1AE",
      primaryText: "#0F1412",
      accent: "#7FD1AE",
    },
  },
  sections: [
    {
      type: "header",
      brand: "Bastide",
      links: [{ label: "Cafés", href: "#cafes" }],
      cta: { label: "Commander", href: "#commander" },
    },
    {
      type: "hero",
      title: "Torréfié le mardi, chez vous le jeudi.",
      subtitle: "Micro-lots de café de spécialité, torréfiés à Bordeaux.",
      primaryCta: { label: "Commander", href: "#commander" },
      secondaryCta: null,
    },
    {
      type: "faq",
      title: "Questions",
      items: [
        {
          question: "Livrez-vous en point relais ?",
          answer: "Oui, partout en France sous 48 heures.",
        },
      ],
    },
    {
      type: "footer",
      brand: "Bastide",
      note: "Torréfié à Bordeaux.",
      columns: [],
    },
  ],
} as const;

/**
 * Crée un site par l'API et renvoie son identifiant.
 *
 * Chaque test crée le sien : ils tournent en parallèle sur une base partagée,
 * et un site commun les ferait interférer.
 */
export async function createSite(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/sites", {
    data: { spec: MINIMAL_SPEC },
  });

  expect(response.status(), "création du site de test").toBe(201);
  return (await response.json()).id;
}

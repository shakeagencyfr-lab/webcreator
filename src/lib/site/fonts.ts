import type { Theme } from "./schema";

/**
 * Appairages typographiques proposés au générateur.
 *
 * Le modèle choisit un identifiant dans cette liste, il n'invente pas de nom
 * de police. Deux bénéfices : on ne charge jamais une police qui n'existe pas,
 * et on n'obtient jamais le rendu « Inter par défaut » que le kit de design
 * cherche justement à éviter.
 *
 * Les polices sont chargées par une balise <link> vers Google Fonts plutôt que
 * par `next/font`, qui exige des noms statiques à la compilation : ici le choix
 * n'est connu qu'au rendu du spec. On perd l'auto-hébergement de `next/font`,
 * on gagne de pouvoir servir n'importe quel appairage sans rebuild.
 */
export type FontPairing = {
  id: Theme["fontPairing"];
  /** Étiquette lisible, pour l'UI de l'éditeur. */
  label: string;
  heading: string;
  body: string;
  /** Ce que la direction typographique communique, pour guider le modèle. */
  feel: string;
  googleHref: string;
};

const href = (families: string[]) =>
  `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;

export const FONT_PAIRINGS: Record<Theme["fontPairing"], FontPairing> = {
  editorial: {
    id: "editorial",
    label: "Éditorial",
    heading: "Fraunces",
    body: "Source Sans 3",
    feel: "magazine, chaleureux, un peu littéraire",
    googleHref: href([
      "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700",
      "Source+Sans+3:wght@400;500;600",
    ]),
  },
  geometric: {
    id: "geometric",
    label: "Géométrique",
    heading: "Poppins",
    body: "Karla",
    feel: "consumer, optimiste, rond",
    googleHref: href(["Poppins:wght@500;600;700", "Karla:wght@400;500;600"]),
  },
  "neo-grotesque": {
    id: "neo-grotesque",
    label: "Néo-grotesque",
    heading: "Space Grotesk",
    body: "IBM Plex Sans",
    feel: "produit tech, précis, contemporain",
    googleHref: href([
      "Space+Grotesk:wght@500;600;700",
      "IBM+Plex+Sans:wght@400;500;600",
    ]),
  },
  "serif-classic": {
    id: "serif-classic",
    label: "Serif classique",
    heading: "Playfair Display",
    body: "Lora",
    feel: "luxe, institutionnel, posé",
    googleHref: href([
      "Playfair+Display:wght@500;600;700",
      "Lora:wght@400;500;600",
    ]),
  },
  technical: {
    id: "technical",
    label: "Technique",
    heading: "JetBrains Mono",
    body: "IBM Plex Sans",
    feel: "outil de développeur, brut, sans esbroufe",
    googleHref: href([
      "JetBrains+Mono:wght@500;700",
      "IBM+Plex+Sans:wght@400;500;600",
    ]),
  },
  humanist: {
    id: "humanist",
    label: "Humaniste",
    heading: "Outfit",
    body: "Work Sans",
    feel: "B2B moderne, net, neutre sans être fade",
    googleHref: href(["Outfit:wght@500;600;700", "Work+Sans:wght@400;500;600"]),
  },
};

export const fontPairingList = Object.values(FONT_PAIRINGS);

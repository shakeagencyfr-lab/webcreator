import type { CSSProperties } from "react";
import { FONT_PAIRINGS } from "./fonts";
import type { Theme } from "./schema";

const RADIUS: Record<Theme["radius"], string> = {
  none: "0px",
  sm: "4px",
  md: "10px",
  lg: "18px",
  full: "9999px",
};

/**
 * Rythme vertical des sections. Les trois paliers sont distincts à l'œil :
 * une densité qui ne se voit pas n'est pas un réglage, c'est du bruit.
 */
const SECTION_SPACE: Record<Theme["density"], string> = {
  compact: "clamp(2rem, 4vw, 3rem)",
  regular: "clamp(3rem, 6vw, 5rem)",
  airy: "clamp(4.5rem, 9vw, 8rem)",
};

/**
 * Traduit un thème en custom properties CSS.
 *
 * Tout le rendu du site passe par ces variables : aucun composant de section
 * ne code une couleur en dur. Changer de thème ne retouche donc aucun
 * composant, et un thème invalide ne peut pas casser à moitié un rendu.
 */
export function themeToCssVars(theme: Theme): CSSProperties {
  const { colors } = theme;
  const fonts = FONT_PAIRINGS[theme.fontPairing];

  return {
    "--site-bg": colors.bg,
    "--site-surface": colors.surface,
    "--site-text": colors.text,
    "--site-muted": colors.muted,
    "--site-border": colors.border,
    "--site-primary": colors.primary,
    "--site-primary-text": colors.primaryText,
    "--site-accent": colors.accent,
    "--site-radius": RADIUS[theme.radius],
    "--site-section-space": SECTION_SPACE[theme.density],
    "--site-font-heading": `"${fonts.heading}", Georgia, serif`,
    "--site-font-body": `"${fonts.body}", system-ui, sans-serif`,
  } as CSSProperties;
}

/** Luminance relative WCAG d'une couleur hexadécimale à 6 chiffres. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

/** Ratio de contraste WCAG entre deux couleurs hexadécimales. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastIssue = {
  pair: string;
  ratio: number;
  required: number;
};

/**
 * Vérifie les paires de couleurs que le rendu met réellement en contact.
 *
 * Le modèle produit des palettes plausibles mais pas toujours lisibles ; c'est
 * le point où un générateur de sites livre le plus souvent du texte illisible.
 * Le contrôle est déterministe et tourne côté serveur, après génération.
 *
 * Le seuil est 4.5:1 (AA texte courant), sauf `muted` sur `bg` et le texte des
 * boutons, traités en 3:1 (AA texte large / éléments d'interface).
 */
export function auditContrast(theme: Theme): ContrastIssue[] {
  const c = theme.colors;
  const checks: Array<[string, string, string, number]> = [
    ["text / bg", c.text, c.bg, 4.5],
    ["text / surface", c.text, c.surface, 4.5],
    ["muted / bg", c.muted, c.bg, 3],
    ["primaryText / primary", c.primaryText, c.primary, 3],
  ];

  return checks
    .map(([pair, a, b, required]) => ({
      pair,
      ratio: Math.round(contrastRatio(a, b) * 100) / 100,
      required,
    }))
    .filter((issue) => issue.ratio < issue.required);
}

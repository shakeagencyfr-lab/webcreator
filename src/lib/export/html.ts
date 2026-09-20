import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SiteBody } from "@/components/site/SiteRenderer";
import { FONT_PAIRINGS } from "@/lib/site/fonts";
import type { SiteSpec } from "@/lib/site/schema";

/**
 * Export d'un site en un fichier HTML autonome.
 *
 * Le fichier produit s'ouvre par un double-clic et se dépose tel quel sur
 * n'importe quel hébergement : le CSS est embarqué, il n'y a ni JavaScript, ni
 * build, ni dépendance à webcreator. Seules les polices viennent de Google
 * Fonts, et le site reste lisible sans elles grâce aux piles de repli.
 *
 * Le balisage vient du même moteur de rendu que l'aperçu. Il n'y a donc pas
 * deux implémentations à garder synchronisées : ce qu'on voit est ce qu'on
 * exporte.
 */

/**
 * Feuille de style compilée par `npm run build:css`, à partir des seuls
 * composants du moteur de rendu. Voir `src/styles/site-export.css`.
 */
const CSS_PATH = join(process.cwd(), "public", "site-export.css");

let cachedCss: string | null = null;

function siteCss(): string {
  if (cachedCss !== null) return cachedCss;

  try {
    cachedCss = readFileSync(CSS_PATH, "utf8");
  } catch {
    throw new Error(
      `Feuille de style d'export introuvable (${CSS_PATH}). Lance \`npm run build:css\`.`,
    );
  }
  return cachedCss;
}

/** Échappe le texte destiné à un attribut ou à un nœud de texte HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Nom de fichier tiré du nom du site : minuscules, sans accents ni
 * ponctuation. Un `Content-Disposition` mal formé casse le téléchargement sur
 * certains navigateurs.
 */
export function exportFilename(spec: SiteSpec): string {
  const slug = spec.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${slug || "site"}.html`;
}

export async function renderSiteHtml(spec: SiteSpec): Promise<string> {
  // Import dynamique : l'App Router refuse l'import statique de
  // `react-dom/server`, pour éviter qu'un rendu serveur ne se retrouve dans un
  // composant. Ici on ne rend pas une page, on sérialise un fichier.
  const { renderToStaticMarkup } = await import("react-dom/server");

  const fonts = FONT_PAIRINGS[spec.theme.fontPairing];
  const body = renderToStaticMarkup(SiteBody({ spec }));

  return `<!doctype html>
<html lang="${escapeHtml(spec.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(spec.name)}</title>
<meta name="description" content="${escapeHtml(spec.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${escapeHtml(fonts.googleHref)}">
<style>${siteCss()}</style>
<style>
/* Le conteneur thémé porte le fond ; sans ça, la page déborde en blanc
   au-delà du contenu. */
html, body { margin: 0; min-height: 100%; background: ${spec.theme.colors.bg}; }
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

import type { Section, SiteSpec } from "./schema";

/**
 * Édition d'un SiteSpec.
 *
 * Le spec étant une structure de données, l'éditeur n'a pas besoin de neuf
 * formulaires sur mesure : il parcourt l'objet et expose chaque chaîne
 * éditable, adressée par son chemin. Ajouter un champ au schéma le rend
 * éditable sans toucher à l'éditeur.
 */

export type Path = ReadonlyArray<string | number>;

export type TextField = {
  path: Path;
  /** Clé du chemin, traduite pour l'affichage. */
  label: string;
  value: string;
  /** Rendu en zone de texte plutôt qu'en champ simple. */
  multiline: boolean;
};

/** Clés jamais éditables : discriminants, drapeaux, ou gérées ailleurs. */
const SKIPPED = new Set(["type", "highlighted", "theme", "lang"]);

/** Clés dont le contenu est long par nature. */
const LONG = new Set(["subtitle", "body", "answer", "quote", "note", "description"]);

const LABELS: Record<string, string> = {
  name: "Nom",
  tagline: "Accroche",
  brand: "Marque",
  title: "Titre",
  subtitle: "Sous-titre",
  body: "Texte",
  note: "Mention",
  label: "Libellé",
  href: "Lien",
  value: "Valeur",
  quote: "Citation",
  author: "Auteur",
  role: "Fonction",
  question: "Question",
  answer: "Réponse",
  price: "Prix",
  period: "Période",
  description: "Description",
  features: "Inclus",
};

export function labelFor(key: string | number): string {
  if (typeof key === "number") return `#${key + 1}`;
  return LABELS[key] ?? key;
}

/** Nom lisible d'un type de section, pour les titres de l'éditeur. */
export const SECTION_LABELS: Record<Section["type"], string> = {
  header: "En-tête",
  hero: "Accroche principale",
  features: "Fonctionnalités",
  stats: "Chiffres",
  testimonials: "Témoignages",
  pricing: "Tarifs",
  faq: "Questions",
  cta: "Appel à l'action",
  footer: "Pied de page",
};

function walk(node: unknown, path: Path, out: TextField[]): void {
  if (typeof node === "string") {
    const key = path[path.length - 1];
    out.push({
      path,
      label: labelFor(key),
      value: node,
      multiline: typeof key === "string" && LONG.has(key),
    });
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, [...path, index], out));
    return;
  }

  if (node !== null && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      if (SKIPPED.has(key)) continue;
      walk(child, [...path, key], out);
    }
  }
  // null, nombres et booléens ne sont pas du texte éditable.
}

/** Tous les champs texte d'une section, dans l'ordre du spec. */
export function textFieldsOf(section: Section, index: number): TextField[] {
  const out: TextField[] = [];
  walk(section, ["sections", index], out);
  return out;
}

/** Les champs texte de premier niveau : nom et accroche du site. */
export function topLevelFields(spec: SiteSpec): TextField[] {
  const out: TextField[] = [];
  walk(spec.name, ["name"], out);
  walk(spec.tagline, ["tagline"], out);
  return out;
}

/**
 * Renvoie une copie du spec avec la valeur remplacée au chemin donné.
 *
 * Immuable : React doit voir une nouvelle référence pour re-rendre l'aperçu.
 */
export function setAtPath<T>(root: T, path: Path, value: string): T {
  if (path.length === 0) return value as unknown as T;

  const copy = structuredClone(root) as Record<string | number, unknown>;
  let cursor: Record<string | number, unknown> = copy;

  for (const key of path.slice(0, -1)) {
    cursor = cursor[key] as Record<string | number, unknown>;
  }
  cursor[path[path.length - 1]] = value;

  return copy as T;
}

/** Déplace une section. Renvoie le spec inchangé si la cible est hors bornes. */
export function moveSection(spec: SiteSpec, from: number, to: number): SiteSpec {
  if (to < 0 || to >= spec.sections.length || from === to) return spec;

  const sections = [...spec.sections];
  const [moved] = sections.splice(from, 1);
  sections.splice(to, 0, moved);

  return { ...spec, sections };
}

/** Retire une section. La dernière ne peut pas l'être : le schéma en exige une. */
export function removeSection(spec: SiteSpec, index: number): SiteSpec {
  if (spec.sections.length <= 1) return spec;
  return { ...spec, sections: spec.sections.filter((_, i) => i !== index) };
}

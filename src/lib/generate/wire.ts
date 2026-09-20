import { z } from "zod";
import {
  fontPairingIds,
  type SiteSpec,
  sectionTypes,
  siteSpecSchema,
} from "@/lib/site/schema";

/**
 * Le format que le modèle remplit, et sa normalisation vers le SiteSpec strict.
 *
 * Pourquoi deux schémas plutôt qu'un :
 *
 *  - Les sorties structurées contraignent la grammaire de génération. Une union
 *    discriminée à neuf branches y est fragile ; un objet plat dont tous les
 *    champs existent toujours ne l'est pas. Le modèle remplit donc une forme
 *    unique, et c'est `normalize` qui reconstruit l'union.
 *  - Le schéma strict peut évoluer (contraintes de longueur, nouveaux champs)
 *    sans qu'on ait à renégocier la forme de sortie du modèle.
 *
 * Tous les champs sont `nullable` plutôt qu'`optional` : les sorties
 * structurées exigent des propriétés déclarées et présentes. `null` est
 * l'absence, et il est explicite.
 */

const wireLink = z.object({
  label: z.string(),
  href: z.string(),
});

const wireCta = z.object({
  label: z.string(),
  href: z.string(),
});

/**
 * Un item générique. Selon le type de section, seuls certains champs sont
 * lus : `title`/`body` pour les features, `value`/`label` pour les chiffres,
 * `quote`/`author`/`role` pour les témoignages, `question`/`answer` pour la FAQ.
 */
const wireItem = z.object({
  title: z.string().nullable(),
  body: z.string().nullable(),
  value: z.string().nullable(),
  label: z.string().nullable(),
  quote: z.string().nullable(),
  author: z.string().nullable(),
  role: z.string().nullable(),
  question: z.string().nullable(),
  answer: z.string().nullable(),
});

const wirePlan = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().nullable(),
  description: z.string().nullable(),
  features: z.array(z.string()),
  highlighted: z.boolean(),
  cta: wireCta.nullable(),
});

const wireSection = z.object({
  type: z.enum(sectionTypes),
  brand: z.string().nullable(),
  eyebrow: z.string().nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  body: z.string().nullable(),
  note: z.string().nullable(),
  links: z.array(wireLink),
  primaryCta: wireCta.nullable(),
  secondaryCta: wireCta.nullable(),
  items: z.array(wireItem),
  plans: z.array(wirePlan),
  columns: z.array(z.object({ title: z.string(), links: z.array(wireLink) })),
});

export const wireSpecSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  lang: z.string(),
  theme: z.object({
    fontPairing: z.enum(fontPairingIds),
    radius: z.enum(["none", "sm", "md", "lg", "full"]),
    density: z.enum(["compact", "regular", "airy"]),
    colors: z.object({
      bg: z.string(),
      surface: z.string(),
      text: z.string(),
      muted: z.string(),
      border: z.string(),
      primary: z.string(),
      primaryText: z.string(),
      accent: z.string(),
    }),
  }),
  sections: z.array(wireSection),
});

export type WireSpec = z.infer<typeof wireSpecSchema>;
type WireSection = z.infer<typeof wireSection>;

/** Tronque sans couper un mot en deux, pour tenir les bornes du schéma strict. */
function clamp(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

function clampOrNull(value: string | null, max: number): string | null {
  if (value === null) return null;
  const out = clamp(value, max);
  return out.length > 0 ? out : null;
}

/**
 * Reconstruit une section typée à partir de la forme plate.
 *
 * Renvoie `null` quand la section n'a pas de quoi exister — un hero sans
 * titre, une FAQ sans question. Mieux vaut une section de moins qu'une section
 * vide : le rendu reste cohérent et l'erreur est visible dans le spec.
 */
function toSection(raw: WireSection): unknown | null {
  const links = raw.links
    .filter((l) => l.label.trim() && l.href.trim())
    .map((l) => ({ label: clamp(l.label, 40), href: clamp(l.href, 200) }));

  switch (raw.type) {
    case "header": {
      const brand = clamp(raw.brand ?? raw.title ?? "", 40);
      if (!brand) return null;
      return {
        type: "header",
        brand,
        links: links.slice(0, 6),
        cta: raw.primaryCta,
      };
    }

    case "hero":
      if (!raw.title?.trim()) return null;
      return {
        type: "hero",
        eyebrow: clampOrNull(raw.eyebrow, 60),
        title: clamp(raw.title, 120),
        subtitle: clampOrNull(raw.subtitle ?? raw.body, 280),
        primaryCta: raw.primaryCta,
        secondaryCta: raw.secondaryCta,
      };

    case "features": {
      const items = raw.items
        .filter((i) => i.title?.trim() && i.body?.trim())
        .slice(0, 8)
        .map((i) => ({
          title: clamp(i.title as string, 80),
          body: clamp(i.body as string, 320),
        }));
      if (items.length < 2) return null;
      return {
        type: "features",
        title: clampOrNull(raw.title, 120),
        subtitle: clampOrNull(raw.subtitle, 280),
        items,
      };
    }

    case "stats": {
      const items = raw.items
        .filter((i) => i.value?.trim() && i.label?.trim())
        .slice(0, 4)
        .map((i) => ({
          value: clamp(i.value as string, 16),
          label: clamp(i.label as string, 60),
        }));
      if (items.length < 2) return null;
      return { type: "stats", items };
    }

    case "testimonials": {
      const items = raw.items
        .filter((i) => i.quote?.trim() && i.author?.trim())
        .slice(0, 6)
        .map((i) => ({
          quote: clamp(i.quote as string, 400),
          author: clamp(i.author as string, 60),
          role: clampOrNull(i.role, 80),
        }));
      if (items.length === 0) return null;
      return {
        type: "testimonials",
        title: clampOrNull(raw.title, 120),
        items,
      };
    }

    case "pricing": {
      const plans = raw.plans
        .filter((p) => p.name.trim() && p.price.trim() && p.features.length > 0)
        .slice(0, 4)
        .map((p) => ({
          name: clamp(p.name, 40),
          price: clamp(p.price, 20),
          period: clampOrNull(p.period, 20),
          description: clampOrNull(p.description, 160),
          features: p.features
            .filter((f) => f.trim())
            .slice(0, 10)
            .map((f) => clamp(f, 120)),
          highlighted: p.highlighted,
          cta: p.cta,
        }));
      if (plans.length === 0) return null;
      return {
        type: "pricing",
        title: clampOrNull(raw.title, 120),
        subtitle: clampOrNull(raw.subtitle, 280),
        plans,
      };
    }

    case "faq": {
      const items = raw.items
        .filter((i) => i.question?.trim() && i.answer?.trim())
        .slice(0, 10)
        .map((i) => ({
          question: clamp(i.question as string, 160),
          answer: clamp(i.answer as string, 600),
        }));
      if (items.length === 0) return null;
      return { type: "faq", title: clampOrNull(raw.title, 120), items };
    }

    case "cta":
      if (!raw.title?.trim() || !raw.primaryCta) return null;
      return {
        type: "cta",
        title: clamp(raw.title, 120),
        body: clampOrNull(raw.body ?? raw.subtitle, 280),
        cta: raw.primaryCta,
      };

    case "footer": {
      const brand = clamp(raw.brand ?? raw.title ?? "", 40);
      if (!brand) return null;
      return {
        type: "footer",
        brand,
        note: clampOrNull(raw.note ?? raw.body, 160),
        columns: raw.columns
          .filter((c) => c.title.trim() && c.links.length > 0)
          .slice(0, 4)
          .map((c) => ({
            title: clamp(c.title, 40),
            links: c.links
              .filter((l) => l.label.trim() && l.href.trim())
              .slice(0, 6)
              .map((l) => ({
                label: clamp(l.label, 40),
                href: clamp(l.href, 200),
              })),
          }))
          .filter((c) => c.links.length > 0),
      };
    }
  }
}

/**
 * Normalise une sortie du modèle en SiteSpec valide.
 *
 * Lève si le résultat ne passe pas le schéma strict : mieux vaut une erreur
 * franche côté serveur qu'un spec à moitié valide qui casse au rendu.
 */
export function normalize(wire: WireSpec): SiteSpec {
  const sections = wire.sections
    .map(toSection)
    .filter((section): section is object => section !== null);

  return siteSpecSchema.parse({
    name: clamp(wire.name, 60),
    tagline: clamp(wire.tagline, 160),
    lang: wire.lang.slice(0, 5),
    theme: wire.theme,
    sections,
  });
}

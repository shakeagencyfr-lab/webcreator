import { z } from "zod";

/**
 * Le contrat interne d'un site généré.
 *
 * Le générateur ne produit jamais de code : il produit un SiteSpec, que le
 * renderer transforme en React. Trois raisons à ce choix :
 *   - on peut re-rendre, éditer et differ un spec ; du JSX généré, non ;
 *     un changement de thème ne redemande rien au modèle ;
 *   - rien d'exécutable ne vient du modèle, donc pas de surface d'injection ;
 *   - le rendu reste cohérent : toutes les sections passent par les mêmes
 *     composants et les mêmes tokens.
 *
 * Ce schéma est strict volontairement. Le format que le modèle remplit est
 * plus permissif et vit dans `src/lib/generate/wire.ts`, qui le normalise
 * vers celui-ci.
 */

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "couleur hexadécimale à 6 chiffres attendue");

export const linkSchema = z.object({
  label: z.string().min(1).max(40),
  href: z.string().min(1).max(200),
});

export const ctaSchema = z.object({
  label: z.string().min(1).max(40),
  href: z.string().min(1).max(200),
});

/** Identifiants des appairages typographiques (voir `fonts.ts`). */
export const fontPairingIds = [
  "editorial",
  "geometric",
  "neo-grotesque",
  "serif-classic",
  "technical",
  "humanist",
] as const;

export const themeSchema = z.object({
  fontPairing: z.enum(fontPairingIds),
  /** Rayon de bordure de base. `none` est un vrai choix de direction, pas un défaut. */
  radius: z.enum(["none", "sm", "md", "lg", "full"]),
  /** Pilote l'échelle d'espacement verticale des sections. */
  density: z.enum(["compact", "regular", "airy"]),
  colors: z.object({
    bg: hex,
    surface: hex,
    text: hex,
    muted: hex,
    border: hex,
    primary: hex,
    /** Texte posé sur `primary` — doit contraster avec lui, pas avec `bg`. */
    primaryText: hex,
    accent: hex,
  }),
});

export type Theme = z.infer<typeof themeSchema>;

const headerSchema = z.object({
  type: z.literal("header"),
  brand: z.string().min(1).max(40),
  links: z.array(linkSchema).max(6),
  cta: ctaSchema.nullable(),
});

const heroSchema = z.object({
  type: z.literal("hero"),
  eyebrow: z.string().max(60).nullable(),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(280).nullable(),
  primaryCta: ctaSchema.nullable(),
  secondaryCta: ctaSchema.nullable(),
});

const featuresSchema = z.object({
  type: z.literal("features"),
  title: z.string().max(120).nullable(),
  subtitle: z.string().max(280).nullable(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        body: z.string().min(1).max(320),
      }),
    )
    .min(2)
    .max(8),
});

const statsSchema = z.object({
  type: z.literal("stats"),
  items: z
    .array(
      z.object({
        value: z.string().min(1).max(16),
        label: z.string().min(1).max(60),
      }),
    )
    .min(2)
    .max(4),
});

const testimonialsSchema = z.object({
  type: z.literal("testimonials"),
  title: z.string().max(120).nullable(),
  items: z
    .array(
      z.object({
        quote: z.string().min(1).max(400),
        author: z.string().min(1).max(60),
        role: z.string().max(80).nullable(),
      }),
    )
    .min(1)
    .max(6),
});

const pricingSchema = z.object({
  type: z.literal("pricing"),
  title: z.string().max(120).nullable(),
  subtitle: z.string().max(280).nullable(),
  plans: z
    .array(
      z.object({
        name: z.string().min(1).max(40),
        price: z.string().min(1).max(20),
        period: z.string().max(20).nullable(),
        description: z.string().max(160).nullable(),
        features: z.array(z.string().min(1).max(120)).min(1).max(10),
        highlighted: z.boolean(),
        cta: ctaSchema.nullable(),
      }),
    )
    .min(1)
    .max(4),
});

const faqSchema = z.object({
  type: z.literal("faq"),
  title: z.string().max(120).nullable(),
  items: z
    .array(
      z.object({
        question: z.string().min(1).max(160),
        answer: z.string().min(1).max(600),
      }),
    )
    .min(1)
    .max(10),
});

const ctaSectionSchema = z.object({
  type: z.literal("cta"),
  title: z.string().min(1).max(120),
  body: z.string().max(280).nullable(),
  cta: ctaSchema,
});

const footerSchema = z.object({
  type: z.literal("footer"),
  brand: z.string().min(1).max(40),
  note: z.string().max(160).nullable(),
  columns: z
    .array(
      z.object({
        title: z.string().min(1).max(40),
        links: z.array(linkSchema).min(1).max(6),
      }),
    )
    .max(4),
});

export const sectionSchema = z.discriminatedUnion("type", [
  headerSchema,
  heroSchema,
  featuresSchema,
  statsSchema,
  testimonialsSchema,
  pricingSchema,
  faqSchema,
  ctaSectionSchema,
  footerSchema,
]);

export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];

export const sectionTypes = [
  "header",
  "hero",
  "features",
  "stats",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "footer",
] as const satisfies readonly SectionType[];

export const siteSpecSchema = z.object({
  name: z.string().min(1).max(60),
  tagline: z.string().max(160),
  /** Code de langue BCP 47, posé sur <html lang> du site rendu. */
  lang: z.string().min(2).max(5),
  theme: themeSchema,
  sections: z.array(sectionSchema).min(1).max(12),
});

export type SiteSpec = z.infer<typeof siteSpecSchema>;

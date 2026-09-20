import type { z } from "zod";
import type { ctaSchema, linkSchema, sectionSchema } from "./schema";

/**
 * Types dérivés du schéma, pour que les composants n'aient pas à importer
 * Zod. Le schéma reste la seule source de vérité.
 */

export type Cta = z.infer<typeof ctaSchema>;
export type Link = z.infer<typeof linkSchema>;

type AnySection = z.infer<typeof sectionSchema>;

/** Extrait le type d'une section par son discriminant : `SectionOf<"hero">`. */
export type SectionOf<T extends AnySection["type"]> = Extract<
  AnySection,
  { type: T }
>;

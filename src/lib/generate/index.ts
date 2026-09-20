import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { SiteSpec } from "@/lib/site/schema";
import { auditContrast } from "@/lib/site/theme";
import { MAX_BRIEF_LENGTH, MIN_BRIEF_LENGTH } from "./limits";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { normalize, wireSpecSchema } from "./wire";

/**
 * Génération d'un SiteSpec à partir d'un brief.
 *
 * Le modèle répond en sortie structurée contrainte par `wireSpecSchema`, puis
 * le résultat est normalisé vers le schéma strict et audité en contraste. Trois
 * filtres successifs : la grammaire de génération, le schéma, l'accessibilité.
 */

export class GenerationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

export function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateSite(brief: string): Promise<SiteSpec> {
  const trimmed = brief.trim();

  if (trimmed.length < MIN_BRIEF_LENGTH) {
    throw new GenerationError("Le brief est trop court.", 400);
  }
  if (trimmed.length > MAX_BRIEF_LENGTH) {
    throw new GenerationError(
      `Le brief dépasse ${MAX_BRIEF_LENGTH} caractères.`,
      400,
    );
  }
  if (!isConfigured()) {
    throw new GenerationError("ANTHROPIC_API_KEY n'est pas configurée.", 503);
  }

  const client = new Anthropic();

  let response;
  try {
    response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(trimmed) }],
      output_config: { format: zodOutputFormat(wireSpecSchema) },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new GenerationError("Trop de requêtes, réessaie dans un instant.", 429);
    }
    if (error instanceof Anthropic.AuthenticationError) {
      throw new GenerationError("Clé API refusée.", 502);
    }
    if (error instanceof Anthropic.APIError) {
      throw new GenerationError(`Erreur API (${error.status}).`, 502);
    }
    throw error;
  }

  // Le modèle peut décliner : `content` ne porte alors pas de réponse utile.
  if (response.stop_reason === "refusal") {
    throw new GenerationError("Le modèle a refusé ce brief.", 422);
  }
  if (response.stop_reason === "max_tokens") {
    throw new GenerationError(
      "Réponse tronquée : réduis la portée du brief.",
      502,
    );
  }
  if (!response.parsed_output) {
    throw new GenerationError("Réponse du modèle illisible.", 502);
  }

  let spec: SiteSpec;
  try {
    spec = normalize(response.parsed_output);
  } catch {
    throw new GenerationError(
      "Le site produit ne respecte pas le schéma attendu.",
      502,
    );
  }

  const issues = auditContrast(spec.theme);
  if (issues.length > 0) {
    const detail = issues
      .map((i) => `${i.pair} à ${i.ratio}:1 (minimum ${i.required}:1)`)
      .join(", ");
    throw new GenerationError(`Palette illisible — ${detail}.`, 422);
  }

  return spec;
}

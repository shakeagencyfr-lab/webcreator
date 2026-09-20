import { siteSpecSchema } from "@/lib/site/schema";
import { createSite, listSites } from "@/lib/store/sites";

/**
 * GET /api/sites — la liste
 * POST /api/sites — { spec } → { id, spec }
 *
 * POST crée un site à partir d'un spec déjà écrit, sans appel de modèle :
 * c'est le chemin d'import, de duplication, et celui qu'empruntent les tests
 * pour exercer le stockage sans dépendre d'une génération.
 *
 * Aucune authentification à ce stade : tout le monde peut lire, créer et
 * modifier n'importe quel site. C'est acceptable en local, pas en ligne — le
 * README le dit.
 */

export async function GET() {
  const sites = listSites();

  return Response.json({
    sites: sites.map((site) => ({
      id: site.id,
      name: site.spec.name,
      tagline: site.spec.tagline,
      updatedAt: site.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête illisible." }, { status: 400 });
  }

  const parsed = siteSpecSchema.safeParse(
    typeof payload === "object" && payload !== null && "spec" in payload
      ? payload.spec
      : null,
  );

  if (!parsed.success) {
    return Response.json(
      {
        error: "Le spec envoyé est invalide.",
        details: parsed.error.issues.slice(0, 3).map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const site = createSite(parsed.data);
  return Response.json({ id: site.id, spec: site.spec }, { status: 201 });
}

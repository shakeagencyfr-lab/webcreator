import { siteSpecSchema } from "@/lib/site/schema";
import { auditContrast } from "@/lib/site/theme";
import { deleteSite, getSite, updateSite } from "@/lib/store/sites";

/**
 * GET / PUT / DELETE /api/sites/[id]
 *
 * Sur PUT, le spec est revalidé intégralement : il arrive du client, et rien
 * de ce qui vient du client n'est digne de confiance — même produit par notre
 * propre éditeur.
 *
 * L'audit de contraste, lui, n'est ici qu'un avertissement. Il rejette la
 * sortie du modèle, qui est une machine tenue de respecter la consigne ; il
 * n'a pas à rejeter la décision d'une personne qui édite sciemment son site.
 * Les problèmes sont renvoyés à côté du spec enregistré.
 */

export async function GET(
  _request: Request,
  context: RouteContext<"/api/sites/[id]">,
) {
  const { id } = await context.params;
  const site = getSite(id);

  if (!site) {
    return Response.json({ error: "Site introuvable." }, { status: 404 });
  }

  return Response.json({ id: site.id, spec: site.spec });
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/sites/[id]">,
) {
  const { id } = await context.params;

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
        // Les trois premiers problèmes suffisent à corriger ; la liste
        // complète d'un gros spec noierait le message.
        details: parsed.error.issues.slice(0, 3).map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  const site = updateSite(id, parsed.data);
  if (!site) {
    return Response.json({ error: "Site introuvable." }, { status: 404 });
  }

  return Response.json({
    id: site.id,
    spec: site.spec,
    contrastIssues: auditContrast(site.spec.theme),
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/sites/[id]">,
) {
  const { id } = await context.params;

  if (!deleteSite(id)) {
    return Response.json({ error: "Site introuvable." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

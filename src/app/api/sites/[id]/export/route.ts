import { exportFilename, renderSiteHtml } from "@/lib/export/html";
import { getSite } from "@/lib/store/sites";

/**
 * GET /api/sites/[id]/export — le site en un fichier HTML autonome.
 *
 * `?inline=1` l'affiche dans l'onglet au lieu de le télécharger, ce qui permet
 * de vérifier l'export sans quitter le navigateur.
 */
export async function GET(
  request: Request,
  context: RouteContext<"/api/sites/[id]/export">,
) {
  const { id } = await context.params;
  const site = getSite(id);

  if (!site) {
    return Response.json({ error: "Site introuvable." }, { status: 404 });
  }

  const inline = new URL(request.url).searchParams.get("inline") === "1";

  let html: string;
  try {
    html = await renderSiteHtml(site.spec);
  } catch (error) {
    // Typiquement : la feuille de style d'export n'a pas été compilée.
    console.error("[export] rendu impossible", error);
    return Response.json(
      { error: "L'export n'a pas pu être produit." },
      { status: 500 },
    );
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": inline
        ? "inline"
        : `attachment; filename="${exportFilename(site.spec)}"`,
      // Le spec change à chaque sauvegarde : un export mis en cache serait
      // périmé dès la modification suivante.
      "Cache-Control": "no-store",
    },
  });
}

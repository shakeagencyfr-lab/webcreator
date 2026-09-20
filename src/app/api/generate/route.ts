import { GenerationError, generateSite } from "@/lib/generate";
import { createSite } from "@/lib/store/sites";

/**
 * POST /api/generate — { brief: string } → { id, spec }
 *
 * Le spec est persisté avant d'être renvoyé : une génération coûte un appel de
 * modèle, la perdre au rechargement de l'onglet serait la payer deux fois.
 * L'identifiant renvoyé est l'URL durable du site.
 *
 * La génération appelle un modèle et n'est jamais mise en cache : elle vit
 * dans un Route Handler POST, que Next ne met pas en cache par défaut.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête illisible." }, { status: 400 });
  }

  const brief =
    typeof payload === "object" &&
    payload !== null &&
    "brief" in payload &&
    typeof payload.brief === "string"
      ? payload.brief
      : null;

  if (brief === null) {
    return Response.json(
      { error: "Champ `brief` manquant ou invalide." },
      { status: 400 },
    );
  }

  try {
    const spec = await generateSite(brief);
    const site = createSite(spec);
    return Response.json({ id: site.id, spec: site.spec }, { status: 201 });
  } catch (error) {
    if (error instanceof GenerationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    // Rien de l'erreur interne ne remonte au client : elle peut contenir des
    // détails d'infrastructure.
    console.error("[generate] erreur inattendue", error);
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}

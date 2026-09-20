import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { getSite } from "@/lib/store/sites";

/**
 * Le site généré, seul.
 *
 * Aucun élément d'interface de webcreator n'est posé par-dessus : c'est
 * l'URL qu'on montre à quelqu'un. L'édition vit sur `/site/[id]/editer`.
 */

export async function generateMetadata(
  props: PageProps<"/site/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const site = getSite(id);

  if (!site) return { title: "Site introuvable" };

  return {
    title: site.spec.name,
    description: site.spec.tagline,
  };
}

export default async function SitePage(props: PageProps<"/site/[id]">) {
  const { id } = await props.params;
  const site = getSite(id);

  if (!site) notFound();

  return <SiteRenderer spec={site.spec} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/store/sites";
import { Editor } from "./editor";

export async function generateMetadata(
  props: PageProps<"/site/[id]/editer">,
): Promise<Metadata> {
  const { id } = await props.params;
  const site = getSite(id);

  return { title: site ? `Édition — ${site.spec.name}` : "Site introuvable" };
}

/**
 * Le spec est chargé côté serveur et passé à l'éditeur comme état initial.
 * Aucune requête au montage : la première image est déjà la bonne.
 */
export default async function EditorPage(props: PageProps<"/site/[id]/editer">) {
  const { id } = await props.params;
  const site = getSite(id);

  if (!site) notFound();

  return <Editor id={site.id} initialSpec={site.spec} />;
}

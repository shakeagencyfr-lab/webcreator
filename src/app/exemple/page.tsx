import type { Metadata } from "next";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { sampleSpec } from "@/lib/site/sample";

export const metadata: Metadata = {
  title: "Exemple — webcreator",
  description: "Le moteur de rendu appliqué au spec de démonstration.",
};

/**
 * Rend le spec de démonstration, sans appel de modèle.
 *
 * C'est le point de contrôle du moteur de rendu : il s'ouvre sans clé API et
 * exerce les neuf types de section.
 */
export default function ExemplePage() {
  return <SiteRenderer spec={sampleSpec} />;
}

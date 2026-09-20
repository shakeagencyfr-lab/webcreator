import { FONT_PAIRINGS } from "@/lib/site/fonts";
import type { Section, SiteSpec } from "@/lib/site/schema";
import { themeToCssVars } from "@/lib/site/theme";
import {
  CallToAction,
  Faq,
  Features,
  Footer,
  Header,
  Hero,
  Pricing,
  Stats,
  Testimonials,
} from "./sections";

/**
 * Transforme un SiteSpec en arbre React.
 *
 * C'est la seule frontière entre les données produites par le générateur et
 * l'écran. Rien n'est évalué, rien n'est injecté en HTML brut : une section
 * d'un type inconnu ne peut pas exister, le `switch` est exhaustif et
 * TypeScript le vérifie via `never`.
 */
function renderSection(section: Section, index: number) {
  const key = `${section.type}-${index}`;

  switch (section.type) {
    case "header":
      return <Header key={key} section={section} />;
    case "hero":
      return <Hero key={key} section={section} />;
    case "features":
      return <Features key={key} section={section} />;
    case "stats":
      return <Stats key={key} section={section} />;
    case "testimonials":
      return <Testimonials key={key} section={section} />;
    case "pricing":
      return <Pricing key={key} section={section} />;
    case "faq":
      return <Faq key={key} section={section} />;
    case "cta":
      return <CallToAction key={key} section={section} />;
    case "footer":
      return <Footer key={key} section={section} />;
    default: {
      const unreachable: never = section;
      return unreachable;
    }
  }
}

export function SiteRenderer({ spec }: { spec: SiteSpec }) {
  const fonts = FONT_PAIRINGS[spec.theme.fontPairing];

  return (
    <>
      {/*
        Les polices du site généré sont chargées ici et non via `next/font` :
        l'appairage n'est connu qu'au rendu du spec. `preconnect` limite la
        latence du premier rendu.
      */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={fonts.googleHref} />

      <div
        lang={spec.lang}
        style={themeToCssVars(spec.theme)}
        className="min-h-full bg-[var(--site-bg)] font-[family-name:var(--site-font-body)] text-[var(--site-text)] antialiased [&_::selection]:bg-[var(--site-accent)] [&_::selection]:text-[var(--site-bg)]"
      >
        {spec.sections.map(renderSection)}
      </div>
    </>
  );
}

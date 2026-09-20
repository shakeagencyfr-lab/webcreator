import type { SectionOf } from "@/lib/site/types";
import {
  Button,
  Container,
  Eyebrow,
  Heading,
  Lede,
  SectionShell,
} from "./primitives";

/**
 * Un composant par type de section du SiteSpec.
 *
 * Chaque composant reçoit exactement sa variante du schéma : le typage du
 * discriminant garantit qu'aucune section ne peut être rendue avec les données
 * d'une autre.
 */

export function Header({ section }: { section: SectionOf<"header"> }) {
  return (
    <header className="border-b border-[var(--site-border)]">
      <Container className="flex min-h-16 flex-wrap items-center gap-x-8 gap-y-3 py-4">
        <a
          href="#"
          className="font-[family-name:var(--site-font-heading)] text-lg font-semibold text-[var(--site-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--site-accent)]"
        >
          {section.brand}
        </a>

        {section.links.length > 0 && (
          <nav aria-label="Navigation principale" className="contents">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {section.links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-[var(--site-muted)] transition-opacity duration-[140ms] ease-out hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--site-accent)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {section.cta && (
          <div className="ms-auto">
            <Button cta={section.cta} />
          </div>
        )}
      </Container>
    </header>
  );
}

export function Hero({ section }: { section: SectionOf<"hero"> }) {
  return (
    <SectionShell>
      {section.eyebrow && <Eyebrow>{section.eyebrow}</Eyebrow>}
      <Heading level={1}>{section.title}</Heading>
      {section.subtitle && <Lede>{section.subtitle}</Lede>}

      {(section.primaryCta || section.secondaryCta) && (
        <div className="mt-9 flex flex-wrap gap-3">
          {section.primaryCta && <Button cta={section.primaryCta} />}
          {section.secondaryCta && (
            <Button cta={section.secondaryCta} variant="secondary" />
          )}
        </div>
      )}
    </SectionShell>
  );
}

export function Features({ section }: { section: SectionOf<"features"> }) {
  return (
    <SectionShell surface>
      {section.title && <Heading>{section.title}</Heading>}
      {section.subtitle && <Lede>{section.subtitle}</Lede>}

      <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {section.items.map((item) => (
          <li key={item.title}>
            {/* Un filet plutôt qu'une carte : pas de carte dans une carte. */}
            <div className="border-t-2 border-[var(--site-accent)] pt-5">
              <Heading level={3}>{item.title}</Heading>
              <p className="mt-3 max-w-[48ch] leading-relaxed text-[var(--site-muted)]">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function Stats({ section }: { section: SectionOf<"stats"> }) {
  return (
    <SectionShell>
      <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {section.items.map((item) => (
          <div key={item.label}>
            <dt className="sr-only">{item.label}</dt>
            <dd>
              <span className="block font-[family-name:var(--site-font-heading)] text-[clamp(2.5rem,6vw,3.75rem)] leading-none font-semibold text-[var(--site-text)]">
                {item.value}
              </span>
              <span
                aria-hidden="true"
                className="mt-3 block text-sm leading-snug text-[var(--site-muted)]"
              >
                {item.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}

export function Testimonials({
  section,
}: {
  section: SectionOf<"testimonials">;
}) {
  return (
    <SectionShell surface>
      {section.title && <Heading>{section.title}</Heading>}

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {section.items.map((item) => (
          <figure key={item.author} className="flex flex-col gap-5">
            <blockquote className="font-[family-name:var(--site-font-heading)] text-[clamp(1.15rem,2.2vw,1.5rem)] leading-snug text-balance text-[var(--site-text)]">
              {item.quote}
            </blockquote>
            <figcaption className="text-sm text-[var(--site-muted)]">
              <span className="font-semibold text-[var(--site-text)]">
                {item.author}
              </span>
              {item.role && <span> — {item.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}

export function Pricing({ section }: { section: SectionOf<"pricing"> }) {
  return (
    <SectionShell>
      {section.title && <Heading>{section.title}</Heading>}
      {section.subtitle && <Lede>{section.subtitle}</Lede>}

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.plans.map((plan) => (
          <li
            key={plan.name}
            className={`flex flex-col rounded-[var(--site-radius)] border p-7 ${
              plan.highlighted
                ? "border-[var(--site-primary)] border-2"
                : "border-[var(--site-border)]"
            }`}
          >
            <h3 className="font-[family-name:var(--site-font-heading)] text-lg font-semibold text-[var(--site-text)]">
              {plan.name}
            </h3>

            <p className="mt-4 flex items-baseline gap-1.5">
              {/*
                Le prix peut être « 29 € » comme « Sur devis » : la taille
                s'adapte pour qu'un libellé long n'écrase pas la grille.
              */}
              <span className="font-[family-name:var(--site-font-heading)] text-[clamp(1.6rem,3.5vw,2.4rem)] leading-none font-semibold text-balance text-[var(--site-text)]">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-[var(--site-muted)]">
                  /{plan.period}
                </span>
              )}
            </p>

            {plan.description && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--site-muted)]">
                {plan.description}
              </p>
            )}

            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-[var(--site-text)]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--site-accent)]"
                  />
                  {feature}
                </li>
              ))}
            </ul>

            {plan.cta && (
              <div className="mt-7 pt-1">
                <Button
                  cta={plan.cta}
                  variant={plan.highlighted ? "primary" : "secondary"}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

export function Faq({ section }: { section: SectionOf<"faq"> }) {
  return (
    <SectionShell surface>
      {section.title && <Heading>{section.title}</Heading>}

      <div className="mt-10 max-w-[70ch]">
        {section.items.map((item) => (
          // <details> natif : ouverture au clavier et lisible sans JavaScript.
          <details
            key={item.question}
            className="group border-b border-[var(--site-border)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium text-[var(--site-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-accent)]">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-[var(--site-accent)] transition-transform duration-[180ms] ease-out group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-6 leading-relaxed text-[var(--site-muted)]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

export function CallToAction({ section }: { section: SectionOf<"cta"> }) {
  return (
    <SectionShell>
      <div className="flex flex-col items-start gap-7">
        <Heading>{section.title}</Heading>
        {section.body && <Lede>{section.body}</Lede>}
        <Button cta={section.cta} />
      </div>
    </SectionShell>
  );
}

export function Footer({ section }: { section: SectionOf<"footer"> }) {
  return (
    <footer className="border-t border-[var(--site-border)] py-14">
      <Container>
        <div className="flex flex-wrap justify-between gap-x-12 gap-y-10">
          <div>
            <p className="font-[family-name:var(--site-font-heading)] text-lg font-semibold text-[var(--site-text)]">
              {section.brand}
            </p>
            {section.note && (
              <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-[var(--site-muted)]">
                {section.note}
              </p>
            )}
          </div>

          {section.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--site-muted)]">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--site-text)] transition-opacity duration-[140ms] ease-out hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--site-accent)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>
    </footer>
  );
}

import type { ReactNode } from "react";
import type { Cta } from "@/lib/site/types";

/**
 * Primitives partagées par toutes les sections rendues.
 *
 * Aucune couleur, aucun rayon, aucun rythme n'est codé en dur ici : tout vient
 * des custom properties posées par `themeToCssVars`. C'est ce qui permet de
 * changer de thème sans toucher une seule section.
 */

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionShell({
  children,
  surface = false,
  className = "",
}: {
  children: ReactNode;
  /** Pose la section sur `--site-surface` au lieu de `--site-bg`. */
  surface?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`py-[var(--site-section-space)] ${
        surface ? "bg-[var(--site-surface)]" : ""
      } ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Heading({
  children,
  level = 2,
}: {
  children: ReactNode;
  level?: 1 | 2 | 3;
}) {
  const Tag = `h${level}` as const;
  const size =
    level === 1
      ? "text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] tracking-[-0.03em]"
      : level === 2
        ? "text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.02em]"
        : "text-[clamp(1.1rem,2vw,1.35rem)] leading-[1.25]";

  return (
    <Tag
      className={`font-[family-name:var(--site-font-heading)] font-semibold text-balance text-[var(--site-text)] ${size}`}
    >
      {children}
    </Tag>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 max-w-[68ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-[var(--site-muted)]">
      {children}
    </p>
  );
}

/**
 * Bouton-lien. `:active` descend à 0.97 pour que le clic se sente, et le focus
 * reste visible au clavier — deux états que les UI générées oublient presque
 * toujours.
 */
export function Button({
  cta,
  variant = "primary",
}: {
  cta: Cta;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-[var(--site-radius)] px-6 text-[0.95rem] font-semibold " +
    "transition-transform duration-[160ms] ease-out active:scale-[0.97] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-accent)]";

  const skin =
    variant === "primary"
      ? "bg-[var(--site-primary)] text-[var(--site-primary-text)]"
      : "border border-[var(--site-border)] text-[var(--site-text)]";

  return (
    <a href={cta.href} className={`${base} ${skin}`}>
      {cta.label}
    </a>
  );
}

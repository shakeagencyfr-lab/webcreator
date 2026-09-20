"use client";

import { useRef, useState } from "react";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { MAX_BRIEF_LENGTH } from "@/lib/generate/limits";
import type { SiteSpec } from "@/lib/site/schema";

type Status = "idle" | "loading" | "error";

const EXAMPLES = [
  "Un cabinet d'architecture d'intérieur à Lyon, six personnes, spécialisé dans la rénovation d'appartements haussmanniens. Ton sobre, pas de tarifs affichés.",
  "Une application mobile de covoiturage domicile-travail entre collègues d'une même zone d'activité. Trois formules d'abonnement pour les entreprises.",
  "Le portfolio d'une illustratrice indépendante qui travaille pour l'édition jeunesse. Chaleureux, coloré, une page de contact.",
];

export function Generator({ configured }: { configured: boolean }) {
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<SiteSpec | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "La génération a échoué.");
        setStatus("error");
        return;
      }

      setSpec(data.spec);
      setStatus("idle");
    } catch {
      setError("Impossible de joindre le serveur.");
      setStatus("error");
    }
  }

  if (spec) {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-app-border bg-app-surface px-5 py-3">
          <p className="text-sm text-app-muted">
            Aperçu — <span className="text-app-text">{spec.name}</span>
          </p>
          <button
            type="button"
            onClick={() => setSpec(null)}
            className="inline-flex min-h-11 items-center rounded-md border border-app-border px-4 text-sm font-medium text-app-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            Nouveau brief
          </button>
        </div>
        <SiteRenderer spec={spec} />
      </div>
    );
  }

  const loading = status === "loading";
  const tooShort = brief.trim().length < 10;

  return (
    <main className="mx-auto w-full max-w-2xl grow px-5 py-16 sm:py-24">
      <h1 className="text-[clamp(2rem,5vw,3rem)] leading-tight font-semibold text-balance">
        Décris un site. Obtiens une page.
      </h1>
      <p className="mt-5 max-w-[58ch] leading-relaxed text-app-muted">
        Le modèle écrit le contenu et choisit la direction visuelle. La mise en
        page, les états et l&apos;accessibilité sont déjà tenus par le moteur de
        rendu — c&apos;est ce qui évite le résultat « template ».
      </p>

      {!configured && (
        <p
          className="mt-8 rounded-md border border-app-border bg-app-surface p-4 text-sm leading-relaxed text-app-muted"
          role="status"
        >
          <span className="font-medium text-app-text">
            ANTHROPIC_API_KEY n&apos;est pas configurée.
          </span>{" "}
          La génération renverra une erreur. Tu peux voir le moteur de rendu à
          l&apos;œuvre sur{" "}
          <a
            href="/exemple"
            className="text-app-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            la page d&apos;exemple
          </a>
          .
        </p>
      )}

      <form onSubmit={submit} className="mt-10">
        <label
          htmlFor="brief"
          className="block text-sm font-medium text-app-text"
        >
          Le brief
        </label>
        <p className="mt-1.5 text-sm text-app-muted">
          Qui, pour qui, et ce qui doit ressortir. Plus c&apos;est spécifique,
          moins le résultat est générique.
        </p>

        <textarea
          id="brief"
          ref={textareaRef}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          maxLength={MAX_BRIEF_LENGTH}
          rows={7}
          disabled={loading}
          aria-describedby="brief-count"
          className="mt-3 w-full resize-y rounded-md border border-app-border bg-app-surface p-4 leading-relaxed text-app-text placeholder:text-app-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:opacity-60"
          placeholder="Une torréfaction artisanale à Bordeaux qui vend en ligne et forme les baristas…"
        />

        <div className="mt-2 flex items-center justify-between gap-4">
          <p id="brief-count" className="text-xs text-app-muted">
            {brief.length} / {MAX_BRIEF_LENGTH}
          </p>
          <button
            type="submit"
            disabled={loading || tooShort}
            className="inline-flex min-h-11 items-center rounded-md bg-app-accent px-6 text-sm font-semibold text-app-accent-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Génération…" : "Générer le site"}
          </button>
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-app-danger/40 bg-app-danger/10 p-4 text-sm leading-relaxed text-app-danger"
        >
          {error}
        </p>
      )}

      <section className="mt-14 border-t border-app-border pt-10">
        <h2 className="text-sm font-semibold tracking-[0.12em] uppercase text-app-muted">
          Exemples de brief
        </h2>
        <ul className="mt-5 flex flex-col gap-3">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => {
                  setBrief(example);
                  textareaRef.current?.focus();
                }}
                className="w-full rounded-md border border-app-border bg-app-surface p-4 text-left text-sm leading-relaxed text-app-muted transition-colors duration-[140ms] ease-out hover:border-app-accent/50 hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

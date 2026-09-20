import type { Metadata } from "next";
import Link from "next/link";
import { listSites } from "@/lib/store/sites";

export const metadata: Metadata = {
  title: "Mes sites — webcreator",
};

/**
 * Les sites enregistrés, du plus récemment modifié au plus ancien.
 *
 * Rendue à la requête : la liste change à chaque génération et à chaque
 * sauvegarde, une version prérendue serait fausse dès la première.
 */
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function SitesPage() {
  const sites = listSites();

  return (
    <main className="mx-auto w-full max-w-2xl grow px-5 py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.02em]">
          Mes sites
        </h1>
        <Link
          href="/"
          className="text-sm text-app-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          Nouveau brief
        </Link>
      </div>

      {sites.length === 0 ? (
        <p className="mt-10 rounded-md border border-app-border bg-app-surface p-6 leading-relaxed text-app-muted">
          Aucun site pour l&apos;instant.{" "}
          <Link
            href="/"
            className="text-app-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            Décris-en un
          </Link>{" "}
          et il apparaîtra ici.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {sites.map((site) => (
            <li
              key={site.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-md border border-app-border bg-app-surface p-4"
            >
              <div className="min-w-0 grow">
                <p className="truncate font-medium text-app-text">
                  {site.spec.name}
                </p>
                <p className="mt-1 truncate text-sm text-app-muted">
                  {site.spec.tagline}
                </p>
                <p className="mt-2 text-xs text-app-muted">
                  Modifié le {dateFormat.format(site.updatedAt)} ·{" "}
                  {site.spec.sections.length} sections
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/site/${site.id}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-app-border px-4 text-sm font-medium text-app-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
                >
                  Voir
                </Link>
                <Link
                  href={`/site/${site.id}/editer`}
                  className="inline-flex min-h-11 items-center rounded-md bg-app-accent px-4 text-sm font-semibold text-app-accent-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
                >
                  Éditer
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

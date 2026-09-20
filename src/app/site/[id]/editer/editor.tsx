"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { fontPairingList } from "@/lib/site/fonts";
import {
  SECTION_LABELS,
  type Path,
  type TextField,
  moveSection,
  removeSection,
  setAtPath,
  textFieldsOf,
  topLevelFields,
} from "@/lib/site/edit";
import type { SiteSpec, Theme } from "@/lib/site/schema";
import { auditContrast } from "@/lib/site/theme";

type SaveState =
  | { status: "clean" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "error"; message: string };

const RADII: Array<{ value: Theme["radius"]; label: string }> = [
  { value: "none", label: "Aucun" },
  { value: "sm", label: "Léger" },
  { value: "md", label: "Moyen" },
  { value: "lg", label: "Marqué" },
  { value: "full", label: "Arrondi" },
];

const DENSITIES: Array<{ value: Theme["density"]; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "regular", label: "Normal" },
  { value: "airy", label: "Aéré" },
];

const COLOR_LABELS: Array<{ key: keyof Theme["colors"]; label: string }> = [
  { key: "bg", label: "Fond" },
  { key: "surface", label: "Fond secondaire" },
  { key: "text", label: "Texte" },
  { key: "muted", label: "Texte discret" },
  { key: "border", label: "Filets" },
  { key: "primary", label: "Bouton" },
  { key: "primaryText", label: "Texte du bouton" },
  { key: "accent", label: "Accent" },
];

const inputClass =
  "w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent";

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-md border border-app-border text-app-muted " +
  "transition-transform duration-[160ms] ease-out active:scale-[0.94] " +
  "hover:text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent " +
  "disabled:cursor-not-allowed disabled:opacity-40";

export function Editor({ id, initialSpec }: { id: string; initialSpec: SiteSpec }) {
  const [spec, setSpec] = useState<SiteSpec>(initialSpec);
  const [save, setSave] = useState<SaveState>({ status: "clean" });
  const [openSection, setOpenSection] = useState<number | null>(0);

  const edit = useCallback((next: SiteSpec) => {
    setSpec(next);
    setSave({ status: "dirty" });
  }, []);

  const setField = useCallback(
    (path: Path, value: string) => edit(setAtPath(spec, path, value)),
    [edit, spec],
  );

  /*
    L'audit tourne à chaque frappe sur une couleur. Il est déterministe et ne
    lit que huit valeurs : le recalculer coûte moins que de le désynchroniser.
  */
  const contrastIssues = useMemo(() => auditContrast(spec.theme), [spec.theme]);

  async function persist() {
    setSave({ status: "saving" });
    try {
      const response = await fetch(`/api/sites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSave({
          status: "error",
          message: data.error ?? "L'enregistrement a échoué.",
        });
        return;
      }
      setSave({ status: "clean" });
    } catch {
      setSave({ status: "error", message: "Impossible de joindre le serveur." });
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-app-border bg-app-surface px-5 py-3">
        <Link
          href="/sites"
          className="text-sm text-app-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        >
          <span aria-hidden="true">←</span> Mes sites
        </Link>

        <p className="truncate text-sm font-medium text-app-text">{spec.name}</p>

        <div className="ms-auto flex items-center gap-4">
          <p
            className="text-sm text-app-muted"
            role="status"
            aria-live="polite"
          >
            {save.status === "saving" && "Enregistrement…"}
            {save.status === "dirty" && "Modifications non enregistrées"}
            {save.status === "clean" && "À jour"}
            {save.status === "error" && (
              <span className="text-app-danger">{save.message}</span>
            )}
          </p>

          <Link
            href={`/site/${id}`}
            className="inline-flex min-h-11 items-center rounded-md border border-app-border px-4 text-sm font-medium text-app-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            Voir le site
          </Link>

          {/*
            Un <a> ordinaire, pas un fetch : le navigateur sait télécharger un
            fichier, et l'export est celui du site enregistré — pas des
            modifications en cours, d'où l'avertissement quand il y en a.
          */}
          <a
            href={`/api/sites/${id}/export`}
            download
            title={
              save.status === "dirty"
                ? "L'export porte la dernière version enregistrée"
                : undefined
            }
            className="inline-flex min-h-11 items-center rounded-md border border-app-border px-4 text-sm font-medium text-app-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
          >
            Exporter
          </a>

          <button
            type="button"
            onClick={persist}
            disabled={save.status === "clean" || save.status === "saving"}
            className="inline-flex min-h-11 items-center rounded-md bg-app-accent px-5 text-sm font-semibold text-app-accent-text transition-transform duration-[160ms] ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </header>

      <div className="grid grow lg:grid-cols-[minmax(340px,420px)_1fr]">
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-app-border p-5 lg:border-e">
          <ContentPanel spec={spec} onChange={setField} />

          <ThemePanel
            theme={spec.theme}
            issues={contrastIssues}
            onChange={(theme) => edit({ ...spec, theme })}
          />

          <SectionsPanel
            spec={spec}
            openSection={openSection}
            onToggle={(index) =>
              setOpenSection((current) => (current === index ? null : index))
            }
            onChange={setField}
            onMove={(from, to) => edit(moveSection(spec, from, to))}
            onRemove={(index) => edit(removeSection(spec, index))}
          />
        </div>

        {/*
          L'aperçu se re-rend à chaque frappe, sans appel réseau ni appel de
          modèle : c'est exactement ce que le spec rend possible.
        */}
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto bg-app-bg">
          <SiteRenderer spec={spec} />
        </div>
      </div>
    </div>
  );
}

/*
  Icônes dessinées plutôt que des glyphes (↑ ↓ ×) : un caractère dépend de la
  police chargée, ne s'aligne pas optiquement et change de taille d'un système
  à l'autre.
*/
function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 ${up ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10L8 5.5l4.5 4.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/**
 * Une couleur : pastille native et valeur hexadécimale saisissable.
 *
 * Le sélecteur natif ne permet pas de coller la couleur d'une charte, et une
 * saisie partielle (« #1A2 ») n'est pas une couleur valide. D'où un brouillon
 * local : il accepte la frappe, ne remonte que les valeurs complètes, et
 * revient à la valeur retenue quand le champ perd le focus.
 */
function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? value;

  function apply(next: string) {
    setDraft(next);
    if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next.toUpperCase());
  }

  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        aria-label={`${label} — nuancier`}
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-app-border bg-app-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
      />
      <label htmlFor={`color-${name}`} className="grow text-xs text-app-muted">
        {label}
      </label>
      <input
        id={`color-${name}`}
        type="text"
        inputMode="text"
        spellCheck={false}
        value={shown}
        onChange={(event) => apply(event.target.value)}
        onBlur={() => setDraft(null)}
        className={`${inputClass} w-28 font-mono text-xs tabular-nums`}
      />
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="mb-4 text-xs font-semibold tracking-[0.12em] uppercase text-app-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldInput({
  field,
  onChange,
}: {
  field: TextField;
  onChange: (path: Path, value: string) => void;
}) {
  const id = field.path.join("-");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-app-muted">
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          id={id}
          rows={3}
          value={field.value}
          onChange={(event) => onChange(field.path, event.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={field.value}
          onChange={(event) => onChange(field.path, event.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

function ContentPanel({
  spec,
  onChange,
}: {
  spec: SiteSpec;
  onChange: (path: Path, value: string) => void;
}) {
  return (
    <Panel title="Identité">
      <div className="flex flex-col gap-4">
        {topLevelFields(spec).map((field) => (
          <FieldInput key={field.path.join(".")} field={field} onChange={onChange} />
        ))}
      </div>
    </Panel>
  );
}

function ThemePanel({
  theme,
  issues,
  onChange,
}: {
  theme: Theme;
  issues: ReturnType<typeof auditContrast>;
  onChange: (theme: Theme) => void;
}) {
  return (
    <Panel title="Direction visuelle">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="font" className="mb-1.5 block text-xs text-app-muted">
            Typographie
          </label>
          <select
            id="font"
            value={theme.fontPairing}
            onChange={(event) =>
              onChange({
                ...theme,
                fontPairing: event.target.value as Theme["fontPairing"],
              })
            }
            className={inputClass}
          >
            {fontPairingList.map((pairing) => (
              <option key={pairing.id} value={pairing.id}>
                {pairing.label} — {pairing.heading} / {pairing.body}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="radius" className="mb-1.5 block text-xs text-app-muted">
              Angles
            </label>
            <select
              id="radius"
              value={theme.radius}
              onChange={(event) =>
                onChange({ ...theme, radius: event.target.value as Theme["radius"] })
              }
              className={inputClass}
            >
              {RADII.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="density" className="mb-1.5 block text-xs text-app-muted">
              Densité
            </label>
            <select
              id="density"
              value={theme.density}
              onChange={(event) =>
                onChange({
                  ...theme,
                  density: event.target.value as Theme["density"],
                })
              }
              className={inputClass}
            >
              {DENSITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {COLOR_LABELS.map(({ key, label }) => (
            <ColorField
              key={key}
              name={key}
              label={label}
              value={theme.colors[key]}
              onChange={(next) =>
                onChange({ ...theme, colors: { ...theme.colors, [key]: next } })
              }
            />
          ))}
        </div>

        {/*
          Avertissement, pas blocage. Le modèle est tenu de respecter les
          seuils ; une personne qui édite son site décide elle-même.
        */}
        {issues.length > 0 && (
          <div
            role="status"
            className="rounded-md border border-app-danger/40 bg-app-danger/10 p-3 text-xs leading-relaxed text-app-danger"
          >
            <p className="font-semibold">Contraste insuffisant</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {issues.map((issue) => (
                <li key={issue.pair}>
                  {issue.pair} : {issue.ratio}:1 (minimum {issue.required}:1)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}

function SectionsPanel({
  spec,
  openSection,
  onToggle,
  onChange,
  onMove,
  onRemove,
}: {
  spec: SiteSpec;
  openSection: number | null;
  onToggle: (index: number) => void;
  onChange: (path: Path, value: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  const last = spec.sections.length - 1;

  return (
    <Panel title={`Sections (${spec.sections.length})`}>
      <ul className="flex flex-col gap-2">
        {spec.sections.map((section, index) => {
          const open = openSection === index;

          return (
            <li
              key={`${section.type}-${index}`}
              className="rounded-md border border-app-border"
            >
              <div className="flex items-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => onToggle(index)}
                  aria-expanded={open}
                  className="grow rounded-md px-2 py-2 text-left text-sm font-medium text-app-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
                >
                  {SECTION_LABELS[section.type]}
                </button>

                <button
                  type="button"
                  onClick={() => onMove(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Monter ${SECTION_LABELS[section.type]}`}
                  className={iconButtonClass}
                >
                  <Chevron up />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, index + 1)}
                  disabled={index === last}
                  aria-label={`Descendre ${SECTION_LABELS[section.type]}`}
                  className={iconButtonClass}
                >
                  <Chevron />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  disabled={spec.sections.length <= 1}
                  aria-label={`Supprimer ${SECTION_LABELS[section.type]}`}
                  className={`${iconButtonClass} hover:text-app-danger`}
                >
                  <Cross />
                </button>
              </div>

              {open && (
                <div className="flex flex-col gap-4 border-t border-app-border p-4">
                  {textFieldsOf(section, index).map((field) => (
                    <FieldInput
                      key={field.path.join(".")}
                      field={field}
                      onChange={onChange}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

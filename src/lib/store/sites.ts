import "server-only";

import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { type SiteSpec, siteSpecSchema } from "@/lib/site/schema";

/**
 * Stockage des sites générés.
 *
 * SQLite via `node:sqlite`, intégré à Node 22 : aucune dépendance, aucun
 * service à provisionner, et le fichier se sauvegarde en le copiant.
 *
 * Limite à connaître avant de déployer : ça suppose un disque persistant et un
 * seul processus écrivain. Sur une plateforme serverless (Vercel, Netlify), le
 * système de fichiers est éphémère et ce module ne tiendra pas — c'est le seul
 * à remplacer, les appelants ne connaissent que les fonctions ci-dessous.
 *
 * Le chemin du fichier suit `WEBCREATOR_DB`, sinon `data/sites.db`.
 */

const DB_PATH = process.env.WEBCREATOR_DB ?? "data/sites.db";

export type StoredSite = {
  id: string;
  spec: SiteSpec;
  createdAt: Date;
  updatedAt: Date;
};

type Row = {
  id: string;
  spec: string;
  created_at: number;
  updated_at: number;
};

/*
  En développement, Next recharge les modules à chaud : sans ce cache, chaque
  rechargement ouvrirait une connexion de plus sur le même fichier.
*/
const globalForDb = globalThis as unknown as { __sitesDb?: DatabaseSync };

function db(): DatabaseSync {
  if (globalForDb.__sitesDb) return globalForDb.__sitesDb;

  if (DB_PATH !== ":memory:") mkdirSync(dirname(DB_PATH), { recursive: true });

  const database = new DatabaseSync(DB_PATH);
  // WAL : un lecteur ne bloque pas l'écrivain. L'aperçu et l'éditeur lisent
  // pendant qu'une sauvegarde écrit.
  database.exec("PRAGMA journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id         TEXT PRIMARY KEY,
      spec       TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  globalForDb.__sitesDb = database;
  return database;
}

/**
 * Identifiant court, lisible et non devinable.
 *
 * Il apparaît dans l'URL d'un site : un entier auto-incrémenté laisserait
 * énumérer les sites des autres. 10 caractères base32 ≈ 50 bits.
 */
function newId(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"; // sans l, o, 0, 1
  const bytes = randomBytes(10);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Relit un spec stocké.
 *
 * La validation est refaite à la lecture, pas seulement à l'écriture : le
 * schéma peut avoir changé depuis, et un spec devenu invalide doit se signaler
 * ici plutôt que de casser au rendu.
 */
function toStoredSite(row: Row): StoredSite {
  return {
    id: row.id,
    spec: siteSpecSchema.parse(JSON.parse(row.spec)),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function createSite(spec: SiteSpec): StoredSite {
  const id = newId();
  const now = Date.now();

  db()
    .prepare(
      "INSERT INTO sites (id, spec, created_at, updated_at) VALUES (?, ?, ?, ?)",
    )
    .run(id, JSON.stringify(spec), now, now);

  return { id, spec, createdAt: new Date(now), updatedAt: new Date(now) };
}

export function getSite(id: string): StoredSite | null {
  const row = db().prepare("SELECT * FROM sites WHERE id = ?").get(id) as
    | Row
    | undefined;

  return row ? toStoredSite(row) : null;
}

/** Renvoie `null` si l'identifiant n'existe pas, plutôt que de créer un site. */
export function updateSite(id: string, spec: SiteSpec): StoredSite | null {
  const now = Date.now();
  const result = db()
    .prepare("UPDATE sites SET spec = ?, updated_at = ? WHERE id = ?")
    .run(JSON.stringify(spec), now, id);

  if (result.changes === 0) return null;

  const existing = getSite(id);
  return existing;
}

export function deleteSite(id: string): boolean {
  return db().prepare("DELETE FROM sites WHERE id = ?").run(id).changes > 0;
}

export function listSites(limit = 50): StoredSite[] {
  const rows = db()
    .prepare("SELECT * FROM sites ORDER BY updated_at DESC LIMIT ?")
    .all(limit) as Row[];

  return rows.map(toStoredSite);
}

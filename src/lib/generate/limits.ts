/**
 * Bornes partagées entre le client et le serveur.
 *
 * Volontairement dans leur propre module : `@/lib/generate` importe
 * `server-only`, l'importer depuis un composant client ferait échouer la
 * compilation.
 */

/** Longueur maximale d'un brief, appliquée dans le formulaire et revalidée côté serveur. */
export const MAX_BRIEF_LENGTH = 2000;

/** Longueur minimale en deçà de laquelle un brief ne dit rien d'exploitable. */
export const MIN_BRIEF_LENGTH = 10;

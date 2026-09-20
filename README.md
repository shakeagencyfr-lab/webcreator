# webcreator

Un générateur de sites vitrines : on décrit un site en quelques phrases, on
obtient une page rendue et cohérente.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigne ANTHROPIC_API_KEY
npm run dev
```

Sans clé API, l'application démarre quand même : `/exemple` rend le spec de
démonstration et `/api/generate` répond une 503 explicite.

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production (valide aussi les types) |
| `npm run typecheck` | `tsc --noEmit` seul |
| `npm run lint` | ESLint |
| `npm test` | suite Playwright, desktop et mobile |
| `npm run test:ui` | la même en mode interactif |
| `npm run shots` | captures pleine page dans `.screenshots/` |

## L'idée centrale : le modèle ne produit pas de code

Le générateur ne demande jamais de HTML ni de CSS au modèle. Il lui demande un
**SiteSpec** : une structure de données décrivant le contenu et la direction
visuelle. Un moteur de rendu déterministe transforme ensuite ce spec en React.

```
brief ──▶ Claude ──▶ spec (JSON) ──▶ validation ──▶ SiteRenderer ──▶ page
                                      ├ schéma strict
                                      └ audit de contraste
```

Trois conséquences :

- **Pas de rendu « template ».** Les marqueurs d'une page générée — espacement
  irrégulier, états manquants, cartes imbriquées, focus invisible — sont des
  défauts de mise en page. Ici la mise en page n'est pas générée : elle est
  écrite une fois, dans `src/components/site/`. Le modèle choisit le contenu,
  la typographie, la palette et la densité ; le reste ne bouge pas.
- **Rien d'exécutable ne vient du modèle.** Aucune chaîne produite par
  l'inférence n'est évaluée ni injectée en HTML brut.
- **Un spec se modifie.** Changer de thème ou réordonner des sections ne
  redemande rien au modèle et ne coûte rien.

## Structure

```
src/
  lib/site/
    schema.ts      contrat strict du SiteSpec (Zod) — source de vérité
    types.ts       types dérivés, pour que les composants n'importent pas Zod
    theme.ts       thème → custom properties CSS, et audit de contraste WCAG
    fonts.ts       appairages typographiques proposés au modèle
    sample.ts      spec de démonstration, rendu sur /exemple
  lib/generate/
    limits.ts      bornes partagées client/serveur
    prompt.ts      prompt système : rédaction et direction, jamais de mise en page
    wire.ts        format permissif rempli par le modèle + normalisation
    index.ts       appel Claude, validation, audit  (serveur uniquement)
  components/site/
    primitives.tsx Container, SectionShell, Heading, Button…
    sections.tsx   un composant par type de section
    SiteRenderer.tsx  spec → arbre React
  app/
    page.tsx       l'outil
    generator.tsx  le formulaire (composant client)
    exemple/       rendu du spec de démonstration, sans appel de modèle
    api/generate/  POST { brief } → { spec }

tests/
  helpers.ts       neutralisation des polices distantes, collecte d'erreurs
  render.spec.ts   le moteur de rendu sur /exemple
  generator.spec.ts  l'UI de l'outil, API simulée
  api.spec.ts      les chemins d'erreur de /api/generate
  capture.spec.ts  captures pleine page, pour l'œil (`npm run shots`)
```

### Les tests

`npm test` lance la suite sur deux projets, desktop et mobile : le moteur de
rendu compose différemment aux deux tailles et la plupart des défauts
n'apparaissent que dans l'une. Playwright démarre le serveur de développement
lui-même, ou réutilise celui qui tourne déjà.

Deux choix qui gardent la suite déterministe :

- **Aucun test ne déclenche de vraie génération.** Ça coûterait un appel de
  modèle par exécution et le résultat varierait. `/api/generate` est simulé là
  où l'interface doit en faire quelque chose ; seuls ses chemins d'erreur sont
  testés en vrai, et ce sont eux qui comptent — un générateur qui échoue en
  silence est pire qu'un générateur qui échoue.
- **Les polices Google sont interceptées.** La latence d'un CDN tiers, sa
  disponibilité ou un proxy d'entreprise décideraient sinon du résultat.

Les assertions transverses sont l'absence de débordement horizontal et
l'absence d'erreur console, vérifiées sur chaque page et à chaque taille.

En local, Playwright sert le serveur de développement. En CI il sert le
**build de production** : c'est ce qui sera déployé, et certaines erreurs ne se
manifestent qu'après build.

### CI

`.github/workflows/ci.yml` enchaîne lint, types, build, puis la suite, à
chaque poussée sur `main` ou `claude/**` et sur chaque pull request. En cas
d'échec, le rapport Playwright est conservé en artefact sept jours — il porte
les captures et les traces, un log seul ne suffit pas à diagnostiquer.

### Pourquoi deux schémas

`lib/site/schema.ts` est strict : union discriminée sur le type de section,
bornes de longueur, couleurs validées. `lib/generate/wire.ts` est le format
que le modèle remplit : plat, tous les champs présents, `null` pour l'absence.
Les sorties structurées contraignent la grammaire de génération, et une union
à neuf branches y est fragile — un objet plat ne l'est pas. `normalize()`
reconstruit l'union et rejette les sections incomplètes.

### L'audit de contraste

`auditContrast()` vérifie les paires de couleurs que le rendu met réellement en
contact (texte sur fond, texte de bouton sur bouton) contre les seuils WCAG AA.
Une palette qui échoue fait échouer la génération avec une 422 : c'est le
défaut le plus courant d'un générateur de sites, et le seul contrôle
entièrement déterministe qu'on puisse lui opposer.

## Kit de design

Le dépôt embarque trois skills Claude Code dans `.claude/skills/` et deux
commandes `/design` et `/polish`. Voir [DESIGN-KIT.md](./DESIGN-KIT.md).

## État

Ce qui marche : génération, validation, rendu des neuf types de section,
aperçu, audit de contraste.

Ce qui n'existe pas encore : persistance (un spec vit dans l'état React de
l'onglet et disparaît au rechargement), édition du spec après génération,
export statique ou déploiement, multi-pages, comptes.

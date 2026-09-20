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
| `npm run build:css` | recompile la feuille de style d'export (déclenché par `dev` et `build`) |
| `npm test` | suite Playwright, desktop et mobile |
| `npm run test:ui` | la même en mode interactif |
| `npm run shots` | captures pleine page dans `.screenshots/` |

## L'idée centrale : le modèle ne produit pas de code

Le générateur ne demande jamais de HTML ni de CSS au modèle. Il lui demande un
**SiteSpec** : une structure de données décrivant le contenu et la direction
visuelle. Un moteur de rendu déterministe transforme ensuite ce spec en React.

```
brief ──▶ Claude ──▶ spec (JSON) ──▶ validation ──▶ stockage ──▶ /site/<id>
                                      ├ schéma strict          │
                                      └ audit de contraste     └▶ /site/<id>/editer
```

Trois conséquences :

- **Pas de rendu « template ».** Les marqueurs d'une page générée — espacement
  irrégulier, états manquants, cartes imbriquées, focus invisible — sont des
  défauts de mise en page. Ici la mise en page n'est pas générée : elle est
  écrite une fois, dans `src/components/site/`. Le modèle choisit le contenu,
  la typographie, la palette et la densité ; le reste ne bouge pas.
- **Rien d'exécutable ne vient du modèle.** Aucune chaîne produite par
  l'inférence n'est évaluée ni injectée en HTML brut.
- **Un spec se modifie.** Changer de thème, réécrire un titre ou réordonner
  des sections ne redemande rien au modèle et ne coûte rien. C'est ce qui rend
  l'éditeur possible : l'aperçu se recompose à chaque frappe, sans réseau.

## Structure

```
src/
  lib/site/
    schema.ts      contrat strict du SiteSpec (Zod) — source de vérité
    types.ts       types dérivés, pour que les composants n'importent pas Zod
    theme.ts       thème → custom properties CSS, et audit de contraste WCAG
    fonts.ts       appairages typographiques proposés au modèle
    sample.ts      spec de démonstration, rendu sur /exemple
    edit.ts        parcours des champs texte, déplacement et retrait de sections
  lib/store/
    sites.ts       persistance SQLite — le seul module à remplacer pour déployer
  lib/export/
    html.ts        spec → document HTML autonome
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
    page.tsx       le formulaire
    generator.tsx  sa partie client
    sites/         la liste des sites enregistrés
    site/[id]/     le site seul — l'URL qu'on partage
    site/[id]/editer/  l'éditeur : contrôles à gauche, aperçu vivant à droite
    exemple/       rendu du spec de démonstration, sans appel de modèle
    api/generate/  POST { brief } → { id, spec }
    api/sites/     GET liste · POST { spec } → { id, spec }
    api/sites/[id]/  GET · PUT { spec } · DELETE
    api/sites/[id]/export/  GET → un fichier HTML autonome

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

## Persistance et édition

Une génération coûte un appel de modèle : elle est enregistrée avant d'être
renvoyée. Chaque site a une URL durable, `/site/<id>`, qui ne montre que le
site — aucune interface de webcreator par-dessus, c'est le lien qu'on envoie.

L'éditeur (`/site/<id>/editer`) expose la direction visuelle (typographie,
angles, densité, les huit couleurs) et le contenu, avec l'aperçu à côté. Il
n'a pas neuf formulaires sur mesure : `lib/site/edit.ts` parcourt le spec et
expose chaque chaîne éditable adressée par son chemin, donc **ajouter un champ
au schéma le rend éditable sans toucher à l'éditeur**.

Deux règles qui se ressemblent mais s'opposent :

- La **sortie du modèle** est rejetée si l'audit de contraste échoue. C'est une
  machine tenue de respecter la consigne.
- L'**édition humaine** n'est qu'avertie. Le problème s'affiche en direct, la
  sauvegarde reste possible. Ce n'est pas la même chose de contraindre un
  générateur et de contraindre quelqu'un qui édite son propre site.

### Le stockage

SQLite via `node:sqlite`, intégré à Node 22 : aucune dépendance, aucun service,
et la sauvegarde consiste à copier `data/sites.db` (`WEBCREATOR_DB` pour
changer de chemin).

Deux limites à connaître **avant de mettre en ligne** :

- **Ça suppose un disque persistant.** Sur une plateforme serverless (Vercel,
  Netlify), le système de fichiers est éphémère. `lib/store/sites.ts` est le
  seul module à réécrire — les appelants ne connaissent que ses fonctions.
- **Il n'y a aucune authentification.** Qui connaît un identifiant peut lire,
  modifier et supprimer le site. Les identifiants sont non devinables (50 bits
  d'aléa), ce qui n'est pas une politique d'accès.

## L'export

`/api/sites/<id>/export` renvoie **un seul fichier HTML**, qu'on ouvre par un
double-clic ou qu'on dépose tel quel sur n'importe quel hébergement. Pas de
JavaScript, pas de build, aucune dépendance à webcreator. La seule ressource
externe est Google Fonts, et le site reste lisible sans elle grâce aux piles
de repli.

Le balisage vient du **même moteur de rendu que l'aperçu** : il n'y a pas deux
implémentations à garder synchronisées, ce qu'on voit est ce qu'on exporte.

Le CSS est le point délicat. Les composants utilisent Tailwind, et un fichier
autonome ne peut pas pointer sur le bundle de l'application. `npm run build:css`
compile `src/styles/site-export.css` — qui, via `source(none)` et un `@source`
pointé sur `src/components/site`, ne retient que les classes réellement
présentes dans le moteur de rendu. Résultat : 13 Ko, sans une ligne du CSS de
l'outil. Le script tourne automatiquement avant `dev` et avant `build`.

L'export porte la **dernière version enregistrée**, pas les modifications en
cours dans l'éditeur.

## Kit de design

Le dépôt embarque trois skills Claude Code dans `.claude/skills/` et deux
commandes `/design` et `/polish`. Voir [DESIGN-KIT.md](./DESIGN-KIT.md).

## État

Ce qui marche : génération, validation, audit de contraste, rendu des neuf
types de section, persistance, édition du contenu et de la direction visuelle,
réordonnancement et suppression de sections, export HTML autonome.

Ce qui n'existe pas encore : authentification, déploiement du site produit
(l'export se dépose à la main), multi-pages, images, ajout d'une section
absente du spec initial, annulation.

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
```

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

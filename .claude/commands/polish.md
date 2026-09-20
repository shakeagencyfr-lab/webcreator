---
description: Audit + finition d'une UI existante (taste, impeccable, motion, a11y)
argument-hint: [fichier, composant ou URL]
---

Cible : **$ARGUMENTS**

N'ajoute aucune fonctionnalité, ne touche ni au contenu ni à la logique métier.
Tu fais uniquement une passe de finition.

1. **Audit** — relève les « tells » d'UI générée : polices par défaut, gris purs,
   espacement irrégulier, contrastes faibles, états manquants, cartes imbriquées.
   Liste-les avant de corriger.
2. **Correction** — applique les règles `impeccable` (hiérarchie, espacement,
   couleur, états) et `taste` (direction visuelle assumée).
3. **Motion** — audite l'existant avec `emil-design-eng` : supprime ce qui
   n'apporte rien, corrige durées et easings, ajoute les fallbacks
   `prefers-reduced-motion`.
4. **Accessibilité** — contrastes AA minimum, focus visible, cibles tactiles
   ≥ 44px, ordre de tabulation cohérent.
5. **Contrôle navigateur** — via le MCP Playwright : screenshots desktop + mobile,
   avant/après, et vérification qu'aucune régression visuelle n'est introduite.

Rends un tableau Avant / Après / Pourquoi, classé par impact décroissant.

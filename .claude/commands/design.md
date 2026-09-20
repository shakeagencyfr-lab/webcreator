---
description: Pipeline complet — taste + impeccable + motion, puis vérification navigateur
argument-hint: [ce qu'il faut concevoir ou refaire]
---

Tu conçois l'interface suivante : **$ARGUMENTS**

Déroule ce pipeline dans l'ordre, sans sauter d'étape.

## 1. Cadrage
Lis `PRODUCT.md` et `DESIGN.md` s'ils existent (sinon, propose `/impeccable init`).
Si une maquette Figma est référencée dans ma demande ou sélectionnée dans l'app,
récupère le contexte via le MCP Figma (`get_design_context`, `get_variable_defs`)
avant d'écrire la moindre ligne. Ne devine jamais des tokens qui existent déjà.

## 2. Direction visuelle — skill `taste`
Pose la direction avant de coder : typographie (pas Inter par défaut), palette
(jamais de noir ou gris purs — toujours teintés), échelle d'espacement, densité.
Interdits : dégradé violet→bleu, cartes dans des cartes, tuile d'icône arrondie
au-dessus de chaque titre, texte gris sur fond coloré.
Annonce la direction retenue en 3 lignes, puis code.

## 3. Construction — skill `impeccable`
Implémente avec les règles impeccable : hiérarchie, contraste, états complets
(default / hover / focus / active / disabled / loading / empty / error),
focus rings visibles, navigation clavier.

## 4. Motion — skill `emil-design-eng`
Pour chaque animation, réponds d'abord à : est-elle nécessaire ? que
communique-t-elle ? Transitions UI 140–220 ms, `transform` et `opacity`
uniquement, jamais `width`/`height`/`top`/`left`, pas d'easing bounce,
fallback `prefers-reduced-motion` systématique.

## 5. Vérification — MCP Playwright
Ouvre le rendu dans le navigateur, screenshot en 1440px et en 390px,
vérifie qu'il n'y a pas de débordement horizontal, que les états focus sont
visibles et que rien ne casse en dark mode. Corrige ce que tu vois, puis
re-screenshot.

## 6. Rapport
Termine par un tableau court : Avant / Après / Pourquoi, et la liste des
décisions de design que j'ai à valider.

# Shake Design Kit — Claude Code

Skills de design + connecteurs MCP pour ce dépôt.

## Installation

Rien à installer : les trois skills sont versionnés dans `.claude/skills/` et
sont chargés au lancement de Claude Code dans ce dépôt.

Pour vérifier que le checkout est complet :

```bash
bash setup-design.sh
```

## Ce que ça contient

| Fichier | Rôle |
|---|---|
| `.claude/skills/emil-design-eng/` | skill motion & animations |
| `.claude/skills/impeccable/` | playbook UI/UX, 23 sous-commandes |
| `.claude/skills/design-taste-frontend/` | direction visuelle, anti-slop |
| `.claude/commands/design.md` | `/design` — pipeline complet de création d'UI |
| `.claude/commands/polish.md` | `/polish` — audit et finition d'une UI existante |
| `.mcp.json` | déclare les connecteurs Figma + Playwright (scope projet) |
| `setup-design.sh` | contrôle que skills, commandes et MCP sont en place |

## Les trois skills

- **emil-design-eng** — framework de décision pour le motion : faut-il animer ?
  quel easing ? quelle durée ? Règles de performance et d'accessibilité.
  Source : [emilkowalski/skill](https://github.com/emilkowalski/skill) @ `85e8e23`,
  dossier `skills/emil-design-eng`, MIT.
- **impeccable** — playbook UI/UX structuré, 23 sous-commandes, détecteurs
  d'anti-patterns. Source : [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
  @ `f2c7051`, v0.1.5, dossier `.claude/skills/impeccable`, Apache 2.0.
  Voir `NOTICE.md` dans le dossier du skill.
- **design-taste-frontend** — empêche le rendu « template » : direction
  visuelle, typographie, densité, trois curseurs (variance / motion / densité).
  Cadré landing pages, portfolios et refontes — pas les dashboards ni les
  tableaux de données. Source :
  [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ `5217fb4`,
  dossier `skills/taste-skill`, MIT.

### Mise à jour d'un skill

Ce sont des copies figées, pas des sous-modules : elles ne se mettent pas à
jour toutes seules. Pour en rafraîchir une, reprends le dossier amont indiqué
ci-dessus et remplace le contenu. Par exemple :

```bash
git clone --depth 1 https://github.com/pbakaus/impeccable /tmp/impeccable
rm -rf .claude/skills/impeccable
cp -r /tmp/impeccable/.claude/skills/impeccable .claude/skills/
```

N'installe **pas** ces skills en plus via `npx skills add`, `npx impeccable
install` ou `/plugin` : tu aurais deux copies de chacun. La copie du dépôt
fait foi.

## Les deux connecteurs

`.mcp.json` est en scope projet : au prochain lancement, Claude Code demande
ton autorisation pour les deux serveurs.

### Ce qui change entre local et distant

Ces connecteurs ne se comportent pas pareil selon l'endroit où tourne
Claude Code. Le tableau vaut mieux qu'une supposition :

| | Sur ta machine | Session distante (claude.ai/code) |
|---|---|---|
| **Figma** | `.mcp.json` pointe le serveur local de l'app desktop | `.mcp.json` ne sert à rien — rien n'écoute sur `127.0.0.1` dans le conteneur. Figma arrive par le **connecteur de compte**, indépendamment de ce dépôt |
| **Playwright** | démarre via `npx` au lancement | ne démarre pas ; un serveur MCP ne s'ajoute pas en cours de session |

**Figma.** En local, il faut que l'app desktop soit ouverte et que le serveur
MCP soit activé (Préférences → Enable local MCP server). Pour t'en servir
depuis n'importe où sans l'app desktop, remplace l'entrée par le serveur
distant, puis authentifie-toi avec `/mcp` :

```json
"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }
```

Ne fais pas les deux en même temps : tu aurais deux serveurs Figma concurrents.
Vérifie ton accès avec l'outil `whoami` — il renvoie ton siège, et un siège
**View** ne permet pas d'écrire dans un fichier Figma.

**Playwright.** Premier lancement long (téléchargement du navigateur). Si le
navigateur téléchargé ne correspond pas à celui de l'environnement — cas des
conteneurs qui en embarquent déjà un —, pointe l'exécutable explicitement :

```json
"args": ["-y", "@playwright/mcp@latest", "--headless", "--isolated",
         "--executable-path", "/opt/pw-browsers/chromium"]
```

### Vérification navigateur sans MCP

Le MCP Playwright n'est pas indispensable : le projet embarque le runner
Playwright, qui fait le contrôle que `/design` et `/polish` demandent sans
aucun connecteur.

```bash
npm test             # assertions, desktop et mobile
npm run shots        # captures pleine page dans .screenshots/
```

Playwright démarre le serveur de développement lui-même. `npm test` vérifie
notamment ce qu'une capture ne montre pas : débordement horizontal et erreurs
console, sur chaque page et à chaque taille.

Le navigateur est résolu via `PLAYWRIGHT_EXECUTABLE_PATH`, sinon le Chromium
déjà présent dans l'image, sinon celui que Playwright a téléchargé — sans ce
repli, un conteneur dont le Chromium ne correspond pas à la version attendue
échoue en réclamant `npx playwright install`.

## Premier run

```
/impeccable init          → génère PRODUCT.md et DESIGN.md
/mcp                      → vérifie quels connecteurs sont réellement actifs
/design une landing page pour Booster Commerçant Pro
/polish src/components/site/
```

## Dépannage

- **Un skill ne se déclenche pas** → `/skills` pour vérifier qu'il est chargé,
  ou relance Claude Code.
- **Figma renvoie une erreur de connexion** → app desktop fermée ou serveur MCP
  désactivé dans les préférences.
- **Playwright timeout au premier appel** → laisse-le finir le téléchargement
  du navigateur, puis relance.
- **Aucun outil Playwright dans la session** → le serveur n'a pas démarré au
  lancement, et il ne s'ajoute pas à chaud : relance Claude Code. En attendant,
  `npm run shots` fait le même contrôle.
- **Doublon de skill** → n'installe pas la copie du dépôt *et* le plugin ou la
  version npx, tu aurais deux copies du même playbook.

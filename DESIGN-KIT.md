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
ton autorisation pour les deux serveurs. Réponds oui.

**Figma** — le kit pointe sur le serveur local de l'app desktop
(`http://127.0.0.1:3845/mcp`). Il faut que Figma soit ouvert et que le serveur MCP
soit activé dans les préférences. Pour la version distante, remplace l'entrée par :

```json
"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }
```

puis authentifie-toi avec `/mcp`.

**Playwright** — se lance tout seul via `npx`, aucune installation préalable.
Premier lancement un peu long (téléchargement du navigateur).

## Premier run

```
/impeccable init          → génère PRODUCT.md et DESIGN.md
/mcp                      → vérifie que figma et playwright sont connectés
/design une landing page pour Booster Commerçant Pro
/polish app/page.tsx
```

## Dépannage

- **Un skill ne se déclenche pas** → `/skills` pour vérifier qu'il est chargé,
  ou relance Claude Code.
- **Figma renvoie une erreur de connexion** → app desktop fermée ou serveur MCP
  désactivé dans les préférences.
- **Playwright timeout au premier appel** → laisse-le finir le téléchargement
  du navigateur, puis relance.
- **Doublon de skill** → n'installe pas la copie du dépôt *et* le plugin ou la
  version npx, tu aurais deux copies du même playbook.

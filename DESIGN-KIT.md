# Shake Design Kit — Claude Code

Skills de design + connecteurs MCP pour ce dépôt.

## Installation

Deux des trois skills sont **déjà versionnés** dans `.claude/skills/` : rien à
installer pour eux, ils sont chargés au lancement de Claude Code dans ce dépôt.

Pour le troisième (`design-taste-frontend`, non versionné) :

```bash
bash setup-design.sh
```

Relance Claude Code après l'installation.

## Ce que ça contient

| Fichier | Rôle |
|---|---|
| `.claude/skills/emil-design-eng/` | skill motion & animations (versionné) |
| `.claude/skills/impeccable/` | playbook UI/UX, 23 sous-commandes (versionné) |
| `setup-design.sh` | installe design-taste-frontend et vérifie le reste |
| `.mcp.json` | déclare les connecteurs Figma + Playwright (scope projet) |
| `.claude/commands/design.md` | `/design` — pipeline complet de création d'UI |
| `.claude/commands/polish.md` | `/polish` — audit et finition d'une UI existante |

## Les trois skills

- **emil-design-eng** (versionné) — framework de décision pour le motion :
  faut-il animer ? quel easing ? quelle durée ? Règles de performance et
  d'accessibilité. Source : [emilkowalski/skill](https://github.com/emilkowalski/skill)
  @ `85e8e23`, MIT.
- **impeccable** (versionné) — playbook UI/UX structuré, 23 sous-commandes,
  détecteurs d'anti-patterns. Source :
  [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ `f2c7051`,
  v0.1.5, Apache 2.0. Voir `NOTICE.md` dans le dossier du skill.
- **design-taste-frontend** (à installer) — empêche le rendu « template » :
  direction visuelle, typographie, densité, trois curseurs
  (variance / motion / densité).

### Mise à jour d'un skill versionné

Les deux skills versionnés sont des copies figées, pas des sous-modules.
Pour les mettre à jour, reprends le dossier amont et remplace le contenu :

```bash
git clone --depth 1 https://github.com/pbakaus/impeccable /tmp/impeccable
rm -rf .claude/skills/impeccable
cp -r /tmp/impeccable/.claude/skills/impeccable .claude/skills/
```

(pour emil : `emilkowalski/skill`, dossier `skills/emil-design-eng`)

N'installe **pas** impeccable en plus via `npx impeccable install` ou
`/plugin` : tu aurais deux copies du même playbook.

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
- **Doublon impeccable** → n'installe pas le skill versionné *et* le plugin,
  tu aurais deux copies du même playbook.

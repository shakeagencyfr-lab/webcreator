# Shake Design Kit — Claude Code

Setup complet des skills de design + connecteurs MCP, en une commande.

## Installation

Dézippe le contenu **à la racine de ton projet**, puis :

```bash
bash setup-design.sh
```

Le script installe les trois skills. Le CLI te demande le scope :
choisis **global** (`~/.claude/skills/`) pour les avoir sur tous tes projets,
ou **projet** pour ce dépôt uniquement.

Relance Claude Code après l'installation.

## Ce que ça contient

| Fichier | Rôle |
|---|---|
| `setup-design.sh` | Installe emil-design-eng, impeccable, design-taste-frontend |
| `.mcp.json` | Déclare les connecteurs Figma + Playwright (scope projet) |
| `.claude/commands/design.md` | `/design` — pipeline complet de création d'UI |
| `.claude/commands/polish.md` | `/polish` — audit et finition d'une UI existante |

## Les trois skills

- **emil-design-eng** — framework de décision pour le motion : faut-il animer ?
  quel easing ? quelle durée ? Règles de performance et d'accessibilité.
- **impeccable** — playbook UI/UX structuré, 23 sous-commandes, détecteurs
  d'anti-patterns. Basé sur le skill `frontend-design` d'Anthropic, poussé plus loin.
- **design-taste-frontend** — empêche le rendu « template » : direction visuelle,
  typographie, densité, trois curseurs (variance / motion / densité).

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
- **Doublon impeccable** → n'installe pas à la fois le skill et le plugin,
  tu aurais deux copies du même playbook.

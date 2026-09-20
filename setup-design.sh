#!/usr/bin/env bash
# Shake Design Kit — installe les 3 skills de design pour Claude Code.
# Usage : bash setup-design.sh   (depuis la racine du projet)

set -u

say() { printf "\n\033[1;35m▸ %s\033[0m\n" "$1"; }
ok()  { printf "\033[0;32m  ✓ %s\033[0m\n" "$1"; }
ko()  { printf "\033[0;31m  ✗ %s\033[0m\n" "$1"; }

command -v node >/dev/null 2>&1 || { ko "Node.js est requis (v18+)"; exit 1; }

say "1/3 — emil-kowalski : motion & animations"
npx -y skills add emilkowalski/skill && ok "emil-design-eng installé" || ko "échec (relance à la main)"

say "2/3 — impeccable : playbook UI/UX (23 commandes)"
npx -y impeccable install && ok "impeccable installé" || ko "échec (alternative : /plugin marketplace add pbakaus/impeccable)"

say "3/3 — taste : anti-slop, références de design"
npx -y skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" \
  && ok "design-taste-frontend installé" || ko "échec (relance à la main)"

say "Connecteurs MCP"
if [ -f .mcp.json ]; then
  ok ".mcp.json présent (figma + playwright) — Claude Code demandera l'autorisation au prochain lancement"
else
  ko ".mcp.json introuvable : place-le à la racine du projet"
fi

cat <<'EOF'

─────────────────────────────────────────────
Terminé. Ensuite, dans Claude Code :

  /impeccable init     → génère PRODUCT.md + DESIGN.md
  /mcp                 → vérifie figma + playwright
  /design <ta demande> → lance le pipeline complet
  /polish <fichier>    → passe de finition sur l'existant

Figma : ouvre l'app desktop et active le serveur MCP
(Préférences → Enable local MCP server) avant de t'en servir.
─────────────────────────────────────────────
EOF

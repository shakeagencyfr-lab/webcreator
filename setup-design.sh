#!/usr/bin/env bash
# Shake Design Kit — complète l'installation des skills de design.
#
# emil-design-eng et impeccable sont déjà versionnés dans .claude/skills/ :
# ce script n'installe QUE le troisième skill (design-taste-frontend).
#
# Usage : bash setup-design.sh   (depuis la racine du projet)

set -u

say() { printf "\n\033[1;35m▸ %s\033[0m\n" "$1"; }
ok()  { printf "\033[0;32m  ✓ %s\033[0m\n" "$1"; }
ko()  { printf "\033[0;31m  ✗ %s\033[0m\n" "$1"; }

command -v node >/dev/null 2>&1 || { ko "Node.js est requis (v18+)"; exit 1; }

say "Skills versionnés dans le dépôt"
for s in emil-design-eng impeccable; do
  if [ -f ".claude/skills/$s/SKILL.md" ]; then
    ok "$s présent (aucune installation nécessaire)"
  else
    ko "$s manquant dans .claude/skills/ — vérifie ton checkout"
  fi
done

say "taste : anti-slop, références de design"
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

N'installe PAS impeccable via npx ou /plugin : tu aurais deux copies
du même playbook. La copie du dépôt fait foi.

Figma : ouvre l'app desktop et active le serveur MCP
(Préférences → Enable local MCP server) avant de t'en servir.
─────────────────────────────────────────────
EOF

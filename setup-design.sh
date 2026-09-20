#!/usr/bin/env bash
# Shake Design Kit — vérifie l'installation des skills de design.
#
# Les trois skills sont versionnés dans .claude/skills/ : il n'y a rien à
# installer. Ce script contrôle simplement que le checkout est complet.
#
# Usage : bash setup-design.sh   (depuis la racine du projet)

set -u

say() { printf "\n\033[1;35m▸ %s\033[0m\n" "$1"; }
ok()  { printf "\033[0;32m  ✓ %s\033[0m\n" "$1"; }
ko()  { printf "\033[0;31m  ✗ %s\033[0m\n" "$1"; }

fail=0

say "Skills versionnés dans le dépôt"
for s in emil-design-eng impeccable design-taste-frontend; do
  if [ -f ".claude/skills/$s/SKILL.md" ]; then
    ok "$s"
  else
    ko "$s manquant dans .claude/skills/ — vérifie ton checkout"
    fail=1
  fi
done

say "Commandes"
for c in design polish; do
  if [ -f ".claude/commands/$c.md" ]; then
    ok "/$c"
  else
    ko "/$c manquant dans .claude/commands/"
    fail=1
  fi
done

say "Connecteurs MCP"
if [ -f .mcp.json ]; then
  ok ".mcp.json présent (figma + playwright) — Claude Code demandera l'autorisation au prochain lancement"
else
  ko ".mcp.json introuvable à la racine du projet"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  say "Checkout incomplet — voir DESIGN-KIT.md"
  exit 1
fi

cat <<'EOF'

─────────────────────────────────────────────
Tout est en place. Dans Claude Code :

  /impeccable init     → génère PRODUCT.md + DESIGN.md
  /mcp                 → vérifie figma + playwright
  /design <ta demande> → lance le pipeline complet
  /polish <fichier>    → passe de finition sur l'existant

N'installe PAS ces skills en plus via npx ou /plugin : tu aurais deux
copies de chacun. La copie du dépôt fait foi.

Figma : ouvre l'app desktop et active le serveur MCP
(Préférences → Enable local MCP server) avant de t'en servir.
─────────────────────────────────────────────
EOF

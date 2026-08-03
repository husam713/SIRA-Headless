#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

printf 'SIRA Step 1 static audit\n'
printf 'Plugin: %s\n\n' "$PLUGIN_DIR"

find "$PLUGIN_DIR" -name '*.php' -print0 \
  | sort -z \
  | xargs -0 -n1 php -l

php "$PLUGIN_DIR/tools/validation/validate-static.php"

if grep -RInE \
  'BricksIntegration|bricks/dynamic_tags_list|bricks/dynamic_data/render_tag|bricks/dynamic_data/render_content|bricks/frontend/render_data|bricks_is_builder' \
  "$PLUGIN_DIR" \
  --include='*.php' \
  --exclude-dir='tools'; then
  printf '\n[FAIL] Active Bricks dependency found.\n' >&2
  exit 1
fi

if grep -RInE \
  'sira_home|sira_branch_home|sira_newsroom|page-templates/sira-home.php|page-templates/sira-newsroom.php' \
  "$PLUGIN_DIR" \
  --include='*.php' \
  --exclude-dir='tools'; then
  printf '\n[FAIL] Removed layout dependency found.\n' >&2
  exit 1
fi

printf '\n[PASS] Static audit completed.\n'

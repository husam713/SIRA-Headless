#!/usr/bin/env bash
set -euo pipefail

WORDPRESS_PATH="${1:-}"

if [[ -z "${WORDPRESS_PATH}" ]]; then
  echo "Usage: $0 /path/to/wordpress" >&2
  exit 64
fi

PACKAGE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_ROOT="${SIRA_INVENTORY_OUTPUT_DIR:-${PACKAGE_ROOT}/output}"

mkdir -p "${OUTPUT_ROOT}"

echo "Running read-only WPGraphQL inventory..."
SIRA_INVENTORY_OUTPUT_DIR="${OUTPUT_ROOT}/graphql" \
  node "${PACKAGE_ROOT}/scripts/graphql-inventory.mjs"

echo "Running read-only WordPress runtime inventory..."
wp eval-file \
  "${PACKAGE_ROOT}/scripts/wp-inventory.php" \
  --path="${WORDPRESS_PATH}" \
  > "${OUTPUT_ROOT}/wp-runtime-inventory.json"

echo "Inventory complete:"
echo "  ${OUTPUT_ROOT}/graphql/network-comparison.json"
echo "  ${OUTPUT_ROOT}/wp-runtime-inventory.json"

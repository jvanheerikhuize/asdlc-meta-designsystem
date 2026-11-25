#!/usr/bin/env bash
# Assembles the Pages site in site/. Used by the pages workflow and the browser tests.
# Usage: scripts/build-site.sh SPEC_PY SPEC_BLUEPRINT_URL
set -euo pipefail
SPEC_PY=${1:?path to spec.py}
BASE_URL=${2:?Spec-Blueprint base URL}
SPEC_PY=$(realpath "$SPEC_PY")
cd "$(dirname "$0")/.."
rm -rf site

# 1. Primary Pages at / (and /showcase/ compatibility alias) is the Design System Showcase
mkdir -p site/src site/showcase/src site/latest/src site/specs
cp showcase/* catalog.json site/
cp showcase/* catalog.json site/showcase/
cp src/index.js site/src/index.js
cp -r src/tokens src/atoms src/molecules src/organisms src/templates site/src/
cp src/index.js site/showcase/src/index.js
cp -r src/tokens src/atoms src/molecules src/organisms src/templates site/showcase/src/

# 2. Versioned ESM distribution channels (/latest/src and /v*/src)
cp src/index.js site/latest/src/index.js
cp -r src/tokens src/atoms src/molecules src/organisms src/templates site/latest/src/
cp catalog.json catalog.md site/latest/
for tag in $(git tag -l 'v*'); do
  if git cat-file -e "${tag}:src/index.js" 2>/dev/null; then
    mkdir -p "site/${tag}"
    git archive "${tag}" src | tar -x -C "site/${tag}"
  fi
done

# 3. Bolted-on Spec Dashboard at /specs/
for f in index.html app.js styles.css; do
  curl -fsSL "${BASE_URL}/site/${f}" -o "site/specs/${f}"
done
sed -i 's|</nav>|<a href="../">← Primary Site</a></nav>|' site/specs/index.html
python3 "$SPEC_PY" --root . index --out site/specs/data/index.json

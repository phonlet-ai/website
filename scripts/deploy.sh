#!/usr/bin/env bash
# Publishes the static export in out/ (from `npm run build`) to the gh-pages branch of origin as a
# single commit, so the branch never accumulates old builds. GitHub Pages serves that branch.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f out/index.html || ! -f out/CNAME || ! -f out/.nojekyll ]]; then
  echo "out/ is missing or incomplete: run npm run build first" >&2
  exit 1
fi
if ! git diff --quiet HEAD --; then
  echo "commit your changes first: the deploy names the commit it was built from" >&2
  exit 1
fi
if [[ $(find app components features lib public next.config.ts -newer out/index.html -print -quit) ]]; then
  echo "sources changed after the last build: run npm run build again" >&2
  exit 1
fi

commit=$(git rev-parse --short HEAD)
remote=$(git remote get-url origin)
stage=$(mktemp -d)
trap 'rm -rf -- "$stage"' EXIT
cp -a out/. "$stage/"
git -C "$stage" init -q -b gh-pages
git -C "$stage" add -A
git -C "$stage" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" \
  commit -q -m "Site build of $commit"
git -C "$stage" push -f "$remote" gh-pages
echo "Deployed $commit to gh-pages of $remote"

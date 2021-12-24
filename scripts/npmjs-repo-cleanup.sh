#!/usr/bin/env sh

CANARY_BUILDS=$(npm view sites-sync versions --json | jq '.[]' -r | grep canary | head -n -2)

if [ -z "$CANARY_BUILDS" ]; then
  echo "No releases to cleanup found, exiting."
  exit 0
fi

for item in $CANARY_BUILDS; do
  RELEASE="simple-scan@$item"
  echo "Unpublsihing release $RELEASE"
  npm unpublish $RELEASE
done

#! /usr/bin/env sh

set -e

DIST=$(mktemp --directory)

yarn build:node
mv dist "$DIST"/node

yarn build:browser
mv dist "$DIST"/browser

mv "$DIST" dist
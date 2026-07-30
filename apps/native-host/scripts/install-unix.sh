#!/usr/bin/env sh
set -eu
corepack pnpm --filter @extension-manager/native-host build
node "$(dirname "$0")/install.mjs"

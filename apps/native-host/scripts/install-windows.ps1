$ErrorActionPreference = 'Stop'
corepack pnpm --filter @extension-manager/native-host build
node "$PSScriptRoot/install.mjs"

# AGENTS.md

## Project

Node 22/pnpm monorepo for a Chrome side-panel extension, cooperative target SDK, shared protocol, and native companion.
Chrome can restart arbitrary extensions; verified reload requires the target SDK handshake.

## Commands

- Install: `corepack pnpm install`
- Dev extension: `corepack pnpm dev`
- Validate all: `corepack pnpm validate`
- Build extension: `corepack pnpm --filter @extension-manager/manager-extension build`
- Preview UI: `corepack pnpm --filter @extension-manager/manager-extension preview`

## Structure

- `apps/manager-extension/` — WXT/React Chrome side panel and fixture preview.
- `apps/native-host/` — native messaging host, framing, installers, and tests.
- `packages/protocol/` — shared validated message contract.
- `packages/target-sdk/` — cooperative target reload and health handshake.
- `fixtures/integrated-target-extension/` — integration example.
- `docs/ARCHITECTURE.md` / `docs/SECURITY.md` — boundaries and trust model.
- `pnpm-workspace.yaml` — workspace membership.

## Rules

- Read `C:\code\UI-PLAYBOOK.md` before UI work; test resizable narrow and wide panels.
- Use Corepack/pnpm only; keep workspace dependency versions locked.
- Do not claim cross-extension reload without the target SDK acknowledgement and bounded ping recovery.
- Validate native-message framing and sender identity at every process boundary.
- Protect the manager from disabling or restarting itself.
- Chrome APIs stay behind adapters/hooks; fixture data must not enter production behavior.
- Stop a running Windows native host before rebuilding its locked executable.

## Before finishing

- Run `corepack pnpm validate`.
- For UI changes, run the fixture preview and inspect narrow/wide, light/dark, loading/empty/error/success states.
- Load the production build from `apps/manager-extension/.output/chrome-mv3` for Chrome API changes.

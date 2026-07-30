# Implementation status

Updated: 2026-07-30

## Current slice

Slices 1–2: **complete in code; manual Chrome smoke test pending**.

Slice 3 native transport and installation: **complete**. Project registry follows in Slice 4.

## Completed

- Public repository initialized at `wasely/extension-manager`.
- Product scope and layered architecture recorded.
- Supported Chrome API constraints separated from future integrated/native capabilities.
- pnpm workspace with WXT, React, strict TypeScript, Tailwind CSS, Zod, and Vitest.
- Persistent side panel opened from the toolbar action.
- Real `chrome.management` inventory with development filtering and live events.
- Search, enabled-state filters, favorites, tags, themes, and stored preferences.
- User-initiated enable/disable with optimistic UI, Chrome rejection handling, and self-protection.
- User-initiated restart fallback for enabled, non-integrated extensions, with Chrome rejection handling.
- Compact responsive cards with collision-safe toggles and two-column wide-panel layout.
- Options-page, extension metadata, permission counts, and copy-ID controls.
- Domain and React component tests.
- Stable manager ID derived from a committed public manifest key.
- Shared Zod target protocol with PING, metadata, and reload messages.
- `@extension-manager/target` sender-validated bridge.
- Reload acknowledgement plus bounded PING recovery checks.
- Integrated WXT fixture extension.
- Zod-validated native hello, health, and project-list protocol.
- Incremental native frame decoder with partial, multiple, invalid, and oversized-frame tests.
- Standalone Windows native-host executable and Chrome registration.
- macOS, Linux, Chromium, and Windows install/uninstall scripts.
- Persisted bridge state with bounded reconnect and honest header status.

## Next

- Manually load `.output/chrome-mv3` in Chrome and smoke-test real management actions.
- Load manager and integrated fixture together for a real Chrome reload smoke test.

## Pending

- Slice 4: project scanner, project pairing, full dashboard.
- Slice 5: process lifecycle and log streaming.
- Slice 6: raw-project watcher and build/reload pipeline.
- Slice 7: workspaces, command palette, diagnostics, full documentation.

## Verification

- `corepack pnpm format`: passed.
- `corepack pnpm lint`: passed.
- `corepack pnpm typecheck`: passed.
- `corepack pnpm test`: 35 tests passed across manager, native host, protocol, and target SDK.
- `corepack pnpm build`: passed for manager, protocol, target SDK, and integrated fixture.
- Manual Chrome smoke test: pending.

# Extension Manager architecture

Extension Manager is a developer control center for locally loaded Chrome extensions. The product name remains **Extension Manager**; “ExtDeck” is not used in code, manifests, or documentation.

## System boundaries

```text
Side panel / dashboard
        |
        v
MV3 manager extension
  | chrome.management
  | chrome.storage.local
  | cross-extension messages
  | chrome.runtime.connectNative
  |
  +--> installed Chrome extensions
  +--> integrated target extensions
  +--> com.extension_manager.bridge
             |
             +--> project registry
             +--> framework processes
             +--> builds, watchers, and logs
```

The browser-only manager is useful without either integration. Reliable reloads require a cooperative target bridge. Local file access and process control require the native host.

## Action vocabulary

These operations remain distinct throughout the protocol and UI:

| Action | Effect |
| --- | --- |
| Rebuild | Run a registered project build script. |
| Reload extension | Ask an integrated target to reload itself. |
| Restart extension | User-initiated disable followed by enable. |
| Restart dev server | Restart a registered local process. |
| Refresh test tab | Reload an opted-in web tab. |
| Clear extension data | Destructive; excluded from the MVP. |

## Manager extension

The manager is a WXT, React, strict TypeScript, Tailwind CSS Manifest V3 extension. Its toolbar action opens a persistent side panel. A full dashboard will share the same domain modules in a later slice.

Chrome API results are normalized at the edge. UI state separates Chrome, target integration, process, build, reload, and native-bridge status. Durable preferences live in `chrome.storage.local`; service-worker globals are never treated as durable.

The manager never disables itself. Normal extensions are hidden by default; unpacked extensions are identified by `installType === "development"`.

## Reliable reload

There is no supported API for reloading an arbitrary extension. Slice 2 adds `@extension-manager/target`, an allowlisted `runtime.onMessageExternal` listener that supports `PING`, target metadata, and acknowledged self-reload. A reload is successful only after the target becomes reachable again.

Non-integrated extensions may expose a clearly labelled, user-initiated restart fallback. It is not an automatic reload strategy.

## Native companion

`com.extension_manager.bridge` will use Chrome native messaging with length-prefixed JSON on stdin/stdout. Protocol messages are versioned and validated with Zod on both sides. Stdout is reserved for protocol frames; diagnostics go to stderr.

The host accepts structured operations against registered project roots. It never accepts arbitrary shell command strings. Package scripts are stored by name and launched as executable plus argument array with `shell: false` where possible.

Framework-owned development reload loops take precedence for WXT, Plasmo, and CRXJS projects. Extension Manager watches raw/custom projects only, preventing duplicate builds and reload loops.

## Delivery slices

1. Browser-only manager: real extension inventory, filtering, search, preferences, favorites, tags, enable/disable, live management events, tests.
2. Stable ID guidance, target SDK, integration health, reliable reload, fixtures, tests.
3. Native protocol and host, installation scripts, health, registry, tests.
4. Project scanner, pairing, full dashboard, open-folder/editor flows.
5. Structured process manager and bounded log streaming.
6. Raw-project watcher, build/reload pipeline, optional tab refresh.
7. Workspaces, command palette, diagnostics, UX and documentation completion.

## Security invariants

- Exact target sender and native-host origin allowlists.
- Zod validation at process and extension message boundaries.
- No `eval`, remote scripts, arbitrary shell commands, or unrestricted filesystem operations.
- Registered-root path confinement for native operations.
- Optional `tabs` permission; tab refresh defaults off.
- No private signing keys in the repository.
- No destructive data-clearing control in the MVP.

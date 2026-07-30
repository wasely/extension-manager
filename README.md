# Extension Manager

Extension Manager is a Manifest V3 developer control center for finding, inspecting, enabling, and disabling locally loaded Chrome extensions from a persistent side panel.

The browser-only MVP and cooperative target reload bridge are implemented. Local build/process control remains intentionally separated into the native-host slices; Chrome does not provide an API that directly reloads another extension.

## Current features

- Real installed-extension data from `chrome.management.getAll()`
- Development extensions shown by default using `installType === "development"`
- Search by name, description, extension ID, or tag
- Development/all/enabled/disabled filters
- Favorites and tags stored in `chrome.storage.local`
- User-initiated enable/disable controls with explicit Chrome errors
- Self-protection: Extension Manager cannot disable itself
- Live refresh on install, uninstall, enable, and disable events
- Options-page links, permission counts, extension IDs, versions, and icons
- System, dark, and light themes
- Honest unavailable states for target integration, builds, reloads, and the local companion
- Stable development ID for exact target allowlisting
- Zod-validated target `PING`, metadata, and acknowledged self-reload protocol
- Reload completion verified by bounded `PING` retries
- Integrated WXT target fixture

## Requirements

- Node.js 22 or newer
- Corepack
- Google Chrome 114 or newer

## Build and load

```powershell
corepack pnpm install
corepack pnpm build
```

Then:

1. Open `chrome://extensions` once for initial installation.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select `apps/manager-extension/.output/chrome-mv3`.
5. Pin Extension Manager and click its toolbar icon. The side panel opens.

Subsequent daily management happens in the side panel. WXT development mode is available with:

```powershell
corepack pnpm dev
```

## Validation

```powershell
corepack pnpm validate
```

Individual commands:

```powershell
corepack pnpm format
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## Structure

```text
apps/manager-extension/   WXT + React manager extension
docs/ARCHITECTURE.md      system boundaries and delivery slices
docs/IMPLEMENTATION_STATUS.md
docs/SECURITY.md
```

See [architecture](docs/ARCHITECTURE.md), [implementation status](docs/IMPLEMENTATION_STATUS.md), and [security model](docs/SECURITY.md).

Target authors: follow [target integration](docs/TARGET_INTEGRATION.md). The stable manager ID is `gpmlcdigokplenooecjmlphknhaidnjf`.

## Current limitations

- Reliable reload requires the target SDK; non-integrated extensions are represented honestly and cannot be auto-reloaded.
- Build commands, file watching, project pairing, logs, and dev-server controls require the future native companion.
- Optional tab refresh is not implemented and remains off.
- Automated tests cover domain and component behavior; Chrome extension E2E coverage is pending.

Technical behavior follows the official Chrome documentation for [`chrome.management`](https://developer.chrome.com/docs/extensions/reference/api/management) and [`chrome.sidePanel`](https://developer.chrome.com/docs/extensions/reference/api/sidePanel).

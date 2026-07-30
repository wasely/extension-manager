# Security model

Extension Manager controls other installed extensions and will later control registered local development processes. These are privileged boundaries.

## Current manager extension

- `management` is required to list and enable/disable installed extensions.
- `storage` stores non-sensitive interface preferences, favorites, and tags.
- `sidePanel` provides the persistent interface.
- `tabs` is optional and is not requested unless a future tab-refresh feature is enabled.
- The manager refuses enable/disable operations targeting its own extension ID.
- Stored values and normalized Chrome API data are validated with Zod.
- No remote scripts, `eval`, arbitrary commands, or data-clearing actions exist.

Chrome may reject `management.setEnabled()` or display native confirmation UI. Extension Manager reports rejection and never treats a requested state change as guaranteed.

## Target integration rules

Slice 2 must enforce all of the following:

- Target manifests allowlist one stable Extension Manager ID through `externally_connectable`.
- Targets verify `sender.id`, namespace, protocol version, and message schema.
- Targets expose only health, metadata, and self-reload operations.
- Reload acknowledgement is sent before the target calls `chrome.runtime.reload()`.
- The manager reports success only after the target answers `PING` again.
- No target message can execute arbitrary code or shell commands.

## Native host rules

The `com.extension_manager.bridge` host:

- Allow only the exact stable Extension Manager origin.
- Validate every length-prefixed JSON frame with shared Zod schemas.
- Reserve stdout for native messaging frames and write diagnostics to stderr.
- Accept structured executable/argument/cwd requests, never raw shell strings.
- Restrict file and process operations to validated registered project roots.
- Use `shell: false` wherever possible.
- Cap message size, log chunks, and in-memory log buffers.
- Redact obvious secrets from displayed logs and environment data.
- Avoid localhost HTTP/WebSocket servers unless a documented need emerges.

The generated native-host manifest allowlists only `chrome-extension://gpmlcdigokplenooecjmlphknhaidnjf/`. Windows registration is per-user. Installers and uninstallers are explicit and reversible.

## Reporting

Do not include credentials, private signing keys, browser profiles, or private project data in an issue. This repository does not yet publish a private vulnerability-reporting channel; use GitHub’s repository-owner contact mechanisms until one is configured.

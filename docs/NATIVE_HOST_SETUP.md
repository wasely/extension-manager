# Native host setup

The native host is named `com.extension_manager.bridge`. Its manifest allows only Extension Manager's stable origin:

```text
chrome-extension://gpmlcdigokplenooecjmlphknhaidnjf/
```

## Windows Google Chrome

From the repository root:

```powershell
& apps/native-host/scripts/install-windows.ps1
```

This builds a standalone executable, writes the host manifest under `%LOCALAPPDATA%\ExtensionManager`, and registers it under the current user's Chrome native-messaging registry key. Reload Extension Manager after installation.

Uninstall:

```powershell
& apps/native-host/scripts/uninstall-windows.ps1
```

## macOS Google Chrome

```bash
sh apps/native-host/scripts/install-unix.sh
```

The manifest is written to `~/Library/Application Support/Google/Chrome/NativeMessagingHosts`.

## Linux Google Chrome and Chromium

```bash
sh apps/native-host/scripts/install-unix.sh
```

User-level manifests are written for both Google Chrome and Chromium. Uninstall on macOS or Linux with:

```bash
sh apps/native-host/scripts/uninstall-unix.sh
```

## Diagnostics

The side-panel header distinguishes connected, offline, and not-installed states. If Chrome reports the host missing, rebuild and rerun the installer, then reload Extension Manager. The generated host manifest's `path` must point to the current repository location.

Native-host stdout is reserved for length-prefixed JSON. Diagnostics are written only to stderr.

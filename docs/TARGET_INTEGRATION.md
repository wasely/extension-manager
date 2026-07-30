# Target integration

Extension Manager’s stable development ID is:

```text
gpmlcdigokplenooecjmlphknhaidnjf
```

The ID is derived from the public manifest `key`. No private signing key is stored in this repository.

## Install the bridge

The workspace package is currently private to this monorepo:

```ts
import { installExtensionManagerBridge } from '@extension-manager/target';

installExtensionManagerBridge({
  managerExtensionId: 'gpmlcdigokplenooecjmlphknhaidnjf',
});
```

Call it from the target extension’s MV3 service-worker entrypoint. The bridge supports only `PING`, `GET_TARGET_INFO`, and `RELOAD_EXTENSION`.

## Allowlist the manager

Add the exact manager ID to the target manifest:

```json
{
  "externally_connectable": {
    "ids": ["gpmlcdigokplenooecjmlphknhaidnjf"]
  }
}
```

Both checks are required: Chrome applies the manifest allowlist, and the SDK verifies `sender.id` again.

## Reload lifecycle

1. Extension Manager sends `RELOAD_EXTENSION`.
2. The target validates the sender and Zod message schema.
3. The target acknowledges before scheduling `chrome.runtime.reload()`.
4. Extension Manager marks the target as reloading.
5. Extension Manager retries `PING` with bounded backoff.
6. Success appears only after `PING` returns; otherwise the UI shows a timeout.

See `fixtures/integrated-target-extension` for a WXT example. Load its `.output/chrome-mv3` directory alongside the manager to test integration.

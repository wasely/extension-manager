import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTargetRequest } from '@extension-manager/protocol';

import { installExtensionManagerBridge } from './index.js';

type ExternalListener = Parameters<
  typeof chrome.runtime.onMessageExternal.addListener
>[0];

describe('target bridge', () => {
  let listener: ExternalListener | undefined;
  const reload = vi.fn();
  const removeListener = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    listener = undefined;
    vi.stubGlobal('chrome', {
      runtime: {
        getManifest: () => ({ version: '2.3.4' }),
        reload,
        onMessageExternal: {
          addListener: (nextListener: ExternalListener) => {
            listener = nextListener;
          },
          removeListener,
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('ignores senders that are not explicitly allowed', () => {
    installExtensionManagerBridge({ managerExtensionId: 'manager-id' });
    const sendResponse = vi.fn();

    listener?.(
      createTargetRequest('PING', 'request-1'),
      { id: 'unknown-id' },
      sendResponse,
    );

    expect(sendResponse).not.toHaveBeenCalled();
  });

  it('responds to PING with integration and manifest versions', () => {
    installExtensionManagerBridge({ managerExtensionId: 'manager-id' });
    const sendResponse = vi.fn();

    listener?.(
      createTargetRequest('PING', 'request-1'),
      { id: 'manager-id' },
      sendResponse,
    );

    expect(sendResponse).toHaveBeenCalledWith({
      ok: true,
      requestId: 'request-1',
      type: 'PONG',
      target: {
        integrationVersion: '0.1.0',
        extensionVersion: '2.3.4',
      },
    });
  });

  it('acknowledges reload before reloading after the configured delay', () => {
    installExtensionManagerBridge({
      managerExtensionId: 'manager-id',
      reloadDelayMs: 75,
    });
    const sendResponse = vi.fn();

    listener?.(
      createTargetRequest('RELOAD_EXTENSION', 'request-2'),
      { id: 'manager-id' },
      sendResponse,
    );

    expect(sendResponse).toHaveBeenCalledWith({
      ok: true,
      requestId: 'request-2',
      type: 'RELOAD_ACCEPTED',
      accepted: true,
    });
    expect(reload).not.toHaveBeenCalled();

    vi.advanceTimersByTime(75);
    expect(reload).toHaveBeenCalledOnce();
  });
});

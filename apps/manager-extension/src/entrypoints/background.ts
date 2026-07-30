import {
  bridgeProtocolVersion,
  bridgeResponseSchema,
} from '@extension-manager/protocol';

import {
  defaultBridgeState,
  disconnectedBridgeState,
  bridgeStateSchema,
  type BridgeState,
} from '../core/bridge';

const hostName = 'com.extension_manager.bridge';
const storageKey = 'nativeBridgeState';

export default defineBackground(() => {
  let bridgeState: BridgeState = defaultBridgeState;
  let reconnectAttempt = 0;
  let port: chrome.runtime.Port | null = null;

  const publishBridgeState = (state: BridgeState) => {
    bridgeState = state;
    void chrome.storage.local.set({ [storageKey]: state });
    void chrome.runtime
      .sendMessage({ type: 'BRIDGE_STATUS_CHANGED', state })
      .catch(() => undefined);
  };

  const connectBridge = () => {
    publishBridgeState({ status: 'connecting', error: null });
    port = chrome.runtime.connectNative(hostName);
    const currentPort = port;

    currentPort.onMessage.addListener((message: unknown) => {
      const response = bridgeResponseSchema.safeParse(message);
      if (!response.success) {
        publishBridgeState({
          status: 'incompatible-version',
          error: 'Native host returned an incompatible response.',
        });
        return;
      }
      if (response.data.type === 'BRIDGE_HELLO' && response.data.success) {
        reconnectAttempt = 0;
        publishBridgeState({ status: 'connected', error: null });
      }
    });

    currentPort.onDisconnect.addListener(() => {
      if (port !== currentPort) return;
      port = null;
      const message =
        chrome.runtime.lastError?.message ?? 'Native host disconnected.';
      publishBridgeState(disconnectedBridgeState(message));
      reconnectAttempt += 1;
      const delay = Math.min(30_000, 1_000 * 2 ** (reconnectAttempt - 1));
      globalThis.setTimeout(connectBridge, delay);
    });

    currentPort.postMessage({
      protocolVersion: bridgeProtocolVersion,
      requestId: crypto.randomUUID(),
      type: 'BRIDGE_HELLO',
      payload: { managerVersion: chrome.runtime.getManifest().version },
    });
  };

  const enableActionSidePanel = () => {
    void chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error: unknown) => {
        console.error('Failed to configure side panel behavior', error);
      });
  };

  enableActionSidePanel();
  void chrome.storage.local.get(storageKey).then((stored) => {
    const parsed = bridgeStateSchema.safeParse(stored[storageKey]);
    if (parsed.success) publishBridgeState(parsed.data);
    connectBridge();
  });
  chrome.runtime.onInstalled.addListener(enableActionSidePanel);
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'GET_BRIDGE_STATUS') sendResponse(bridgeState);
  });
});

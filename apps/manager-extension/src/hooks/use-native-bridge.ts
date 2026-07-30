import { useEffect, useState } from 'react';

import {
  bridgeRuntimeMessageSchema,
  bridgeStateSchema,
  defaultBridgeState,
  type BridgeState,
} from '../core/bridge';

export function useNativeBridge(): BridgeState {
  const [state, setState] = useState<BridgeState>(defaultBridgeState);

  useEffect(() => {
    const update = (message: unknown) => {
      const parsed = bridgeRuntimeMessageSchema.safeParse(message);
      if (parsed.success && parsed.data.type === 'BRIDGE_STATUS_CHANGED') {
        setState(parsed.data.state);
      }
    };

    chrome.runtime.onMessage.addListener(update);
    void chrome.runtime
      .sendMessage({ type: 'GET_BRIDGE_STATUS' })
      .then((response: unknown) => {
        const parsed = bridgeStateSchema.safeParse(response);
        if (parsed.success) setState(parsed.data);
      })
      .catch(() => {
        setState({
          status: 'disconnected',
          error: 'Service worker unavailable.',
        });
      });

    return () => chrome.runtime.onMessage.removeListener(update);
  }, []);

  return state;
}

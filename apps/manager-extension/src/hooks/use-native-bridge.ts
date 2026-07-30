import { useEffect, useState } from 'react';

import {
  bridgeStateSchema,
  defaultBridgeState,
  type BridgeState,
} from '../core/bridge';

export function useNativeBridge(): BridgeState {
  const [state, setState] = useState<BridgeState>(defaultBridgeState);

  useEffect(() => {
    const update = (message: unknown) => {
      if (
        typeof message !== 'object' ||
        message === null ||
        !('type' in message) ||
        message.type !== 'BRIDGE_STATUS_CHANGED' ||
        !('state' in message)
      ) {
        return;
      }
      const parsed = bridgeStateSchema.safeParse(message.state);
      if (parsed.success) setState(parsed.data);
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

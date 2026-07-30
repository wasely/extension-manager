import { z } from 'zod';

export const bridgeStateSchema = z.object({
  status: z.enum([
    'connecting',
    'connected',
    'disconnected',
    'installation-missing',
    'incompatible-version',
  ]),
  error: z.string().nullable(),
});

export type BridgeState = z.infer<typeof bridgeStateSchema>;

export const bridgeRuntimeMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('GET_BRIDGE_STATUS') }),
  z.object({
    type: z.literal('BRIDGE_STATUS_CHANGED'),
    state: bridgeStateSchema,
  }),
]);

export type BridgeRuntimeMessage = z.infer<typeof bridgeRuntimeMessageSchema>;

export const defaultBridgeState: BridgeState = {
  status: 'connecting',
  error: null,
};

export function disconnectedBridgeState(message: string): BridgeState {
  return {
    status: message.includes('native messaging host not found')
      ? 'installation-missing'
      : 'disconnected',
    error: message,
  };
}

export function bridgeStatusLabel(status: BridgeState['status']): string {
  return {
    connected: 'Bridge connected',
    connecting: 'Bridge connecting',
    disconnected: 'Bridge disconnected',
    'installation-missing': 'Bridge not installed',
    'incompatible-version': 'Bridge incompatible',
  }[status];
}

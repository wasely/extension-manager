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

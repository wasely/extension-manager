import { describe, expect, it } from 'vitest';

import {
  bridgeRuntimeMessageSchema,
  bridgeStatusLabel,
  disconnectedBridgeState,
} from './bridge';

describe('bridge state', () => {
  it('distinguishes a missing native-host installation', () => {
    expect(
      disconnectedBridgeState('Specified native messaging host not found.'),
    ).toMatchObject({ status: 'installation-missing' });
  });

  it('keeps other disconnects distinct', () => {
    expect(disconnectedBridgeState('Native host has exited.')).toMatchObject({
      status: 'disconnected',
    });
  });

  it('keeps every user-visible connection state distinct', () => {
    const labels = [
      'connecting',
      'connected',
      'disconnected',
      'installation-missing',
      'incompatible-version',
    ].map((status) =>
      bridgeStatusLabel(status as Parameters<typeof bridgeStatusLabel>[0]),
    );

    expect(new Set(labels).size).toBe(5);
  });

  it('rejects ad-hoc runtime bridge messages', () => {
    expect(
      bridgeRuntimeMessageSchema.safeParse({ type: 'BRIDGE_STATUS_CHANGED' })
        .success,
    ).toBe(false);
  });
});

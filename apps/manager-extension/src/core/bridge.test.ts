import { describe, expect, it } from 'vitest';

import { disconnectedBridgeState } from './bridge';

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
});

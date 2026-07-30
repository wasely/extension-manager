import { describe, expect, it } from 'vitest';

import { handleBridgeMessage } from './host.js';

describe('native host request handling', () => {
  it('returns host health with the matching request ID', () => {
    expect(
      handleBridgeMessage(
        {
          protocolVersion: 1,
          requestId: 'health-1',
          type: 'BRIDGE_HEALTH',
          payload: {},
        },
        { now: 15_000, startedAt: 5_000, platform: 'win32' },
      ),
    ).toEqual({
      protocolVersion: 1,
      requestId: 'health-1',
      type: 'BRIDGE_HEALTH',
      success: true,
      payload: { status: 'connected', uptimeSeconds: 10 },
    });
  });

  it('returns a typed error for an invalid request', () => {
    const response = handleBridgeMessage(
      { requestId: 'bad-1', type: 'RUN_COMMAND' },
      { now: 15_000, startedAt: 5_000, platform: 'win32' },
    );

    expect(response).toMatchObject({
      requestId: 'bad-1',
      type: 'ERROR',
      success: false,
      error: { code: 'INVALID_MESSAGE' },
    });
  });
});

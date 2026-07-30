import { describe, expect, it } from 'vitest';

import {
  createTargetRequest,
  targetRequestSchema,
  targetResponseSchema,
} from './index.js';

describe('target protocol', () => {
  it('creates versioned requests', () => {
    expect(createTargetRequest('PING', 'request-1')).toEqual({
      namespace: 'extension-manager',
      protocolVersion: 1,
      requestId: 'request-1',
      type: 'PING',
    });
  });

  it('rejects unknown target actions', () => {
    expect(
      targetRequestSchema.safeParse({
        namespace: 'extension-manager',
        protocolVersion: 1,
        requestId: 'request-1',
        type: 'RUN_COMMAND',
      }).success,
    ).toBe(false);
  });

  it('rejects reload success without acceptance', () => {
    expect(
      targetResponseSchema.safeParse({
        ok: true,
        requestId: 'request-1',
        type: 'RELOAD_ACCEPTED',
        accepted: false,
      }).success,
    ).toBe(false);
  });
});

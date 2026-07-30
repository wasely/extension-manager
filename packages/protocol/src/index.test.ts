import { describe, expect, it } from 'vitest';

import {
  bridgeRequestSchema,
  bridgeResponseSchema,
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

describe('native bridge protocol', () => {
  it('accepts a versioned health request', () => {
    expect(
      bridgeRequestSchema.parse({
        protocolVersion: 1,
        requestId: 'health-1',
        type: 'BRIDGE_HEALTH',
        payload: {},
      }),
    ).toMatchObject({ type: 'BRIDGE_HEALTH' });
  });

  it('rejects raw command execution', () => {
    expect(
      bridgeRequestSchema.safeParse({
        protocolVersion: 1,
        requestId: 'unsafe-1',
        type: 'RUN_COMMAND',
        payload: { command: 'rm -rf /' },
      }).success,
    ).toBe(false);
  });

  it('requires typed bridge errors', () => {
    expect(
      bridgeResponseSchema.safeParse({
        protocolVersion: 1,
        requestId: 'health-1',
        type: 'ERROR',
        success: false,
        error: { message: 'No code' },
      }).success,
    ).toBe(false);
  });

  it('rejects unvalidated project-list entries', () => {
    expect(
      bridgeResponseSchema.safeParse({
        protocolVersion: 1,
        requestId: 'projects-1',
        type: 'PROJECT_LIST',
        success: true,
        payload: { projects: [{ id: 'not-enough-fields' }] },
      }).success,
    ).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { reloadTargetAndWait } from './target';

describe('reloadTargetAndWait', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reports success only after the target responds to PING again', async () => {
    let pingAttempts = 0;
    const sendMessage = vi.fn(
      async (
        _extensionId: string,
        request: { requestId: string; type: string },
      ) => {
        if (request.type === 'RELOAD_EXTENSION') {
          return {
            ok: true,
            requestId: request.requestId,
            type: 'RELOAD_ACCEPTED',
            accepted: true,
          };
        }
        pingAttempts += 1;
        if (pingAttempts === 1) throw new Error('Target restarting');
        return {
          ok: true,
          requestId: request.requestId,
          type: 'PONG',
          target: {
            integrationVersion: '0.1.0',
            extensionVersion: '1.2.3',
          },
        };
      },
    );
    vi.stubGlobal('chrome', { runtime: { sendMessage } });

    const health = await reloadTargetAndWait('target-id', {
      delays: [1, 1],
      sleep: async () => undefined,
    });

    expect(health.extensionVersion).toBe('1.2.3');
    expect(pingAttempts).toBe(2);
  });

  it('fails when the target never returns', async () => {
    const sendMessage = vi.fn(
      async (
        _extensionId: string,
        request: { requestId: string; type: string },
      ) => {
        if (request.type === 'RELOAD_EXTENSION') {
          return {
            ok: true,
            requestId: request.requestId,
            type: 'RELOAD_ACCEPTED',
            accepted: true,
          };
        }
        throw new Error('Target unreachable');
      },
    );
    vi.stubGlobal('chrome', { runtime: { sendMessage } });

    await expect(
      reloadTargetAndWait('target-id', {
        delays: [1, 1],
        sleep: async () => undefined,
      }),
    ).rejects.toThrow('did not become reachable');
  });
});

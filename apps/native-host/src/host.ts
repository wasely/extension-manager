import {
  bridgeProtocolVersion,
  bridgeRequestSchema,
  bridgeResponseSchema,
  type BridgeResponse,
} from '@extension-manager/protocol';

interface HostContext {
  now: number;
  startedAt: number;
  platform: 'win32' | 'darwin' | 'linux';
}

function requestIdFrom(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'requestId' in value &&
    typeof value.requestId === 'string' &&
    value.requestId
  ) {
    return value.requestId;
  }
  return 'invalid-request';
}

export function handleBridgeMessage(
  input: unknown,
  context: HostContext,
): BridgeResponse {
  const parsed = bridgeRequestSchema.safeParse(input);
  if (!parsed.success) {
    return bridgeResponseSchema.parse({
      protocolVersion: bridgeProtocolVersion,
      requestId: requestIdFrom(input),
      type: 'ERROR',
      success: false,
      error: {
        code: 'INVALID_MESSAGE',
        message: 'The native request did not match the protocol schema.',
      },
    });
  }

  const request = parsed.data;
  switch (request.type) {
    case 'BRIDGE_HELLO':
      return bridgeResponseSchema.parse({
        protocolVersion: bridgeProtocolVersion,
        requestId: request.requestId,
        type: 'BRIDGE_HELLO',
        success: true,
        payload: { hostVersion: '0.1.0', platform: context.platform },
      });
    case 'BRIDGE_HEALTH':
      return bridgeResponseSchema.parse({
        protocolVersion: bridgeProtocolVersion,
        requestId: request.requestId,
        type: 'BRIDGE_HEALTH',
        success: true,
        payload: {
          status: 'connected',
          uptimeSeconds: Math.max(0, (context.now - context.startedAt) / 1000),
        },
      });
    case 'PROJECT_LIST':
      return bridgeResponseSchema.parse({
        protocolVersion: bridgeProtocolVersion,
        requestId: request.requestId,
        type: 'PROJECT_LIST',
        success: true,
        payload: { projects: [] },
      });
  }
}

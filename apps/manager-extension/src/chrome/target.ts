import {
  createTargetRequest,
  targetResponseSchema,
  type TargetResponse,
} from '@extension-manager/protocol';

export interface TargetHealth {
  integrationVersion: string;
  extensionVersion: string;
}

async function sendTargetRequest(
  extensionId: string,
  type: 'PING' | 'GET_TARGET_INFO' | 'RELOAD_EXTENSION',
  timeoutMs = 1200,
): Promise<TargetResponse> {
  const request = createTargetRequest(type);
  let timeout: number | undefined;
  try {
    const response = await Promise.race([
      chrome.runtime.sendMessage(extensionId, request),
      new Promise<never>((_, reject) => {
        timeout = window.setTimeout(
          () => reject(new Error(`${type} timed out.`)),
          timeoutMs,
        );
      }),
    ]);
    const parsed = targetResponseSchema.parse(response);
    if (parsed.requestId !== request.requestId) {
      throw new Error('Target response request ID did not match.');
    }
    return parsed;
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}

export async function pingTarget(
  extensionId: string,
): Promise<TargetHealth | null> {
  try {
    const response = await sendTargetRequest(extensionId, 'PING');
    return response.ok && response.type === 'PONG' ? response.target : null;
  } catch {
    return null;
  }
}

export async function reloadTargetAndWait(
  extensionId: string,
  options: {
    delays?: number[];
    sleep?: (milliseconds: number) => Promise<void>;
  } = {},
): Promise<TargetHealth> {
  const response = await sendTargetRequest(extensionId, 'RELOAD_EXTENSION');
  if (!response.ok || response.type !== 'RELOAD_ACCEPTED') {
    throw new Error('Target did not accept the reload request.');
  }

  const delays = options.delays ?? [100, 200, 400, 800, 1600];
  const sleep =
    options.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds)));

  for (const delay of delays) {
    await sleep(delay);
    const health = await pingTarget(extensionId);
    if (health) return health;
  }
  throw new Error('Target did not become reachable after reload.');
}

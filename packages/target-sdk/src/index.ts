import {
  targetNamespace,
  targetRequestSchema,
  type TargetResponse,
} from '@extension-manager/protocol';

export const targetIntegrationVersion = '0.1.0';

export interface InstallTargetBridgeOptions {
  managerExtensionId: string;
  reloadDelayMs?: number;
}

export function installExtensionManagerBridge({
  managerExtensionId,
  reloadDelayMs = 75,
}: InstallTargetBridgeOptions): () => void {
  const listener: Parameters<
    typeof chrome.runtime.onMessageExternal.addListener
  >[0] = (rawMessage, sender, sendResponse) => {
    if (sender.id !== managerExtensionId) return;

    const result = targetRequestSchema.safeParse(rawMessage);
    if (!result.success) {
      const requestId =
        typeof rawMessage === 'object' &&
        rawMessage !== null &&
        'requestId' in rawMessage &&
        typeof rawMessage.requestId === 'string'
          ? rawMessage.requestId
          : 'unknown';
      sendResponse({
        ok: false,
        requestId,
        type: 'ERROR',
        error: {
          code: 'INVALID_MESSAGE',
          message: `Expected a ${targetNamespace} protocol message.`,
        },
      } satisfies TargetResponse);
      return;
    }

    const request = result.data;
    if (request.type === 'RELOAD_EXTENSION') {
      sendResponse({
        ok: true,
        requestId: request.requestId,
        type: 'RELOAD_ACCEPTED',
        accepted: true,
      } satisfies TargetResponse);
      setTimeout(() => chrome.runtime.reload(), reloadDelayMs);
      return;
    }

    sendResponse({
      ok: true,
      requestId: request.requestId,
      type: request.type === 'PING' ? 'PONG' : 'TARGET_INFO',
      target: {
        integrationVersion: targetIntegrationVersion,
        extensionVersion: chrome.runtime.getManifest().version,
      },
    } satisfies TargetResponse);
  };

  chrome.runtime.onMessageExternal.addListener(listener);
  return () => chrome.runtime.onMessageExternal.removeListener(listener);
}

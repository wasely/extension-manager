import { normalizeExtension, type ManagedExtension } from '../core/extensions';

export async function getManagedExtensions(): Promise<ManagedExtension[]> {
  const extensions = await chrome.management.getAll();
  return extensions.map((extension) =>
    normalizeExtension(extension, chrome.runtime.id),
  );
}

export async function setExtensionEnabled(
  extension: ManagedExtension,
  enabled: boolean,
): Promise<void> {
  if (extension.isSelf) {
    throw new Error('Extension Manager cannot disable itself.');
  }
  await chrome.management.setEnabled(extension.id, enabled);
}

export async function openOptionsPage(
  extension: ManagedExtension,
): Promise<void> {
  if (!extension.optionsUrl) {
    throw new Error(`${extension.name} does not expose an options page.`);
  }
  await chrome.tabs.create({ url: extension.optionsUrl });
}

export function subscribeToManagementChanges(listener: () => void): () => void {
  const installed = () => listener();
  const uninstalled = () => listener();
  const enabled = () => listener();
  const disabled = () => listener();

  chrome.management.onInstalled.addListener(installed);
  chrome.management.onUninstalled.addListener(uninstalled);
  chrome.management.onEnabled.addListener(enabled);
  chrome.management.onDisabled.addListener(disabled);

  return () => {
    chrome.management.onInstalled.removeListener(installed);
    chrome.management.onUninstalled.removeListener(uninstalled);
    chrome.management.onEnabled.removeListener(enabled);
    chrome.management.onDisabled.removeListener(disabled);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../entrypoints/sidepanel/style.css';

const managerId = 'gpmlcdigokplenooecjmlphknhaidnjf';
const integratedId = 'abcdefghijklmnopabcdefghijklmnop';

const extensions = [
  {
    description:
      'Developer control center for locally loaded Chrome extensions.',
    enabled: true,
    hostPermissions: [],
    icons: [],
    id: managerId,
    installType: 'development',
    isApp: false,
    mayDisable: false,
    name: 'Extension Manager',
    offlineEnabled: false,
    optionsUrl: '',
    permissions: ['management', 'nativeMessaging', 'storage', 'sidePanel'],
    shortName: 'Extension Manager',
    type: 'extension',
    version: '0.1.0',
  },
  {
    description: 'Capture and organize research from any page.',
    enabled: true,
    hostPermissions: ['https://*/*'],
    icons: [],
    id: integratedId,
    installType: 'development',
    isApp: false,
    mayDisable: true,
    name: 'Research Clipper',
    offlineEnabled: false,
    optionsUrl: 'chrome-extension://example/options.html',
    permissions: ['storage', 'tabs'],
    shortName: 'Clipper',
    type: 'extension',
    version: '2.4.1',
  },
  {
    description: 'Broadcast one prompt to several AI workspaces.',
    enabled: false,
    hostPermissions: ['https://chatgpt.com/*'],
    icons: [],
    id: 'bcdefghijklmnopabcdefghijklmnopa',
    installType: 'development',
    isApp: false,
    mayDisable: true,
    name: 'AI Broadcaster',
    offlineEnabled: false,
    optionsUrl: '',
    permissions: ['storage'],
    shortName: 'Broadcaster',
    type: 'extension',
    version: '0.8.3',
  },
  {
    description: 'Manage passwords and passkeys across devices.',
    enabled: true,
    hostPermissions: ['<all_urls>'],
    icons: [],
    id: 'cdefghijklmnopabcdefghijklmnopab',
    installType: 'normal',
    isApp: false,
    mayDisable: true,
    name: 'Password Vault',
    offlineEnabled: true,
    optionsUrl: 'chrome-extension://vault/options.html',
    permissions: ['storage'],
    shortName: 'Vault',
    type: 'extension',
    version: '7.2.0',
  },
] as unknown as chrome.management.ExtensionInfo[];

type Listener = () => void;
const managementListeners = new Set<Listener>();
const managementEvent = {
  addListener(listener: Listener) {
    managementListeners.add(listener);
  },
  removeListener(listener: Listener) {
    managementListeners.delete(listener);
  },
};

let storedPreferences: unknown = {
  favorites: [integratedId],
  filter: 'development',
  tags: { [integratedId]: ['research', 'daily'] },
  theme: 'dark',
};

const mockChrome = {
  management: {
    getAll: async () => extensions.map((extension) => ({ ...extension })),
    onDisabled: managementEvent,
    onEnabled: managementEvent,
    onInstalled: managementEvent,
    onUninstalled: managementEvent,
    setEnabled: async (id: string, enabled: boolean) => {
      const extension = extensions.find((candidate) => candidate.id === id);
      if (extension) extension.enabled = enabled;
      managementListeners.forEach((listener) => listener());
    },
  },
  runtime: {
    id: managerId,
    onMessage: {
      addListener() {},
      removeListener() {},
    },
    sendMessage: async (...args: unknown[]) => {
      if (typeof args[0] !== 'string') {
        return { error: null, status: 'connected' };
      }
      if (args[0] !== integratedId) return null;
      const request = args[1] as { requestId: string; type: string };
      if (request.type === 'RELOAD_EXTENSION') {
        return {
          accepted: true,
          ok: true,
          requestId: request.requestId,
          type: 'RELOAD_ACCEPTED',
        };
      }
      return {
        ok: true,
        requestId: request.requestId,
        target: { extensionVersion: '2.4.1', integrationVersion: '1.0.0' },
        type: 'PONG',
      };
    },
  },
  storage: {
    local: {
      get: async () => ({ extensionManagerPreferences: storedPreferences }),
      set: async (value: { extensionManagerPreferences?: unknown }) => {
        storedPreferences = value.extensionManagerPreferences;
      },
    },
  },
  tabs: {
    create: async () => undefined,
  },
};

Object.assign(globalThis.chrome, mockChrome);

const root = document.getElementById('root');
if (!root) throw new Error('Preview root was not found.');

const { default: App } = await import('../entrypoints/sidepanel/App');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

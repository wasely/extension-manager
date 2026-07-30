import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifestVersion: 3,
  manifest: {
    name: 'Extension Manager',
    description:
      'Developer control center for locally loaded Chrome extensions.',
    version: '0.1.0',
    minimum_chrome_version: '114',
    permissions: ['management', 'storage', 'sidePanel'],
    optional_permissions: ['tabs'],
    action: {
      default_title: 'Open Extension Manager',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});

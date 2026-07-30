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
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt+i91AW1ntBT6x+PzeGtXF/la7OwBT3HkjfmuwMIoj2l2Ke2Q76VQNU42gsqZKzvNN3n9y2cEwFKBVHB+tUzGEwhlIMZPZQsBhM4k0TYjL1amIrDBOQqRhVKKBta9SHpi4dLQBdDei6Q+B/SCAlwZczMj+Kh+ePMc6xk8UcZOswqWy7cpfvT8ve8q5B9TOOdlKFAurwP8BUXAnAc36l2kNGL04btL2uohaEU3Quv1PIsQab3EjTdL7A5F/8Zo2uyAcXst2vZkOMycV0YloVz5dd+qPzcOiBnFc5XqzG0KURqOG/ogs2XCDkLjWWL9z5wcU42FJSLSJSYnupTctBF2QIDAQAB',
    minimum_chrome_version: '114',
    permissions: ['management', 'nativeMessaging', 'storage', 'sidePanel'],
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

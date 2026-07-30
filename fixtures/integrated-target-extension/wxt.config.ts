import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'Extension Manager Integrated Fixture',
    description: 'Fixture proving the Extension Manager target bridge.',
    version: '0.1.0',
    externally_connectable: {
      ids: ['gpmlcdigokplenooecjmlphknhaidnjf'],
    },
  },
});

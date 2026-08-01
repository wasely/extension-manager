import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('./src/preview', import.meta.url)),
  plugins: [tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 4391,
    strictPort: true,
  },
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('./.preview', import.meta.url)),
  },
});

import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { inject } = require('postject');
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(packageRoot, 'dist');
const bundledMain = resolve(outputDirectory, 'sea-main.cjs');
const blob = resolve(outputDirectory, 'sea-prep.blob');
const executable = resolve(
  outputDirectory,
  process.platform === 'win32' ? 'native-host.exe' : 'native-host',
);
const seaConfig = resolve(outputDirectory, 'sea-config.json');

await build({
  bundle: true,
  entryPoints: [resolve(packageRoot, 'src/index.ts')],
  format: 'cjs',
  outfile: bundledMain,
  platform: 'node',
  target: 'node24',
});

await import('node:fs/promises').then(({ writeFile }) =>
  writeFile(
    seaConfig,
    JSON.stringify({
      main: bundledMain,
      output: blob,
      disableExperimentalSEAWarning: true,
      useCodeCache: false,
    }),
  ),
);

execFileSync(process.execPath, ['--experimental-sea-config', seaConfig], {
  stdio: 'inherit',
});
copyFileSync(process.execPath, executable);
await inject(executable, 'NODE_SEA_BLOB', readFileSync(blob), {
  sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
});
rmSync(blob, { force: true });
rmSync(seaConfig, { force: true });

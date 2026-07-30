import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const hostName = 'com.extension_manager.bridge';
const managerOrigin = 'chrome-extension://gpmlcdigokplenooecjmlphknhaidnjf/';
const uninstall = process.argv.includes('--uninstall');
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const launcher =
  process.platform === 'win32'
    ? resolve(scriptDirectory, '../dist/native-host.exe')
    : resolve(scriptDirectory, 'native-host.sh');

function manifestPathsForCurrentPlatform() {
  if (process.platform === 'win32') {
    return [
      resolve(
        process.env.LOCALAPPDATA ?? homedir(),
        'ExtensionManager',
        `${hostName}.json`,
      ),
    ];
  }
  if (process.platform === 'darwin') {
    return [
      resolve(
        homedir(),
        'Library/Application Support/Google/Chrome/NativeMessagingHosts',
        `${hostName}.json`,
      ),
    ];
  }
  return ['google-chrome', 'chromium'].map((browser) =>
    resolve(
      homedir(),
      `.config/${browser}/NativeMessagingHosts`,
      `${hostName}.json`,
    ),
  );
}

const manifestPaths = manifestPathsForCurrentPlatform();
const registryKey = `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${hostName}`;

if (uninstall) {
  for (const manifestPath of manifestPaths) {
    rmSync(manifestPath, { force: true });
  }
  if (process.platform === 'win32') {
    try {
      execFileSync('reg.exe', ['delete', registryKey, '/f'], {
        stdio: 'ignore',
      });
    } catch {
      // A missing registration is already uninstalled.
    }
  }
  console.error(`Removed ${hostName}.`);
  process.exit(0);
}

if (!['win32', 'darwin', 'linux'].includes(process.platform)) {
  throw new Error(`Unsupported platform: ${process.platform}`);
}

if (process.platform !== 'win32') chmodSync(launcher, 0o755);
for (const manifestPath of manifestPaths) {
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        name: hostName,
        description: 'Extension Manager local development bridge',
        path: launcher,
        type: 'stdio',
        allowed_origins: [managerOrigin],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

if (process.platform === 'win32') {
  const manifestPath = manifestPaths[0];
  if (!manifestPath) throw new Error('Native host manifest path missing.');
  execFileSync('reg.exe', [
    'add',
    registryKey,
    '/ve',
    '/t',
    'REG_SZ',
    '/d',
    manifestPath,
    '/f',
  ]);
}

console.error(`Installed ${hostName}: ${manifestPaths.join(', ')}`);

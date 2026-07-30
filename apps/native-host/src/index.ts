#!/usr/bin/env node
import { encodeNativeMessage, NativeMessageDecoder } from './framing.js';
import { handleBridgeMessage } from './host.js';

const supportedPlatforms = new Set(['win32', 'darwin', 'linux']);
if (!supportedPlatforms.has(process.platform)) {
  console.error(`Unsupported native-host platform: ${process.platform}`);
  process.exitCode = 1;
} else {
  const platform = process.platform as 'win32' | 'darwin' | 'linux';
  const startedAt = Date.now();
  const decoder = new NativeMessageDecoder();

  process.stdin.on('data', (chunk: Buffer) => {
    try {
      for (const message of decoder.push(chunk)) {
        const response = handleBridgeMessage(message, {
          now: Date.now(),
          platform,
          startedAt,
        });
        process.stdout.write(encodeNativeMessage(response));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Native protocol error: ${message}`);
      process.exitCode = 1;
    }
  });
}

import { describe, expect, it } from 'vitest';

import { encodeNativeMessage, NativeMessageDecoder } from './framing.js';

describe('native messaging framing', () => {
  it('decodes a message split across chunks', () => {
    const decoder = new NativeMessageDecoder();
    const frame = encodeNativeMessage({ type: 'PING' });

    expect(decoder.push(frame.subarray(0, 3))).toEqual([]);
    expect(decoder.push(frame.subarray(3))).toEqual([{ type: 'PING' }]);
  });

  it('decodes multiple messages in one chunk', () => {
    const decoder = new NativeMessageDecoder();
    const frames = Buffer.concat([
      encodeNativeMessage({ value: 1 }),
      encodeNativeMessage({ value: 2 }),
    ]);

    expect(decoder.push(frames)).toEqual([{ value: 1 }, { value: 2 }]);
  });

  it('rejects invalid JSON', () => {
    const decoder = new NativeMessageDecoder();
    const payload = Buffer.from('{nope', 'utf8');
    const frame = Buffer.alloc(4 + payload.length);
    frame.writeUInt32LE(payload.length, 0);
    payload.copy(frame, 4);

    expect(() => decoder.push(frame)).toThrow('invalid JSON');
  });

  it('rejects oversized frames before buffering the payload', () => {
    const decoder = new NativeMessageDecoder(32);
    const header = Buffer.alloc(4);
    header.writeUInt32LE(33, 0);

    expect(() => decoder.push(header)).toThrow('exceeds 32 bytes');
  });
});

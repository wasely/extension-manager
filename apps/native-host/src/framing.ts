const defaultMaxMessageBytes = 1024 * 1024;

export function encodeNativeMessage(value: unknown): Buffer {
  const payload = Buffer.from(JSON.stringify(value), 'utf8');
  const frame = Buffer.allocUnsafe(4 + payload.length);
  frame.writeUInt32LE(payload.length, 0);
  payload.copy(frame, 4);
  return frame;
}

export class NativeMessageDecoder {
  private buffer = Buffer.alloc(0);

  constructor(private readonly maxMessageBytes = defaultMaxMessageBytes) {}

  push(chunk: Buffer): unknown[] {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const messages: unknown[] = [];

    while (this.buffer.length >= 4) {
      const payloadLength = this.buffer.readUInt32LE(0);
      if (payloadLength > this.maxMessageBytes) {
        this.buffer = Buffer.alloc(0);
        throw new Error(
          `Native message exceeds ${this.maxMessageBytes} bytes.`,
        );
      }
      if (this.buffer.length < payloadLength + 4) break;

      const payload = this.buffer.subarray(4, payloadLength + 4);
      this.buffer = this.buffer.subarray(payloadLength + 4);
      try {
        messages.push(JSON.parse(payload.toString('utf8')) as unknown);
      } catch {
        throw new Error('Native message contains invalid JSON.');
      }
    }

    return messages;
  }
}

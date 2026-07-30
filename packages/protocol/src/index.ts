import { z } from 'zod';

export const targetNamespace = 'extension-manager';
export const targetProtocolVersion = 1;

const targetEnvelopeSchema = z.object({
  namespace: z.literal(targetNamespace),
  protocolVersion: z.literal(targetProtocolVersion),
  requestId: z.string().min(1),
});

export const targetRequestSchema = z.discriminatedUnion('type', [
  targetEnvelopeSchema.extend({ type: z.literal('PING') }),
  targetEnvelopeSchema.extend({ type: z.literal('GET_TARGET_INFO') }),
  targetEnvelopeSchema.extend({ type: z.literal('RELOAD_EXTENSION') }),
]);

export type TargetRequest = z.infer<typeof targetRequestSchema>;

export const targetInfoSchema = z.object({
  integrationVersion: z.string().min(1),
  extensionVersion: z.string().min(1),
});

export const targetResponseSchema = z.discriminatedUnion('type', [
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    type: z.literal('PONG'),
    target: targetInfoSchema,
  }),
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    type: z.literal('TARGET_INFO'),
    target: targetInfoSchema,
  }),
  z.object({
    ok: z.literal(true),
    requestId: z.string(),
    type: z.literal('RELOAD_ACCEPTED'),
    accepted: z.literal(true),
  }),
  z.object({
    ok: z.literal(false),
    requestId: z.string(),
    type: z.literal('ERROR'),
    error: z.object({
      code: z.enum(['INVALID_MESSAGE', 'UNKNOWN_ACTION']),
      message: z.string(),
    }),
  }),
]);

export type TargetResponse = z.infer<typeof targetResponseSchema>;

export function createTargetRequest(
  type: TargetRequest['type'],
  requestId: string = crypto.randomUUID(),
): TargetRequest {
  return targetRequestSchema.parse({
    namespace: targetNamespace,
    protocolVersion: targetProtocolVersion,
    requestId,
    type,
  });
}

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

export const bridgeProtocolVersion = 1;

const bridgeEnvelopeSchema = z.object({
  protocolVersion: z.literal(bridgeProtocolVersion),
  requestId: z.string().min(1),
});

const emptyPayloadSchema = z.object({});

export const bridgeRequestSchema = z.discriminatedUnion('type', [
  bridgeEnvelopeSchema.extend({
    type: z.literal('BRIDGE_HELLO'),
    payload: z.object({ managerVersion: z.string().min(1) }),
  }),
  bridgeEnvelopeSchema.extend({
    type: z.literal('BRIDGE_HEALTH'),
    payload: emptyPayloadSchema,
  }),
  bridgeEnvelopeSchema.extend({
    type: z.literal('PROJECT_LIST'),
    payload: emptyPayloadSchema,
  }),
]);

export type BridgeRequest = z.infer<typeof bridgeRequestSchema>;

export const extensionProjectSchema = z.object({
  id: z.string().uuid(),
  extensionId: z.string().min(1),
  name: z.string().min(1),
  sourceDirectory: z.string().min(1),
  extensionRoot: z.string().min(1),
  framework: z.enum(['wxt', 'plasmo', 'crxjs', 'vite', 'raw', 'unknown']),
  packageManager: z.enum(['pnpm', 'npm', 'yarn', 'bun']),
  devScript: z.string().min(1).optional(),
  buildScript: z.string().min(1).optional(),
  testScript: z.string().min(1).optional(),
  reloadStrategy: z.enum(['framework', 'message', 'manual-toggle', 'manual']),
  autoStart: z.boolean(),
  autoReload: z.boolean(),
  refreshTabs: z.enum(['off', 'active', 'matching']),
  favorite: z.boolean(),
  tags: z.array(z.string()),
  workspaceIds: z.array(z.string()),
  repositoryUrl: z.url().optional(),
  testUrls: z.array(z.url()).optional(),
});

export type ExtensionProject = z.infer<typeof extensionProjectSchema>;

export const bridgeErrorSchema = z.object({
  code: z.enum([
    'INVALID_MESSAGE',
    'INCOMPATIBLE_VERSION',
    'INTERNAL_ERROR',
    'NOT_FOUND',
  ]),
  message: z.string().min(1),
});

const bridgeResponseEnvelopeSchema = bridgeEnvelopeSchema.extend({
  success: z.boolean(),
});

export const bridgeResponseSchema = z.discriminatedUnion('type', [
  bridgeResponseEnvelopeSchema.extend({
    type: z.literal('BRIDGE_HELLO'),
    success: z.literal(true),
    payload: z.object({
      hostVersion: z.string().min(1),
      platform: z.enum(['win32', 'darwin', 'linux']),
    }),
  }),
  bridgeResponseEnvelopeSchema.extend({
    type: z.literal('BRIDGE_HEALTH'),
    success: z.literal(true),
    payload: z.object({
      status: z.literal('connected'),
      uptimeSeconds: z.number().nonnegative(),
    }),
  }),
  bridgeResponseEnvelopeSchema.extend({
    type: z.literal('PROJECT_LIST'),
    success: z.literal(true),
    payload: z.object({ projects: z.array(extensionProjectSchema) }),
  }),
  bridgeResponseEnvelopeSchema.extend({
    type: z.literal('ERROR'),
    success: z.literal(false),
    error: bridgeErrorSchema,
  }),
]);

export type BridgeResponse = z.infer<typeof bridgeResponseSchema>;

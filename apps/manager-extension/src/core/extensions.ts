import { z } from 'zod';

export const managedExtensionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string(),
  description: z.string(),
  version: z.string(),
  enabled: z.boolean(),
  installType: z.enum(['admin', 'development', 'normal', 'sideload', 'other']),
  type: z.string(),
  iconUrl: z.string().nullable(),
  optionsUrl: z.string().nullable(),
  permissions: z.array(z.string()),
  hostPermissions: z.array(z.string()),
  isSelf: z.boolean(),
});

export type ManagedExtension = z.infer<typeof managedExtensionSchema>;

export const extensionFilterSchema = z.enum([
  'development',
  'all',
  'enabled',
  'disabled',
]);

export type ExtensionFilter = z.infer<typeof extensionFilterSchema>;

function selectLargestIcon(
  icons: chrome.management.IconInfo[] | undefined,
): string | null {
  if (!icons?.length) return null;
  return (
    [...icons].sort((left, right) => right.size - left.size)[0]?.url ?? null
  );
}

export function normalizeExtension(
  extension: chrome.management.ExtensionInfo,
  managerId: string,
): ManagedExtension {
  return managedExtensionSchema.parse({
    id: extension.id,
    name: extension.name,
    shortName: extension.shortName,
    description: extension.description,
    version: extension.version,
    enabled: extension.enabled,
    installType: extension.installType,
    type: extension.type,
    iconUrl: selectLargestIcon(extension.icons),
    optionsUrl: extension.optionsUrl || null,
    permissions: extension.permissions,
    hostPermissions: extension.hostPermissions,
    isSelf: extension.id === managerId,
  });
}

interface SelectExtensionsOptions {
  extensions: ManagedExtension[];
  favorites: string[];
  filter: ExtensionFilter;
  query: string;
  tags: Record<string, string[]>;
}

export function selectExtensions({
  extensions,
  favorites,
  filter,
  query,
  tags,
}: SelectExtensionsOptions): ManagedExtension[] {
  const favoriteIds = new Set(favorites);
  const queryTokens = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return extensions
    .filter((extension) => extension.type === 'extension')
    .filter((extension) => {
      if (filter === 'development')
        return extension.installType === 'development';
      if (filter === 'enabled') return extension.enabled;
      if (filter === 'disabled') return !extension.enabled;
      return true;
    })
    .filter((extension) => {
      if (!queryTokens.length) return true;
      const haystack = [
        extension.name,
        extension.description,
        extension.id,
        ...(tags[extension.id] ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase();
      return queryTokens.every((token) => haystack.includes(token));
    })
    .sort((left, right) => {
      const favoriteDifference =
        Number(favoriteIds.has(right.id)) - Number(favoriteIds.has(left.id));
      if (favoriteDifference) return favoriteDifference;
      return left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      });
    });
}

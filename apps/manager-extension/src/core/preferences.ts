import { z } from 'zod';

import { extensionFilterSchema } from './extensions';

export const preferencesSchema = z.object({
  filter: extensionFilterSchema,
  theme: z.enum(['system', 'light', 'dark']),
  favorites: z.array(z.string()),
  tags: z.record(z.string(), z.array(z.string())),
});

export type Preferences = z.infer<typeof preferencesSchema>;

export const defaultPreferences: Preferences = {
  filter: 'development',
  theme: 'system',
  favorites: [],
  tags: {},
};

const storedPreferencesSchema = preferencesSchema.partial();
const storageKey = 'extensionManagerPreferences';

export function parsePreferences(value: unknown): Preferences {
  const result = storedPreferencesSchema.safeParse(value);
  if (!result.success) return defaultPreferences;
  return preferencesSchema.parse({ ...defaultPreferences, ...result.data });
}

export async function loadPreferences(): Promise<Preferences> {
  const result = await chrome.storage.local.get(storageKey);
  return parsePreferences(result[storageKey]);
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  await chrome.storage.local.set({
    [storageKey]: preferencesSchema.parse(preferences),
  });
}

export function toggleFavorite(
  preferences: Preferences,
  extensionId: string,
): Preferences {
  const favorites = new Set(preferences.favorites);
  if (favorites.has(extensionId)) favorites.delete(extensionId);
  else favorites.add(extensionId);
  return { ...preferences, favorites: [...favorites] };
}

export function addTag(
  preferences: Preferences,
  extensionId: string,
  input: string,
): Preferences {
  const tag = input.trim().toLocaleLowerCase();
  if (!tag) return preferences;
  const currentTags = preferences.tags[extensionId] ?? [];
  if (currentTags.includes(tag)) return preferences;
  return {
    ...preferences,
    tags: {
      ...preferences.tags,
      [extensionId]: [...currentTags, tag],
    },
  };
}

export function removeTag(
  preferences: Preferences,
  extensionId: string,
  tag: string,
): Preferences {
  return {
    ...preferences,
    tags: {
      ...preferences.tags,
      [extensionId]: (preferences.tags[extensionId] ?? []).filter(
        (candidate) => candidate !== tag,
      ),
    },
  };
}

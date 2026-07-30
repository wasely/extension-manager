import { describe, expect, it } from 'vitest';

import {
  addTag,
  defaultPreferences,
  parsePreferences,
  removeTag,
  toggleFavorite,
} from './preferences';

describe('preferences', () => {
  it('falls back safely when stored data is invalid', () => {
    expect(parsePreferences({ filter: 'made-up-filter' })).toEqual(
      defaultPreferences,
    );
  });

  it('merges valid partial stored preferences with defaults', () => {
    expect(parsePreferences({ theme: 'dark' })).toEqual({
      ...defaultPreferences,
      theme: 'dark',
    });
  });

  it('toggles favorites and normalizes unique tags', () => {
    const favorite = toggleFavorite(defaultPreferences, 'extension-id');
    const tagged = addTag(favorite, 'extension-id', '  YouTube ');
    const duplicate = addTag(tagged, 'extension-id', 'youtube');

    expect(duplicate.favorites).toEqual(['extension-id']);
    expect(duplicate.tags['extension-id']).toEqual(['youtube']);
    expect(
      removeTag(duplicate, 'extension-id', 'youtube').tags['extension-id'],
    ).toEqual([]);
  });
});

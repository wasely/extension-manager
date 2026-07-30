import { describe, expect, it } from 'vitest';

import {
  normalizeExtension,
  selectExtensions,
  type ManagedExtension,
} from './extensions';

const developmentExtension: ManagedExtension = {
  id: 'development-id',
  name: 'Developer Toolkit',
  shortName: 'Toolkit',
  description: 'Tools for local testing',
  version: '1.2.3',
  enabled: true,
  installType: 'development',
  type: 'extension',
  iconUrl: null,
  optionsUrl: null,
  permissions: ['storage'],
  hostPermissions: [],
  isSelf: false,
};

const normalExtension: ManagedExtension = {
  ...developmentExtension,
  id: 'normal-id',
  name: 'Store Extension',
  installType: 'normal',
};

describe('normalizeExtension', () => {
  it('selects the largest icon and marks the manager itself', () => {
    const normalized = normalizeExtension(
      {
        ...developmentExtension,
        icons: [
          { size: 16, url: 'small.png' },
          { size: 128, url: 'large.png' },
        ],
        mayDisable: true,
        offlineEnabled: false,
      } as unknown as chrome.management.ExtensionInfo,
      'development-id',
    );

    expect(normalized.iconUrl).toBe('large.png');
    expect(normalized.isSelf).toBe(true);
  });
});

describe('selectExtensions', () => {
  it('shows only development extensions by default', () => {
    const result = selectExtensions({
      extensions: [normalExtension, developmentExtension],
      favorites: [],
      filter: 'development',
      query: '',
      tags: {},
    });

    expect(result.map((extension) => extension.id)).toEqual(['development-id']);
  });

  it('searches tags and sorts favorites first', () => {
    const secondDevelopmentExtension: ManagedExtension = {
      ...developmentExtension,
      id: 'second-id',
      name: 'Another Tool',
    };

    const result = selectExtensions({
      extensions: [developmentExtension, secondDevelopmentExtension],
      favorites: ['development-id'],
      filter: 'all',
      query: 'youtube',
      tags: {
        'development-id': ['youtube'],
        'second-id': ['youtube'],
      },
    });

    expect(result.map((extension) => extension.id)).toEqual([
      'development-id',
      'second-id',
    ]);
  });

  it('filters enabled and disabled states independently', () => {
    const disabledExtension = {
      ...normalExtension,
      enabled: false,
    };

    expect(
      selectExtensions({
        extensions: [developmentExtension, disabledExtension],
        favorites: [],
        filter: 'disabled',
        query: '',
        tags: {},
      }),
    ).toEqual([disabledExtension]);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ManagedExtension } from '../core/extensions';
import { ExtensionCard } from './extension-card';

const extension: ManagedExtension = {
  id: 'abcdefghijklmnopabcdefghijklmnop',
  name: 'Test Extension',
  shortName: 'Test',
  description: 'Fixture extension',
  version: '1.0.0',
  enabled: true,
  installType: 'development',
  type: 'extension',
  iconUrl: null,
  optionsUrl: null,
  permissions: ['storage'],
  hostPermissions: ['https://example.com/*'],
  isSelf: false,
};

function renderCard(
  overrides: Partial<ManagedExtension> = {},
  onToggleEnabled = vi.fn(),
) {
  render(
    <ExtensionCard
      extension={{ ...extension, ...overrides }}
      favorite={false}
      onAddTag={vi.fn()}
      onRemoveTag={vi.fn()}
      onReload={vi.fn()}
      onToggleEnabled={onToggleEnabled}
      onToggleFavorite={vi.fn()}
      pending={false}
      tags={[]}
      targetState={{ integration: 'not-integrated', reload: 'current' }}
    />,
  );
  return onToggleEnabled;
}

describe('ExtensionCard', () => {
  it('reports separate Chrome and integration states', () => {
    renderCard();

    expect(screen.getByText('Chrome enabled')).toBeInTheDocument();
    expect(screen.getByText('Target not integrated')).toBeInTheDocument();
  });

  it('requests a user-initiated disable', async () => {
    const user = userEvent.setup();
    const onToggleEnabled = renderCard();

    await user.click(
      screen.getByRole('switch', { name: 'Disable Test Extension' }),
    );

    expect(onToggleEnabled).toHaveBeenCalledWith(false);
  });

  it('prevents destructive actions against the manager itself', () => {
    renderCard({ isSelf: true });

    expect(
      screen.getByRole('switch', { name: 'Disable Test Extension' }),
    ).toBeDisabled();
  });
});

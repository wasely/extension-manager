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
  integration: 'connected' | 'not-integrated' = 'not-integrated',
) {
  const onReload = vi.fn();
  const onRestart = vi.fn();
  render(
    <ExtensionCard
      extension={{ ...extension, ...overrides }}
      favorite={false}
      onAddTag={vi.fn()}
      onRemoveTag={vi.fn()}
      onReload={onReload}
      onRestart={onRestart}
      onToggleEnabled={onToggleEnabled}
      onToggleFavorite={vi.fn()}
      pending={false}
      tags={[]}
      targetState={{ integration, reload: 'current' }}
    />,
  );
  return { onReload, onRestart, onToggleEnabled };
}

describe('ExtensionCard', () => {
  it('reports separate Chrome and integration states', () => {
    renderCard();

    expect(screen.getByText('Chrome enabled')).toBeInTheDocument();
    expect(screen.getByText('Target not integrated')).toBeInTheDocument();
  });

  it('requests a user-initiated disable', async () => {
    const user = userEvent.setup();
    const { onToggleEnabled } = renderCard();

    await user.click(
      screen.getByRole('switch', { name: 'Disable Test Extension' }),
    );

    expect(onToggleEnabled).toHaveBeenCalledWith(false);
  });

  it('offers a user-initiated restart for a non-integrated extension', async () => {
    const user = userEvent.setup();
    const { onRestart } = renderCard();

    await user.click(
      screen.getByRole('button', { name: 'Restart Test Extension' }),
    );

    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('prevents destructive actions against the manager itself', () => {
    renderCard({ isSelf: true });

    expect(
      screen.getByRole('switch', { name: 'Disable Test Extension' }),
    ).toBeDisabled();
    expect(screen.queryByText('Target not integrated')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Restart Test Extension' }),
    ).not.toBeInTheDocument();
  });

  it('reloads integrated targets instead of restarting them', async () => {
    const user = userEvent.setup();
    const { onReload } = renderCard({}, vi.fn(), 'connected');

    await user.click(
      screen.getByRole('button', { name: 'Reload Test Extension' }),
    );

    expect(onReload).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('button', { name: 'Restart Test Extension' }),
    ).not.toBeInTheDocument();
  });

  it('requires a non-integrated extension to be enabled before restart', () => {
    renderCard({ enabled: false });

    expect(
      screen.getByRole('button', { name: 'Restart Test Extension' }),
    ).toBeDisabled();
  });
});

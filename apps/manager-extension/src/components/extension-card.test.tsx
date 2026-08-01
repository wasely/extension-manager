import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ManagedExtension } from '../core/extensions';
import { ExtensionCard } from './extension-card';
import { TooltipProvider } from './ui/tooltip';

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
  const onAddTag = vi.fn();
  const onReload = vi.fn();
  const onRemoveTag = vi.fn();
  const onRestart = vi.fn();
  const onToggleFavorite = vi.fn();
  render(
    <TooltipProvider>
      <ExtensionCard
        bridgeState={{ status: 'disconnected', error: null }}
        extension={{ ...extension, ...overrides }}
        favorite={false}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onReload={onReload}
        onRestart={onRestart}
        onToggleEnabled={onToggleEnabled}
        onToggleFavorite={onToggleFavorite}
        pending={false}
        tags={[]}
        targetState={{ integration, reload: 'current' }}
      />
    </TooltipProvider>,
  );
  return {
    onAddTag,
    onReload,
    onRemoveTag,
    onRestart,
    onToggleEnabled,
    onToggleFavorite,
  };
}

describe('ExtensionCard', () => {
  it('reports separate Chrome and integration states', () => {
    renderCard();

    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Needs integration')).toBeInTheDocument();
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
      screen.queryByRole('switch', { name: 'Disable Test Extension' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(screen.queryByText('Needs integration')).not.toBeInTheDocument();
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

  it('toggles the favorite action', async () => {
    const user = userEvent.setup();
    const { onToggleFavorite } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));

    expect(onToggleFavorite).toHaveBeenCalledOnce();
  });

  it('adds a tag from progressive details', async () => {
    const user = userEvent.setup();
    const { onAddTag } = renderCard();

    await user.click(
      screen.getByRole('button', { name: 'Show details for Test Extension' }),
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Add tag to Test Extension' }),
      'Research',
    );
    await user.keyboard('{Enter}');

    expect(onAddTag).toHaveBeenCalledWith('Research');
  });

  it('removes a tag from progressive details', async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();
    render(
      <TooltipProvider>
        <ExtensionCard
          bridgeState={{ status: 'connected', error: null }}
          extension={extension}
          favorite={false}
          onAddTag={vi.fn()}
          onRemoveTag={onRemoveTag}
          onReload={vi.fn()}
          onRestart={vi.fn()}
          onToggleEnabled={vi.fn()}
          onToggleFavorite={vi.fn()}
          pending={false}
          tags={['research']}
          targetState={{ integration: 'connected', reload: 'current' }}
        />
      </TooltipProvider>,
    );

    await user.click(
      screen.getByRole('button', { name: 'Show details for Test Extension' }),
    );
    await user.click(screen.getByRole('button', { name: 'research' }));

    expect(onRemoveTag).toHaveBeenCalledWith('research');
  });

  it('communicates an in-progress update', () => {
    render(
      <TooltipProvider>
        <ExtensionCard
          bridgeState={{ status: 'connecting', error: null }}
          extension={extension}
          favorite={false}
          onAddTag={vi.fn()}
          onRemoveTag={vi.fn()}
          onReload={vi.fn()}
          onRestart={vi.fn()}
          onToggleEnabled={vi.fn()}
          onToggleFavorite={vi.fn()}
          pending
          tags={[]}
          targetState={{ integration: 'checking', reload: 'current' }}
        />
      </TooltipProvider>,
    );

    expect(
      screen.getByRole('switch', { name: 'Disable Test Extension' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Restart Test Extension' }),
    ).toBeDisabled();
  });
});

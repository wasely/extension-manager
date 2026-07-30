import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ManagedExtension } from '../core/extensions';
import { restartExtension } from './management';

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
  permissions: [],
  hostPermissions: [],
  isSelf: false,
};

describe('restartExtension', () => {
  const setEnabled = vi.fn();

  beforeEach(() => {
    setEnabled.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal('chrome', { management: { setEnabled } });
  });

  it('disables and re-enables a target extension', async () => {
    await restartExtension(extension);

    expect(setEnabled).toHaveBeenNthCalledWith(1, extension.id, false);
    expect(setEnabled).toHaveBeenNthCalledWith(2, extension.id, true);
  });

  it('never restarts the manager itself', async () => {
    await expect(
      restartExtension({ ...extension, isSelf: true }),
    ).rejects.toThrow('cannot restart itself');
    expect(setEnabled).not.toHaveBeenCalled();
  });

  it('does not report success when Chrome rejects the disable', async () => {
    setEnabled.mockRejectedValueOnce(new Error('User declined'));

    await expect(restartExtension(extension)).rejects.toThrow('User declined');
    expect(setEnabled).toHaveBeenCalledOnce();
  });
});

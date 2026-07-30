import { useCallback, useEffect, useState } from 'react';

import {
  pingTarget,
  reloadTargetAndWait,
  type TargetHealth,
} from '../chrome/target';
import type { ManagedExtension } from '../core/extensions';

export interface TargetState {
  health?: TargetHealth;
  integration: 'checking' | 'connected' | 'not-integrated';
  reload: 'current' | 'reloading' | 'failed';
}

const defaultTargetState: TargetState = {
  integration: 'checking',
  reload: 'current',
};

export function useTargetIntegrations(extensions: ManagedExtension[]) {
  const [states, setStates] = useState<Record<string, TargetState>>({});

  const check = useCallback(async (extension: ManagedExtension) => {
    if (extension.isSelf || extension.installType !== 'development') return;
    setStates((current) => ({
      ...current,
      [extension.id]: {
        ...(current[extension.id] ?? defaultTargetState),
        integration: 'checking',
      },
    }));
    const health = await pingTarget(extension.id);
    setStates((current) => ({
      ...current,
      [extension.id]: health
        ? { health, integration: 'connected', reload: 'current' }
        : { integration: 'not-integrated', reload: 'current' },
    }));
  }, []);

  useEffect(() => {
    for (const extension of extensions) void check(extension);
  }, [check, extensions]);

  const reload = useCallback(async (extension: ManagedExtension) => {
    setStates((current) => ({
      ...current,
      [extension.id]: {
        ...(current[extension.id] ?? defaultTargetState),
        reload: 'reloading',
      },
    }));
    try {
      const health = await reloadTargetAndWait(extension.id);
      setStates((current) => ({
        ...current,
        [extension.id]: {
          health,
          integration: 'connected',
          reload: 'current',
        },
      }));
      return true;
    } catch {
      setStates((current) => ({
        ...current,
        [extension.id]: {
          ...(current[extension.id] ?? defaultTargetState),
          reload: 'failed',
        },
      }));
      return false;
    }
  }, []);

  return { check, reload, states };
}

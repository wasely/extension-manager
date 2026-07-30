import { useCallback, useEffect, useState } from 'react';

import {
  getManagedExtensions,
  setExtensionEnabled,
  subscribeToManagementChanges,
} from '../chrome/management';
import type { ManagedExtension } from '../core/extensions';

interface ManagedExtensionsState {
  extensions: ManagedExtension[];
  error: string | null;
  loading: boolean;
  pendingIds: Set<string>;
  refresh: () => Promise<void>;
  setEnabled: (
    extension: ManagedExtension,
    enabled: boolean,
  ) => Promise<boolean>;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Chrome rejected the request.';
}

export function useManagedExtensions(): ManagedExtensionsState {
  const [extensions, setExtensions] = useState<ManagedExtension[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const refresh = useCallback(async () => {
    try {
      const nextExtensions = await getManagedExtensions();
      setExtensions(nextExtensions);
      setError(null);
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeToManagementChanges(() => void refresh());
  }, [refresh]);

  const setEnabled = useCallback(
    async (extension: ManagedExtension, enabled: boolean) => {
      setPendingIds((current) => new Set(current).add(extension.id));
      setExtensions((current) =>
        current.map((candidate) =>
          candidate.id === extension.id ? { ...candidate, enabled } : candidate,
        ),
      );

      try {
        await setExtensionEnabled(extension, enabled);
        setError(null);
        return true;
      } catch (caughtError) {
        setError(errorMessage(caughtError));
        await refresh();
        return false;
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(extension.id);
          return next;
        });
      }
    },
    [refresh],
  );

  return { extensions, error, loading, pendingIds, refresh, setEnabled };
}

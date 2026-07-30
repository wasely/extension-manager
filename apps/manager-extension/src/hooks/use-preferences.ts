import { useCallback, useEffect, useState } from 'react';

import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from '../core/preferences';

interface PreferencesState {
  error: string | null;
  preferences: Preferences;
  ready: boolean;
  updatePreferences: (updater: (current: Preferences) => Preferences) => void;
}

export function usePreferences(): PreferencesState {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadPreferences()
      .then((storedPreferences) => {
        if (!active) return;
        setPreferences(storedPreferences);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Preferences could not be loaded. Using defaults.');
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePreferences = useCallback(
    (updater: (current: Preferences) => Preferences) => {
      setPreferences((current) => {
        const next = updater(current);
        void savePreferences(next)
          .then(() => setError(null))
          .catch(() => setError('Preferences could not be saved.'));
        return next;
      });
    },
    [],
  );

  return { error, preferences, ready, updatePreferences };
}

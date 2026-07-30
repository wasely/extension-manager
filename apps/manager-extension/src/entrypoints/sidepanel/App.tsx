import { AlertCircle, Moon, RefreshCw, Search, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ExtensionCard } from '../../components/extension-card';
import { type ExtensionFilter, selectExtensions } from '../../core/extensions';
import {
  addTag,
  removeTag,
  toggleFavorite,
  type Preferences,
} from '../../core/preferences';
import { useManagedExtensions } from '../../hooks/use-managed-extensions';
import { usePreferences } from '../../hooks/use-preferences';
import { useTargetIntegrations } from '../../hooks/use-target-integrations';

const filters: Array<{ label: string; value: ExtensionFilter }> = [
  { label: 'Development', value: 'development' },
  { label: 'All', value: 'all' },
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
];

function applyTheme(theme: Preferences['theme']) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle(
    'dark',
    theme === 'dark' || (theme === 'system' && prefersDark),
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{
    message: string;
    tone: 'success' | 'error';
  } | null>(null);
  const {
    error: preferencesError,
    preferences,
    ready,
    updatePreferences,
  } = usePreferences();
  const {
    extensions,
    error,
    loading,
    pendingIds,
    refresh,
    restart,
    setEnabled,
  } = useManagedExtensions();
  const { reload, states: targetStates } = useTargetIntegrations(extensions);

  useEffect(() => {
    applyTheme(preferences.theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme(preferences.theme);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [preferences.theme]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const visibleExtensions = useMemo(
    () =>
      selectExtensions({
        extensions,
        favorites: preferences.favorites,
        filter: preferences.filter,
        query,
        tags: preferences.tags,
      }),
    [extensions, preferences, query],
  );

  const updateFilter = (filter: ExtensionFilter) => {
    updatePreferences((current) => ({ ...current, filter }));
  };

  const cycleTheme = () => {
    updatePreferences((current) => ({
      ...current,
      theme:
        current.theme === 'system'
          ? 'dark'
          : current.theme === 'dark'
            ? 'light'
            : 'system',
    }));
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#0a0a0c] dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/92 px-3.5 pt-3 pb-3 backdrop-blur-xl dark:border-white/8 dark:bg-[#0a0a0c]/92">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-violet-600 text-[11px] font-black text-white shadow-sm shadow-violet-500/30">
              EM
            </span>
            <div>
              <h1 className="text-[13px] font-bold tracking-[-0.02em]">
                Extension Manager
              </h1>
              <p className="text-[9px] font-medium text-zinc-400">
                Developer control center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className="mr-1 inline-flex items-center gap-1.5 rounded-md border border-amber-500/15 bg-amber-500/7 px-2 py-1 text-[9px] font-medium text-amber-700 dark:text-amber-300"
              title="Native companion arrives in Slice 3"
            >
              <span className="size-1.5 rounded-full bg-amber-400" />
              Browser only
            </span>
            <button
              aria-label={`Theme: ${preferences.theme}`}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:hover:bg-white/8 dark:hover:text-zinc-100"
              onClick={cycleTheme}
              title={`Theme: ${preferences.theme}`}
              type="button"
            >
              {preferences.theme === 'dark' ? (
                <Moon size={14} />
              ) : (
                <Sun size={14} />
              )}
            </button>
            <button
              aria-label="Refresh extension list"
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:hover:bg-white/8 dark:hover:text-zinc-100"
              onClick={() => void refresh()}
              title="Refresh extension list"
              type="button"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={14} />
            </button>
          </div>
        </div>

        <div className="relative mt-3">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
            size={14}
          />
          <label className="sr-only" htmlFor="extension-search">
            Search extensions
          </label>
          <input
            autoComplete="off"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-8 pl-8 text-xs outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-violet-400 focus:ring-3 focus:ring-violet-500/10 dark:border-white/10 dark:bg-zinc-900 dark:focus:border-violet-400"
            id="extension-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, ID, or tag…"
            spellCheck={false}
            value={query}
          />
          {query && (
            <button
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100"
              onClick={() => setQuery('')}
              type="button"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div
            aria-label="Filter extensions"
            className="flex min-w-0 gap-0.5 overflow-x-auto rounded-lg bg-zinc-200/60 p-0.5 dark:bg-white/7"
            role="group"
          >
            {filters.map((filter) => (
              <button
                aria-pressed={preferences.filter === filter.value}
                className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-violet-500 ${
                  preferences.filter === filter.value
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                key={filter.value}
                onClick={() => updateFilter(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className="shrink-0 text-[9px] font-medium text-zinc-400">
            {visibleExtensions.length} shown
          </span>
        </div>
      </header>

      <section aria-busy={loading || !ready} className="p-3">
        {(error || preferencesError) && (
          <div className="mb-2.5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-700 dark:border-red-500/20 dark:bg-red-500/8 dark:text-red-300">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={13}
            />
            <span>{error ?? preferencesError}</span>
          </div>
        )}

        {(loading || !ready) && !extensions.length ? (
          <div
            aria-label="Loading extensions"
            className="grid grid-cols-1 gap-2.5 min-[720px]:grid-cols-2"
          >
            {[0, 1, 2].map((item) => (
              <div
                className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-white/8 dark:bg-zinc-900"
                key={item}
              />
            ))}
          </div>
        ) : visibleExtensions.length ? (
          <div className="grid grid-cols-1 gap-2.5 min-[720px]:grid-cols-2">
            {visibleExtensions.map((extension) => (
              <ExtensionCard
                extension={extension}
                favorite={preferences.favorites.includes(extension.id)}
                key={extension.id}
                onAddTag={(tag) =>
                  updatePreferences((current) =>
                    addTag(current, extension.id, tag),
                  )
                }
                onRemoveTag={(tag) =>
                  updatePreferences((current) =>
                    removeTag(current, extension.id, tag),
                  )
                }
                onReload={() => {
                  void reload(extension).then((success) => {
                    setNotice({
                      message: success
                        ? `${extension.name} reloaded and reachable`
                        : `${extension.name} reload timed out`,
                      tone: success ? 'success' : 'error',
                    });
                  });
                }}
                onRestart={() => {
                  void restart(extension).then((success) => {
                    setNotice({
                      message: success
                        ? `${extension.name} restarted`
                        : `${extension.name} could not restart`,
                      tone: success ? 'success' : 'error',
                    });
                  });
                }}
                onToggleEnabled={(enabled) => {
                  void setEnabled(extension, enabled).then((success) => {
                    if (success) {
                      setNotice({
                        message: `${extension.name} ${enabled ? 'enabled' : 'disabled'}`,
                        tone: 'success',
                      });
                    }
                  });
                }}
                onToggleFavorite={() =>
                  updatePreferences((current) =>
                    toggleFavorite(current, extension.id),
                  )
                }
                pending={pendingIds.has(extension.id)}
                tags={preferences.tags[extension.id] ?? []}
                targetState={
                  targetStates[extension.id] ?? {
                    integration: extension.isSelf
                      ? 'not-integrated'
                      : 'checking',
                    reload: 'current',
                  }
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-200 text-zinc-500 dark:bg-white/8 dark:text-zinc-400">
              <Search size={16} />
            </div>
            <h2 className="mt-3 text-xs font-semibold">No extensions found</h2>
            <p className="mt-1 max-w-64 text-[10px] leading-4 text-zinc-500 dark:text-zinc-400">
              Change the filter or search. Development shows only unpacked
              extensions.
            </p>
          </div>
        )}
      </section>

      {notice && (
        <div
          aria-live="polite"
          className={`fixed right-3 bottom-3 left-3 flex items-center gap-2 rounded-lg border bg-zinc-950 px-3 py-2 text-[11px] font-medium text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 ${
            notice.tone === 'success'
              ? 'border-emerald-400/20'
              : 'border-red-400/30'
          }`}
          role="status"
        >
          <span
            className={`flex size-4 items-center justify-center rounded-full text-white ${
              notice.tone === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {notice.tone === 'success' ? '✓' : '!'}
          </span>
          {notice.message}
        </div>
      )}
    </main>
  );
}

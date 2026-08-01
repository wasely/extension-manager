import {
  AlertTriangle,
  Cable,
  Laptop,
  Moon,
  RefreshCw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ExtensionCard } from '../../components/extension-card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Toast } from '../../components/ui/toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { bridgeStatusLabel } from '../../core/bridge';
import { type ExtensionFilter, selectExtensions } from '../../core/extensions';
import {
  addTag,
  removeTag,
  toggleFavorite,
  type Preferences,
} from '../../core/preferences';
import { useManagedExtensions } from '../../hooks/use-managed-extensions';
import { useNativeBridge } from '../../hooks/use-native-bridge';
import { usePreferences } from '../../hooks/use-preferences';
import { useTargetIntegrations } from '../../hooks/use-target-integrations';
import { cn } from '../../lib/utils';

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

function ThemeIcon({ theme }: { theme: Preferences['theme'] }) {
  if (theme === 'system') return <Laptop aria-hidden="true" size={13} />;
  if (theme === 'dark') return <Moon aria-hidden="true" size={13} />;
  return <Sun aria-hidden="true" size={13} />;
}

function RowSkeleton() {
  return (
    <div className="px-3 py-2.5">
      <div className="flex gap-2.5">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-2.5 w-4/5" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between pl-[42px]">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-7 w-24" />
      </div>
    </div>
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
  const bridgeState = useNativeBridge();

  useEffect(() => {
    applyTheme(preferences.theme);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme(preferences.theme);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [preferences.theme]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
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

  const extensionItems = useMemo(
    () => extensions.filter((extension) => extension.type === 'extension'),
    [extensions],
  );

  const filterCounts = useMemo<Record<ExtensionFilter, number>>(
    () => ({
      all: extensionItems.length,
      development: extensionItems.filter(
        (extension) => extension.installType === 'development',
      ).length,
      disabled: extensionItems.filter((extension) => !extension.enabled).length,
      enabled: extensionItems.filter((extension) => extension.enabled).length,
    }),
    [extensionItems],
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
    <TooltipProvider delayDuration={350}>
      <main className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color:var(--surface-translucent)] p-2 backdrop-blur-xl">
          <div className="flex items-center gap-1">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[var(--text-subtle)]"
                size={13}
              />
              <label className="sr-only" htmlFor="extension-search">
                Search extensions
              </label>
              <input
                autoComplete="off"
                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-raised)] pr-8 pl-8 text-[10px] text-[var(--text)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--text-subtle)] focus:border-violet-400 focus:ring-2 focus:ring-violet-500/12"
                id="extension-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search extensions…"
                spellCheck={false}
                value={query}
              />
              {query && (
                <button
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-subtle)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-violet-500/45"
                  onClick={() => setQuery('')}
                  type="button"
                >
                  <X aria-hidden="true" size={11} />
                </button>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  aria-label={bridgeStatusLabel(bridgeState.status)}
                  className={cn(
                    'relative flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text-subtle)]',
                    bridgeState.status === 'connected' &&
                      'text-emerald-600 dark:text-emerald-400',
                  )}
                  role="status"
                >
                  <Cable aria-hidden="true" size={13} />
                  <span
                    className={cn(
                      'absolute right-0.5 bottom-0.5 size-1.5 rounded-full ring-2 ring-[var(--surface)]',
                      bridgeState.status === 'connected'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500',
                    )}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {bridgeState.error ?? bridgeStatusLabel(bridgeState.status)}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={`Theme: ${preferences.theme}`}
                  onClick={cycleTheme}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ThemeIcon theme={preferences.theme} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Theme: {preferences.theme}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Refresh extension list"
                  onClick={() => void refresh()}
                  size="icon-sm"
                  variant="ghost"
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={loading ? 'animate-spin' : ''}
                    size={13}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh extensions</TooltipContent>
            </Tooltip>
          </div>

          <div
            aria-label="Filter extensions"
            className="scrollbar-none mt-1.5 flex gap-0.5 overflow-x-auto"
            role="group"
          >
            {filters.map((filter) => {
              const active = preferences.filter === filter.value;
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    'inline-flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-[9px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/45',
                    active
                      ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                      : 'text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-muted)]',
                  )}
                  key={filter.value}
                  onClick={() => updateFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                  <span className="tabular-nums opacity-70">
                    {filterCounts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <section aria-busy={loading || !ready} className="p-2">
          {(error || preferencesError) && (
            <div className="mb-2 flex items-start gap-2 rounded-md bg-red-500/8 p-2 text-[10px] leading-4 text-red-700 dark:text-red-300">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                size={12}
              />
              <span>{error ?? preferencesError}</span>
            </div>
          )}

          {(loading || !ready) && !extensions.length ? (
            <div
              aria-label="Loading extensions"
              className="divide-y divide-[var(--border-soft)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]"
            >
              {[0, 1, 2].map((item) => (
                <RowSkeleton key={item} />
              ))}
            </div>
          ) : visibleExtensions.length ? (
            <div className="divide-y divide-[var(--border-soft)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] shadow-sm">
              {visibleExtensions.map((extension) => (
                <ExtensionCard
                  bridgeState={bridgeState}
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
                      setNotice({
                        message: success
                          ? `${extension.name} ${enabled ? 'enabled' : 'disabled'}`
                          : `${extension.name} could not be updated`,
                        tone: success ? 'success' : 'error',
                      });
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
              <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-subtle)]">
                <Search aria-hidden="true" size={14} />
              </div>
              <h2 className="mt-2.5 text-[11px] font-semibold">
                {query ? 'No matching extensions' : 'No extensions here'}
              </h2>
              <p className="mt-1 max-w-64 text-[9px] leading-4 text-[var(--text-muted)]">
                {query
                  ? `Nothing matches “${query}”.`
                  : 'Change the filter to see other extensions.'}
              </p>
              {query && (
                <Button
                  className="mt-2.5"
                  onClick={() => setQuery('')}
                  size="sm"
                  variant="secondary"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </section>

        {notice && (
          <Toast
            message={notice.message}
            onDismiss={() => setNotice(null)}
            tone={notice.tone}
          />
        )}
      </main>
    </TooltipProvider>
  );
}

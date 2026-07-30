import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Plus,
  RotateCw,
  Star,
  X,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { openOptionsPage } from '../chrome/management';
import type { ManagedExtension } from '../core/extensions';
import type { TargetState } from '../hooks/use-target-integrations';

interface ExtensionCardProps {
  extension: ManagedExtension;
  favorite: boolean;
  pending: boolean;
  tags: string[];
  targetState: TargetState;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleFavorite: () => void;
  onReload: () => void;
  onRestart: () => void;
}

function StatusDot({ tone }: { tone: 'green' | 'muted' | 'orange' }) {
  const toneClass = {
    green: 'bg-emerald-400 shadow-[0_0_0_3px_rgb(52_211_153_/_0.12)]',
    muted: 'bg-zinc-500',
    orange: 'bg-amber-400 shadow-[0_0_0_3px_rgb(251_191_36_/_0.12)]',
  }[tone];
  return <span className={`size-1.5 shrink-0 rounded-full ${toneClass}`} />;
}

export function ExtensionCard({
  extension,
  favorite,
  pending,
  tags,
  onAddTag,
  onRemoveTag,
  onToggleEnabled,
  onToggleFavorite,
  onReload,
  onRestart,
  targetState,
}: ExtensionCardProps) {
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(extension.id);
      setCopied(true);
      setActionError(null);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setActionError('Chrome blocked clipboard access.');
    }
  };

  const submitTag = (event: FormEvent) => {
    event.preventDefault();
    if (!tagInput.trim()) return;
    onAddTag(tagInput);
    setTagInput('');
  };

  return (
    <article className="group rounded-lg border border-zinc-200/80 bg-white p-3 shadow-sm shadow-zinc-950/5 transition-[border-color,box-shadow] duration-150 hover:border-zinc-300 hover:shadow-md dark:border-white/8 dark:bg-zinc-900/75 dark:shadow-black/20 dark:hover:border-white/15">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-500 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">
          {extension.iconUrl ? (
            <img
              alt=""
              className="size-8 object-contain"
              src={extension.iconUrl}
            />
          ) : (
            extension.name.slice(0, 1).toLocaleUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-zinc-950 dark:text-zinc-50">
                  {extension.name}
                </h2>
                {extension.isSelf && (
                  <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-violet-600 uppercase dark:text-violet-300">
                    Manager
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                v{extension.version} · {extension.installType}
              </p>
            </div>

            <button
              aria-label={
                favorite ? 'Remove from favorites' : 'Add to favorites'
              }
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:hover:bg-white/7"
              onClick={onToggleFavorite}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
              type="button"
            >
              <Star
                aria-hidden="true"
                className={favorite ? 'fill-amber-400 text-amber-400' : ''}
                size={15}
              />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <StatusDot tone={extension.enabled ? 'green' : 'muted'} />
              Chrome {extension.enabled ? 'enabled' : 'disabled'}
            </span>
            {!extension.isSelf && (
              <span className="inline-flex items-center gap-1.5">
                <StatusDot
                  tone={
                    targetState.integration === 'connected' ? 'green' : 'orange'
                  }
                />
                Target{' '}
                {targetState.integration === 'connected'
                  ? 'integrated'
                  : targetState.integration === 'checking'
                    ? 'checking'
                    : 'not integrated'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2.5 dark:border-white/7">
        <button
          aria-checked={extension.enabled}
          aria-label={`${extension.enabled ? 'Disable' : 'Enable'} ${extension.name}`}
          className="inline-flex h-7 shrink-0 items-center gap-2 rounded-lg border border-zinc-200 px-2.5 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
          disabled={pending || extension.isSelf}
          onClick={() => onToggleEnabled(!extension.enabled)}
          role="switch"
          title={
            extension.isSelf
              ? 'Extension Manager cannot disable itself'
              : `${extension.enabled ? 'Disable' : 'Enable'} extension`
          }
          type="button"
        >
          <span
            className={`relative h-3.5 w-6 shrink-0 rounded-full transition-colors ${
              extension.enabled
                ? 'bg-emerald-500'
                : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`absolute top-0.5 size-2.5 rounded-full bg-white shadow-sm transition-transform ${
                extension.enabled ? 'translate-x-3' : 'translate-x-0.5'
              }`}
            />
          </span>
          {pending ? 'Updating…' : extension.enabled ? 'Enabled' : 'Disabled'}
        </button>

        {extension.optionsUrl && (
          <button
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-zinc-400 dark:hover:bg-white/7 dark:hover:text-zinc-100"
            onClick={() =>
              void openOptionsPage(extension).catch(() => {
                setActionError('Chrome could not open this options page.');
              })
            }
            title="Open options page"
            type="button"
          >
            <ExternalLink aria-hidden="true" size={13} />
            Options
          </button>
        )}
        {!extension.isSelf && (
          <button
            aria-label={`${targetState.integration === 'connected' ? 'Reload' : 'Restart'} ${extension.name}`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/7 dark:hover:text-zinc-100"
            disabled={
              pending ||
              targetState.reload === 'reloading' ||
              (targetState.integration !== 'connected' && !extension.enabled)
            }
            onClick={
              targetState.integration === 'connected' ? onReload : onRestart
            }
            title={
              targetState.integration === 'connected'
                ? 'Reload extension through its target bridge'
                : !extension.enabled
                  ? 'Enable the extension before restarting it'
                  : 'Restart extension by disabling and re-enabling it'
            }
            type="button"
          >
            <RotateCw
              aria-hidden="true"
              className={
                targetState.reload === 'reloading' ? 'animate-spin' : ''
              }
              size={13}
            />
            {targetState.reload === 'reloading'
              ? 'Reloading…'
              : targetState.integration === 'connected'
                ? 'Reload'
                : 'Restart'}
          </button>
        )}
      </div>

      {actionError && (
        <p
          className="mt-2 rounded-md bg-red-500/8 px-2 py-1.5 text-[10px] text-red-600 dark:text-red-300"
          role="alert"
        >
          {actionError}
        </p>
      )}

      <details className="mt-2 group/details">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md py-1 text-[10px] font-medium text-zinc-400 outline-none hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
          Details and capability status
          <ChevronDown
            aria-hidden="true"
            className="transition-transform group-open/details:rotate-180"
            size={13}
          />
        </summary>

        <div className="mt-2 space-y-3 rounded-lg bg-zinc-50 p-2.5 dark:bg-black/15">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
            <dt className="text-zinc-400">Dev process</dt>
            <dd className="text-right text-zinc-600 dark:text-zinc-300">
              Unavailable · bridge offline
            </dd>
            <dt className="text-zinc-400">Build</dt>
            <dd className="text-right text-zinc-600 dark:text-zinc-300">
              Unavailable · project not paired
            </dd>
            <dt className="text-zinc-400">Reload</dt>
            <dd className="text-right text-zinc-600 dark:text-zinc-300">
              {extension.isSelf
                ? 'Manager protected'
                : targetState.integration !== 'connected'
                  ? 'Manual restart available'
                  : targetState.reload === 'failed'
                    ? 'Failed · target did not return'
                    : targetState.reload === 'reloading'
                      ? 'Reloading · waiting for PING'
                      : 'Current · target reachable'}
            </dd>
            <dt className="text-zinc-400">Permissions</dt>
            <dd className="text-right text-zinc-600 dark:text-zinc-300">
              {extension.permissions.length} API ·{' '}
              {extension.hostPermissions.length} host
            </dd>
          </dl>

          <div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-[9px] text-zinc-500 dark:text-zinc-400">
                {extension.id}
              </code>
              <button
                aria-label="Copy extension ID"
                className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-violet-500 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                onClick={() => void copyId()}
                title="Copy extension ID"
                type="button"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <button
                className="inline-flex items-center gap-1 rounded-md bg-zinc-200/70 px-1.5 py-1 text-[9px] font-medium text-zinc-600 hover:bg-red-100 hover:text-red-600 dark:bg-white/8 dark:text-zinc-300 dark:hover:bg-red-500/15 dark:hover:text-red-300"
                key={tag}
                onClick={() => onRemoveTag(tag)}
                title={`Remove ${tag} tag`}
                type="button"
              >
                {tag}
                <X aria-hidden="true" size={9} />
              </button>
            ))}
            <form className="flex min-w-24 flex-1" onSubmit={submitTag}>
              <label className="sr-only" htmlFor={`tag-${extension.id}`}>
                Add tag to {extension.name}
              </label>
              <div className="flex h-6 w-full items-center rounded-md border border-zinc-200 bg-white px-1.5 focus-within:border-violet-400 dark:border-white/10 dark:bg-zinc-900">
                <Plus aria-hidden="true" className="text-zinc-400" size={10} />
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 text-[9px] text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
                  id={`tag-${extension.id}`}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Add tag"
                  value={tagInput}
                />
              </div>
            </form>
          </div>
        </div>
      </details>
    </article>
  );
}

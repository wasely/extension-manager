import {
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  Plus,
  RotateCw,
  Settings2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import {
  type FormEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';

import { openOptionsPage } from '../chrome/management';
import type { BridgeState } from '../core/bridge';
import type { ManagedExtension } from '../core/extensions';
import type { TargetState } from '../hooks/use-target-integrations';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ExtensionCardProps {
  extension: ManagedExtension;
  favorite: boolean;
  pending: boolean;
  tags: string[];
  targetState: TargetState;
  bridgeState: BridgeState;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleFavorite: () => void;
  onReload: () => void;
  onRestart: () => void;
}

function ActionTooltip({
  children,
  label,
}: {
  children: ReactElement;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function StatusText({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'success' | 'warning' | 'muted';
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full',
          tone === 'success' && 'bg-emerald-500',
          tone === 'warning' && 'bg-amber-500',
          tone === 'muted' && 'bg-zinc-400 dark:bg-zinc-600',
        )}
      />
      {children}
    </span>
  );
}

export function ExtensionCard({
  extension,
  bridgeState,
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const integrated = targetState.integration === 'connected';
  const reloading = targetState.reload === 'reloading';

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

  const actionLabel = integrated ? 'Reload' : 'Restart';
  const actionTitle = integrated
    ? 'Reload through the target bridge'
    : !extension.enabled
      ? 'Enable this extension before restarting it'
      : 'Restart by disabling and re-enabling the extension';

  return (
    <article className="px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]/45">
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-bold text-[var(--text-muted)] shadow-sm">
          {extension.iconUrl ? (
            <img
              alt=""
              className="size-7 object-contain"
              src={extension.iconUrl}
            />
          ) : (
            extension.name.slice(0, 1).toLocaleUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-[12px] font-semibold tracking-[-0.01em] text-[var(--text)]">
              {extension.name}
            </h2>
            {extension.isSelf && (
              <Badge className="h-4 px-1 text-[8px]" tone="accent">
                Manager
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
            v{extension.version}
          </p>
          {extension.description && (
            <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-[var(--text-muted)]">
              {extension.description}
            </p>
          )}
        </div>

        <div className="-mt-0.5 -mr-1 flex shrink-0 items-center">
          <ActionTooltip
            label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Button
              aria-label={
                favorite ? 'Remove from favorites' : 'Add to favorites'
              }
              onClick={onToggleFavorite}
              size="icon-sm"
              variant="ghost"
            >
              <Star
                aria-hidden="true"
                className={cn(
                  favorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-[var(--text-subtle)]',
                )}
                size={13}
              />
            </Button>
          </ActionTooltip>

          {extension.optionsUrl && (
            <ActionTooltip label="Open options">
              <Button
                aria-label={`Open options for ${extension.name}`}
                onClick={() =>
                  void openOptionsPage(extension).catch(() => {
                    setActionError('Chrome could not open this options page.');
                  })
                }
                size="icon-sm"
                variant="ghost"
              >
                <ExternalLink aria-hidden="true" size={13} />
              </Button>
            </ActionTooltip>
          )}

          <ActionTooltip label={detailsOpen ? 'Hide details' : 'Show details'}>
            <Button
              aria-expanded={detailsOpen}
              aria-label={`${detailsOpen ? 'Hide' : 'Show'} details for ${extension.name}`}
              onClick={() => setDetailsOpen((current) => !current)}
              size="icon-sm"
              variant="ghost"
            >
              <Settings2 aria-hidden="true" size={13} />
            </Button>
          </ActionTooltip>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pl-[42px]">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <StatusText tone={extension.enabled ? 'success' : 'muted'}>
            <span className="sr-only">Chrome </span>
            {extension.enabled ? 'Enabled' : 'Disabled'}
          </StatusText>
          {!extension.isSelf && (
            <StatusText
              tone={
                integrated
                  ? 'success'
                  : targetState.integration === 'checking'
                    ? 'muted'
                    : 'warning'
              }
            >
              <span className="sr-only">Target </span>
              {integrated
                ? 'Integrated'
                : targetState.integration === 'checking'
                  ? 'Checking'
                  : 'Needs integration'}
            </StatusText>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {extension.isSelf ? (
            <span className="inline-flex h-6 items-center gap-1 text-[9px] font-medium text-[var(--text-subtle)]">
              <ShieldCheck aria-hidden="true" size={11} />
              Protected
            </span>
          ) : (
            <ActionTooltip
              label={`${extension.enabled ? 'Disable' : 'Enable'} ${extension.name}`}
            >
              <Switch
                aria-label={`${extension.enabled ? 'Disable' : 'Enable'} ${extension.name}`}
                checked={extension.enabled}
                disabled={pending}
                onCheckedChange={onToggleEnabled}
              />
            </ActionTooltip>
          )}

          {!extension.isSelf && (
            <Button
              aria-label={`${actionLabel} ${extension.name}`}
              className="min-w-[70px]"
              disabled={
                pending ||
                reloading ||
                (targetState.integration !== 'connected' && !extension.enabled)
              }
              onClick={integrated ? onReload : onRestart}
              size="sm"
              title={actionTitle}
              variant="secondary"
            >
              {reloading ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={12}
                />
              ) : (
                <RotateCw aria-hidden="true" size={12} />
              )}
              {reloading ? 'Working…' : actionLabel}
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div
          className="mt-2 ml-[42px] flex items-center justify-between gap-2 rounded-md bg-red-500/8 px-2 py-1.5 text-[10px] text-red-700 dark:text-red-300"
          role="alert"
        >
          <span>{actionError}</span>
          <button
            aria-label="Dismiss error"
            className="shrink-0 rounded p-0.5 hover:bg-red-500/10"
            onClick={() => setActionError(null)}
            type="button"
          >
            <X aria-hidden="true" size={11} />
          </button>
        </div>
      )}

      {detailsOpen && (
        <div className="mt-2.5 ml-[42px] space-y-2.5 border-t border-[var(--border-soft)] pt-2.5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[9px]">
            <dt className="text-[var(--text-subtle)]">Dev process</dt>
            <dd className="text-right text-[var(--text-muted)]">
              {bridgeState.status === 'connected'
                ? 'Bridge connected'
                : `Unavailable · ${bridgeState.status}`}
            </dd>
            <dt className="text-[var(--text-subtle)]">Build</dt>
            <dd className="text-right text-[var(--text-muted)]">Not paired</dd>
            <dt className="text-[var(--text-subtle)]">Reload</dt>
            <dd className="text-right text-[var(--text-muted)]">
              {extension.isSelf
                ? 'Manager protected'
                : !integrated
                  ? 'Manual restart'
                  : targetState.reload === 'failed'
                    ? 'Target unavailable'
                    : reloading
                      ? 'Waiting for target'
                      : 'Target reachable'}
            </dd>
            <dt className="text-[var(--text-subtle)]">Permissions</dt>
            <dd className="text-right text-[var(--text-muted)]">
              {extension.permissions.length} API ·{' '}
              {extension.hostPermissions.length} host
            </dd>
          </dl>

          <div className="flex h-7 items-center gap-2 rounded-md bg-[var(--surface-muted)] px-2">
            <code className="min-w-0 flex-1 truncate text-[8px] text-[var(--text-muted)]">
              {extension.id}
            </code>
            <Button
              aria-label="Copy extension ID"
              onClick={() => void copyId()}
              size="icon-sm"
              variant="ghost"
            >
              {copied ? (
                <Check
                  aria-hidden="true"
                  className="text-emerald-500"
                  size={11}
                />
              ) : (
                <Copy aria-hidden="true" size={11} />
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <button
                className="inline-flex h-6 items-center gap-1 rounded-md bg-[var(--surface-muted)] px-1.5 text-[8px] font-medium text-[var(--text-muted)] hover:bg-red-500/8 hover:text-red-600 dark:hover:text-red-300"
                key={tag}
                onClick={() => onRemoveTag(tag)}
                title={`Remove ${tag} tag`}
                type="button"
              >
                {tag}
                <X aria-hidden="true" size={8} />
              </button>
            ))}
            <form className="min-w-28 flex-1" onSubmit={submitTag}>
              <label className="sr-only" htmlFor={`tag-${extension.id}`}>
                Add tag to {extension.name}
              </label>
              <div className="flex h-6 items-center rounded-md bg-[var(--surface-muted)] px-2 focus-within:ring-2 focus-within:ring-violet-500/30">
                <Plus
                  aria-hidden="true"
                  className="text-[var(--text-subtle)]"
                  size={10}
                />
                <input
                  className="min-w-0 flex-1 bg-transparent px-1 text-[9px] text-[var(--text)] outline-none placeholder:text-[var(--text-subtle)]"
                  id={`tag-${extension.id}`}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Add tag"
                  value={tagInput}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

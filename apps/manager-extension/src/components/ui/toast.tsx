import { AlertCircle, CheckCircle2, X } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  tone: 'success' | 'error';
}

export function Toast({ message, onDismiss, tone }: ToastProps) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div
      aria-live="polite"
      className={cn(
        'fixed right-3 bottom-3 left-3 z-50 flex min-h-10 items-center gap-2.5 rounded-lg border bg-zinc-950 px-3 py-2 text-[11px] font-medium text-white shadow-2xl shadow-black/25 dark:bg-zinc-100 dark:text-zinc-900',
        tone === 'success' ? 'border-emerald-400/30' : 'border-red-400/35',
      )}
      role="status"
    >
      <Icon
        aria-hidden="true"
        className={tone === 'success' ? 'text-emerald-400' : 'text-red-400'}
        size={15}
      />
      <span className="min-w-0 flex-1">{message}</span>
      <Button
        aria-label="Dismiss notification"
        className="-mr-1 text-zinc-400 hover:bg-white/10 hover:text-white dark:hover:bg-black/8 dark:hover:text-zinc-950"
        onClick={onDismiss}
        size="icon-sm"
        variant="ghost"
      >
        <X aria-hidden="true" size={13} />
      </Button>
    </div>
  );
}

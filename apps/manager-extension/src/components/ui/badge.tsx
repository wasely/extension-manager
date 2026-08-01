import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-1.5 text-[9px] font-semibold leading-none',
  {
    variants: {
      tone: {
        neutral:
          'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
        accent:
          'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
        success:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        warning:
          'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        danger:
          'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, tone }))} {...props} />;
}

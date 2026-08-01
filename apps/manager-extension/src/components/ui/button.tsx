import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-violet-600 text-white shadow-sm shadow-violet-950/15 hover:bg-violet-500',
        secondary:
          'border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] shadow-sm hover:bg-[var(--surface-hover)]',
        ghost:
          'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
        danger:
          'bg-red-600 text-white shadow-sm shadow-red-950/15 hover:bg-red-500',
      },
      size: {
        sm: 'h-7 px-2 text-[11px]',
        md: 'h-8 px-2.5 text-xs',
        icon: 'size-8 p-0',
        'icon-sm': 'size-7 p-0',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, type = 'button', variant, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ className, size, variant }))}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

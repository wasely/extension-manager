import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';

import { cn } from '../../lib/utils';

export function Switch({
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-4 w-7 shrink-0 items-center rounded-full border border-transparent bg-zinc-300 shadow-inner outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/45 disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-emerald-500 dark:bg-zinc-700',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-3 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrimitive.Root>
  );
}

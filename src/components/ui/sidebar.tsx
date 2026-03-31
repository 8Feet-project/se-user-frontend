import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside className={cn('relative flex min-h-[calc(100vh-4rem)] flex-col rounded-[32px] border border-slate-200/90 bg-white/95 p-6 shadow-sm shadow-slate-200/50', className)} {...props}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-5 border-b border-slate-200/80 pb-5', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-5 flex-1 min-h-0 space-y-6 overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t border-slate-200/80 pt-5', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-xs uppercase tracking-[0.28em] text-slate-500', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl', className)} {...props}>
      {children}
    </div>
  );
}

const menuButtonVariants = cva(
  'flex w-full items-center rounded-2xl px-4 py-3 text-sm font-medium transition',
  {
    variants: {
      active: {
        true: 'bg-slate-950 text-white',
        false: 'text-slate-700 hover:bg-slate-100',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof menuButtonVariants> {
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(menuButtonVariants({ active }), className)} {...props} />;
  }
);

SidebarMenuButton.displayName = 'SidebarMenuButton';

export function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('absolute right-0 top-0 h-full w-px bg-slate-200/70', className)} {...props} />;
}

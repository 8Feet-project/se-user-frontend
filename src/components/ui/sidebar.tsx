import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        'relative flex min-h-[calc(100vh-4rem)] flex-col rounded-[32px] border border-[rgba(99,202,183,0.14)] bg-[#07111f]/90 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-5 border-b border-[rgba(99,202,183,0.08)] pb-5', className)} {...props}>{children}</div>;
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-5 flex min-h-0 flex-1 space-y-6 overflow-hidden', className)} {...props}>{children}</div>;
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-t border-[rgba(99,202,183,0.08)] pt-5', className)} {...props}>{children}</div>;
}

export function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props}>{children}</div>;
}

export function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500', className)} {...props}>{children}</div>;
}

export function SidebarGroupContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props}>{children}</div>;
}

export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props}>{children}</div>;
}

export function SidebarMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl', className)} {...props}>{children}</div>;
}

const menuButtonVariants = cva('flex w-full items-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150', {
  variants: {
    active: {
      true: 'border-[rgba(99,202,183,0.24)] bg-[rgba(99,202,183,0.1)] text-[#63cab7]',
      false: 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
    },
  },
  defaultVariants: {
    active: false,
  },
});

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
  return <div className={cn('absolute right-0 top-0 h-full w-px bg-[rgba(99,202,183,0.08)]', className)} {...props} />;
}

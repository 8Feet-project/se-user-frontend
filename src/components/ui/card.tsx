import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glow' | 'glass';
type CardPadding = 'none' | 'md' | 'lg';

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  glow: 'card-glow',
  glass: 'glass-card',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  md: 'p-5',
  lg: 'p-6 sm:p-8',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

export function Card({ className, variant = 'default', padding = 'lg', ...props }: CardProps) {
  return <div className={cn(variantClasses[variant], paddingClasses[padding], className)} {...props} />;
}

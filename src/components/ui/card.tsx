import { type HtmlHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'card p-8',
        className
      )}
      {...props}
    />
  );
}

import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

import brandIcon from '../../../image/icon.png';

interface BrandLinkProps {
  to?: string;
  title: string;
  subtitle?: string;
  className?: string;
  badgeClassName?: string;
  textClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function BrandLink({
  to = '/welcome',
  title,
  subtitle,
  className,
  badgeClassName,
  textClassName,
  titleClassName,
  subtitleClassName,
}: BrandLinkProps) {
  return (
    <Link to={to} className={cn('flex min-w-0 items-center gap-3', className)}>
      <span className={cn('brand-mark shrink-0 overflow-hidden', badgeClassName)}>
        <img src={brandIcon} alt="" aria-hidden="true" className="block h-full w-full object-contain" />
      </span>
      <span className={cn('min-w-0 flex flex-col overflow-hidden', textClassName)}>
        <span className={titleClassName}>{title}</span>
        {subtitle ? <span className={subtitleClassName}>{subtitle}</span> : null}
      </span>
    </Link>
  );
}

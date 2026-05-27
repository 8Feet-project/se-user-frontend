import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

import brandIcon from '../../../image/icon.png';
import brandIconDark from '../../../image/icon_dark.png';
import { useTheme } from './ThemeProvider';

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
  const { theme } = useTheme();
  const currentIcon = theme === 'day' ? brandIcon : brandIconDark;

  return (
    <Link to={to} className={cn('flex min-w-0 items-center gap-3', className)}>
      <span className={cn('shrink-0', badgeClassName)}>
        <img src={currentIcon} alt="" aria-hidden="true" className="block h-full w-full object-contain" />
      </span>
      <span className={cn('min-w-0 flex flex-col overflow-hidden', textClassName)}>
        <span className={titleClassName}>{title}</span>
        {subtitle ? <span className={subtitleClassName}>{subtitle}</span> : null}
      </span>
    </Link>
  );
}

import { cn } from '@/lib/utils';

export type AuthorityBadgeTone = 'primary' | 'strong' | 'standard' | 'caution' | 'weak';

export interface AuthorityBadgeProps {
  label?: string | null;
  score?: number | string | null;
  tier?: string | null;
  reason?: string | null;
  className?: string;
}

const scoreLabels: Record<number, string> = {
  5: '官方/一手来源',
  4: '专业高可信来源',
  3: '主流可参考来源',
  2: '二手待核验来源',
  1: '低可信线索来源',
};

const toneClasses: Record<AuthorityBadgeTone, string> = {
  primary: 'border-emerald-300/45 bg-emerald-400/12 text-emerald-100',
  strong: 'border-sky-300/45 bg-sky-400/12 text-sky-100',
  standard: 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100',
  caution: 'border-amber-300/40 bg-amber-400/12 text-amber-100',
  weak: 'border-rose-300/35 bg-rose-400/10 text-rose-100',
};

function scoreToTier(score?: number | string | null) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) {
    return 0;
  }
  if (numericScore <= 5) {
    return Math.max(1, Math.min(5, Math.round(numericScore)));
  }
  if (numericScore >= 90) return 5;
  if (numericScore >= 75) return 4;
  if (numericScore >= 55) return 3;
  if (numericScore >= 35) return 2;
  return 1;
}

export function authorityLabelFromSignal(input: Pick<AuthorityBadgeProps, 'label' | 'score' | 'tier'>) {
  if (input.label?.trim()) {
    return input.label.trim();
  }
  const tier = scoreToTier(input.score);
  if (tier) {
    return scoreLabels[tier] ?? '';
  }
  return input.tier?.trim() ?? '';
}

export function authorityToneFromSignal(input: Pick<AuthorityBadgeProps, 'label' | 'score' | 'tier'>): AuthorityBadgeTone {
  const label = authorityLabelFromSignal(input);
  if (label.includes('官方') || label.includes('一手')) return 'primary';
  if (label.includes('专业') || label.includes('高可信')) return 'strong';
  if (label.includes('主流') || label.includes('参考')) return 'standard';
  if (label.includes('二手') || label.includes('核验')) return 'caution';
  if (label.includes('低可信') || label.includes('线索')) return 'weak';

  const tier = scoreToTier(input.score);
  if (tier >= 5) return 'primary';
  if (tier === 4) return 'strong';
  if (tier === 3) return 'standard';
  if (tier === 2) return 'caution';
  return 'weak';
}

export function AuthorityBadge({ label, score, tier, reason, className }: AuthorityBadgeProps) {
  const resolvedLabel = authorityLabelFromSignal({ label, score, tier });
  if (!resolvedLabel) {
    return null;
  }

  const tone = authorityToneFromSignal({ label: resolvedLabel, score, tier });

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5',
        toneClasses[tone],
        className
      )}
      title={reason?.trim() || resolvedLabel}
      aria-label={resolvedLabel}
    >
      {resolvedLabel}
    </span>
  );
}

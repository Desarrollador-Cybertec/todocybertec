import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_COLORS = {
  gray: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
  blue: 'bg-cyber-radar/5 dark:bg-cyber-radar/20/30 text-cyber-radar dark:text-cyber-radar-light ring-cyber-radar/20 dark:ring-cyber-radar/30',
  green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-800',
  yellow: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 ring-purple-200 dark:ring-purple-800',
  orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-orange-200 dark:ring-orange-800',
  indigo: 'bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-cyber-navy dark:text-cyber-radar-light ring-cyber-navy/20 dark:ring-cyber-navy/30',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800',
} as const;

export function Badge({ children, variant = 'gray', size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${BADGE_COLORS[variant]} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
}

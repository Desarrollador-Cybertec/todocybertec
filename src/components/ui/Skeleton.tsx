import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-sm bg-linear-to-r from-slate-200 dark:from-white/5 via-slate-100 dark:via-white/10 to-slate-200 dark:to-white/5 bg-size-[200%_100%] ${className}`} />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-sm" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito ${className}`}>
      <div className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-6 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className={`h-3.5 ${j === 0 ? 'w-40' : 'w-20'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <SkeletonStatCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <SkeletonText lines={5} />
        </div>
        <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <SkeletonText lines={5} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
        <Skeleton className="mb-4 h-7 w-2/3" />
        <Skeleton className="mb-6 h-4 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito px-6 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' };
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-cyber-radar border-t-transparent ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

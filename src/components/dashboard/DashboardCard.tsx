import { FadeIn } from '../ui';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

export function DashboardCard({ title, children, delay = 0 }: DashboardCardProps) {
  return (
    <FadeIn delay={delay} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6">
      <h3 className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-cyber-radar">{title}</h3>
      {children}
    </FadeIn>
  );
}

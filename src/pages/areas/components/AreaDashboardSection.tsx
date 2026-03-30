import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../../../api/dashboard';
import { TASK_STATUS_LABELS } from '../../../types/enums';
import type { AreaDashboard } from '../../../types';
import { FadeIn, Badge, STATUS_BADGE_VARIANT, SkeletonCard } from '../../../components/ui';

interface AreaDashboardSectionProps {
  areaId: number;
  refreshKey: number;
}

export function AreaDashboardSection({ areaId, refreshKey }: AreaDashboardSectionProps) {
  const [dashboard, setDashboard] = useState<AreaDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardApi.area(areaId);
      setDashboard(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="mt-6 rounded-sm border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
        Error al cargar las métricas del área.
        <button type="button" onClick={load} className="ml-2 underline hover:text-red-800 dark:hover:text-red-200">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <FadeIn delay={0.1} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Tareas por estado</h3>
        <div className="space-y-2.5">
          {Object.entries(dashboard.tasks_by_status ?? {}).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <Badge variant={STATUS_BADGE_VARIANT[status] ?? 'gray'} size="sm">{TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] ?? status}</Badge>
              <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.15} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Métricas</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Tasa de cumplimiento</span>
            <span className="rounded-lg bg-green-50 dark:bg-green-900/30 px-2 py-0.5 font-semibold text-green-700 dark:text-green-400">{dashboard.completion_rate ?? 0}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Vencidas</span>
            <span className="rounded-lg bg-red-50 dark:bg-red-900/30 px-2 py-0.5 font-semibold text-red-600 dark:text-red-400">{dashboard.overdue_tasks ?? 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Sin avance</span>
            <span className="rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">{dashboard.without_progress ?? 0}</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

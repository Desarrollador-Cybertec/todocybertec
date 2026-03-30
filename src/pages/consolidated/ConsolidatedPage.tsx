import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../api/dashboard';
import type { ConsolidatedDashboard, ConsolidatedArea } from '../../types';
import { TASK_STATUS_LABELS } from '../../types/enums';
import { PageTransition, FadeIn, SkeletonStatCards, SkeletonTable, Badge, STATUS_BADGE_VARIANT } from '../../components/ui';

export function ConsolidatedPage() {
  const [data, setData] = useState<ConsolidatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.consolidated()
      .then((res) => setData(res as ConsolidatedDashboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
        <SkeletonStatCards />
        <SkeletonTable />
      </div>
    );
  }

  if (!data) return <p className="text-slate-500 dark:text-slate-400">No se pudo cargar el consolidado.</p>;

  const { summary } = data;

  const statCards = [
    { label: 'Total', value: summary.total_tasks, bg: 'bg-slate-50 dark:bg-white/5', text: 'text-slate-900 dark:text-white' },
    { label: 'Completadas', value: summary.total_completed, bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    { label: 'Activas', value: summary.total_active, bg: 'bg-cyber-radar/10 dark:bg-cyber-radar/10', text: 'text-cyber-radar dark:text-cyber-radar-light' },
    { label: 'Vencidas', value: summary.total_overdue, bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    { label: 'Cumplimiento', value: `${summary.global_completion_rate}%`, bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  ];

  const areas = data.by_area ?? [];

  return (
    <PageTransition>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Dashboard Consolidado</h2>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-sm ${card.bg} p-4 text-center ring-1 ring-inset ring-slate-900/5 dark:ring-slate-100/10`}
          >
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {areas.length === 0 ? (
        <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-8 text-center shadow-sm">
          <p className="text-slate-400 dark:text-slate-500">No hay áreas con datos para mostrar.</p>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2} className="space-y-3">
          {areas.map((area: ConsolidatedArea, i) => {
            const rateColor = area.completion_rate >= 80
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : area.completion_rate >= 50
              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400';

            const byStatus: Record<string, number> = Array.isArray(area.by_status) ? {} : (area.by_status as Record<string, number>) ?? {};
            const completedCount = byStatus['completed'] ?? 0;
            const statusEntries = Object.entries(byStatus).filter(([, c]) => c > 0);

            return (
              <motion.div
                key={area.area_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-4 shadow-sm transition-colors hover:border-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-sm font-bold text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light">
                      {area.area_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{area.area_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {area.manager ? `Encargado: ${area.manager}` : 'Sin encargado'}
                        {area.process_identifier ? ` · ${area.process_identifier}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${rateColor}`}>
                    {area.completion_rate}% cumplimiento
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-sm bg-slate-50 dark:bg-white/5 px-3 py-2 text-center text-slate-700 dark:text-slate-300">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{area.total}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Total</p>
                  </div>
                  <div className="rounded-sm bg-green-50/60 dark:bg-green-900/20 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{completedCount}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Completadas</p>
                  </div>
                  <div className="rounded-sm bg-red-50/60 dark:bg-red-900/20 px-3 py-2 text-center">
                    <p className={`text-lg font-bold ${area.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>{area.overdue}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Vencidas</p>
                  </div>
                  <div className="rounded-sm bg-amber-50/60 dark:bg-amber-900/20 px-3 py-2 text-center">
                    <p className={`text-lg font-bold ${area.without_progress > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>{area.without_progress}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sin progreso</p>
                  </div>
                </div>

                {area.total > 0 && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(area.completion_rate, 100)}%` }}
                    />
                  </div>
                )}

                {statusEntries.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {statusEntries.map(([status, count]) => (
                      <span key={status} className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Badge variant={STATUS_BADGE_VARIANT[status] ?? 'gray'} size="sm">
                          {TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] ?? status}
                        </Badge>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                      </span>
                    ))}
                  </div>
                )}

                {(area.oldest_pending_days != null || area.avg_days_without_update != null) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
                    {area.oldest_pending_days != null && area.oldest_pending_days > 0 && (
                      <span>Tarea más antigua: <span className="font-medium text-slate-600 dark:text-slate-400">{area.oldest_pending_days} días</span></span>
                    )}
                    {area.avg_days_without_update != null && area.avg_days_without_update > 0 && (
                      <span>Prom. sin reporte: <span className="font-medium text-slate-600 dark:text-slate-400">{area.avg_days_without_update} días</span></span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </FadeIn>
      )}
    </PageTransition>
  );
}

import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { dashboardApi } from '../../api/dashboard';
import { areasApi } from '../../api/areas';
import type { ConsolidatedDashboard, ConsolidatedArea } from '../../types';
import { TASK_STATUS_LABELS } from '../../types/enums';
import { PageTransition, FadeIn, SkeletonStatCards, SkeletonTable, Badge, STATUS_BADGE_VARIANT } from '../../components/ui';
import { AreaIconDisplay } from '../../utils/areaIcons';

export function ConsolidatedPage() {
  const [data, setData] = useState<ConsolidatedDashboard | null>(null);
  const [iconMap, setIconMap] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.consolidated(), areasApi.listAll()])
      .then(([consolidated, areas]) => {
        setData(consolidated as ConsolidatedDashboard);
        const map: Record<number, string | null> = {};
        for (const a of areas) map[a.id] = a.icon_key;
        setIconMap(map);
      })
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
    { label: 'Total tareas',  value: summary.total_tasks,              border: 'border-slate-400 dark:border-slate-500', bg: 'bg-white dark:bg-white/5',           text: 'text-slate-800 dark:text-white',          dot: 'bg-slate-400 dark:bg-slate-500' },
    { label: 'Completadas',   value: summary.total_completed,          border: 'border-green-500',                         bg: 'bg-green-50 dark:bg-green-900/25',     text: 'text-green-700 dark:text-green-400',      dot: 'bg-green-500' },
    { label: 'Activas',       value: summary.total_active,             border: 'border-cyber-radar',                       bg: 'bg-cyber-radar/5 dark:bg-cyber-radar/10', text: 'text-cyber-radar dark:text-cyber-radar-light', dot: 'bg-cyber-radar' },
    { label: 'Vencidas',      value: summary.total_overdue,            border: 'border-red-500',                           bg: 'bg-red-50 dark:bg-red-900/25',         text: 'text-red-600 dark:text-red-400',          dot: 'bg-red-500' },
    { label: 'Cumplimiento',  value: `${summary.global_completion_rate}%`, border: 'border-amber-500',                    bg: 'bg-amber-50 dark:bg-amber-900/25',     text: 'text-amber-700 dark:text-amber-400',      dot: 'bg-amber-500' },
  ];

  const areas = data.by_area ?? [];

  return (
    <PageTransition>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Dashboard Consolidado</h2>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, i) => (
          <m.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-center justify-between gap-3 rounded-sm border-l-4 ${card.border} ${card.bg} px-4 py-3.5 shadow-sm ring-1 ring-inset ring-slate-900/5 dark:ring-white/5`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`h-2 w-2 shrink-0 rounded-full ${card.dot}`} />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{card.label}</p>
            </div>
            <p className={`text-xl font-black tabular-nums shrink-0 ${card.text}`}>{card.value}</p>
          </m.div>
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
              <m.div
                key={area.area_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito p-5 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-white/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-cyber-navy/10 dark:bg-cyber-navy/30 text-cyber-navy dark:text-cyber-radar-light ring-1 ring-inset ring-cyber-navy/10 dark:ring-white/10">
                      <AreaIconDisplay iconKey={iconMap[area.area_id] ?? null} className="h-5 w-5" />
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
                  <div className="flex items-center justify-between gap-2 rounded-sm border-l-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-white/5 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total</p>
                    <p className="text-base font-black text-slate-900 dark:text-white tabular-nums">{area.total}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-sm border-l-2 border-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Completadas</p>
                    <p className="text-base font-black text-green-700 dark:text-green-400 tabular-nums">{completedCount}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-sm border-l-2 border-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Vencidas</p>
                    <p className={`text-base font-black tabular-nums ${area.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'}`}>{area.overdue}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-sm border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sin progreso</p>
                    <p className={`text-base font-black tabular-nums ${area.without_progress > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`}>{area.without_progress}</p>
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
              </m.div>
            );
          })}
        </FadeIn>
      )}
    </PageTransition>
  );
}

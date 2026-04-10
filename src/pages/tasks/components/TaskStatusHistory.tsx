import { FadeIn, Badge, STATUS_BADGE_VARIANT } from '../../../components/ui';
import { TASK_STATUS_LABELS } from '../../../types/enums';
import type { TaskStatusType } from '../../../types/enums';
import { formatDateTime } from '../../../utils';

interface StatusEntry {
  id: number;
  from_status: TaskStatusType | null;
  to_status: TaskStatusType;
  note?: string | null;
  changed_by?: { name?: string } | number | null;
  user_id?: number | null;
  created_at: string;
  user?: { name?: string } | null;
}

export function TaskStatusHistory({
  history,
}: {
  history: StatusEntry[];
}) {
  if (history.length === 0) return null;

  const visible = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <FadeIn delay={0.2} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Historial de estados</h3>
      <div className="relative ml-3 border-l-2 border-slate-200 dark:border-white/10 pl-6">
        {visible.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">No tienes interacciones registradas en esta tarea.</p>
        )}
        {visible.map((h, index) => (
          <div key={h.id} className={`relative pb-4 ${index === visible.length - 1 ? 'pb-0' : ''}`}>
            <div className="absolute -left-7.75 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyber-radar ring-4 ring-white dark:ring-slate-900">
              <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-cyber-grafito" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {h.from_status ? (
                  <>
                    <Badge variant={STATUS_BADGE_VARIANT[h.from_status]} size="sm">{TASK_STATUS_LABELS[h.from_status]}</Badge>
                    <span className="mx-1.5 text-slate-400 dark:text-slate-500">→</span>
                  </>
                ) : null}
                <Badge variant={STATUS_BADGE_VARIANT[h.to_status]} size="sm">{TASK_STATUS_LABELS[h.to_status]}</Badge>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(typeof h.changed_by === 'object' && h.changed_by?.name) ? h.changed_by.name : h.user?.name ?? 'Sistema'} · {formatDateTime(h.created_at)}</p>
              {h.note && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{h.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

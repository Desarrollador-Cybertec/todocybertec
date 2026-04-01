import { Link } from 'react-router-dom';
import { TaskStatus, TASK_PRIORITY_LABELS } from '../../../types/enums';
import type { UpcomingTask, ResponsibleLoad } from '../../../types';
import {
  HiOutlineEye,
  HiOutlineLightningBolt,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { Badge, PRIORITY_BADGE_VARIANT } from '../../../components/ui';
import { formatRelativeDate } from '../../../utils';

export function ResponsibleRow({ responsible, max }: { responsible: ResponsibleLoad; max: number }) {
  const ratio = max > 0 ? responsible.active_tasks / max : 0;
  const pct = Math.round(ratio * 100);
  const barColor = responsible.active_tasks === 0
    ? 'bg-slate-200 dark:bg-white/10'
    : ratio > 0.75
    ? 'bg-red-500'
    : ratio > 0.4
    ? 'bg-amber-500'
    : 'bg-cyber-radar';
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyber-navy/10 dark:bg-cyber-radar/10 text-xs font-bold text-cyber-navy dark:text-cyber-radar-light">
        {responsible.user_name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{responsible.user_name}</p>
          <span className="ml-2 shrink-0 text-sm font-semibold text-slate-900 dark:text-white">{responsible.active_tasks}</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10">
          <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function MiniStat({ label, value, icon, color, alert }: { label: string; value: number; icon: React.ReactNode; color: string; alert?: boolean }) {
  return (
    <div className={`rounded-sm border px-4 py-3 transition-colors ${alert ? 'border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-900/20' : 'border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>{icon}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className={`mt-1.5 text-xl font-bold ${alert ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

export function UrgentTaskRow({ task }: { task: UpcomingTask }) {
  const isOverdue = task.is_overdue ?? task.status === TaskStatus.OVERDUE;
  return (
    <div className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {isOverdue ? (
            <span className="font-medium text-red-600 dark:text-red-400">Vencida · {formatRelativeDate(task.due_date)}</span>
          ) : (
            <>Vence {task.due_date ? formatRelativeDate(task.due_date) : 'sin fecha'}</>
          )}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS]}</Badge>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link to={`/tasks/${task.id}`} className="rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
          <HiOutlineEye className="inline h-3.5 w-3.5" /> Ver
        </Link>
        <Link to={`/tasks/${task.id}`} className="rounded-lg bg-cyber-radar px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyber-radar-light">
          <HiOutlineLightningBolt className="inline h-3.5 w-3.5" /> Gestionar
        </Link>
      </div>
    </div>
  );
}

export function TaskRow({ task }: { task: UpcomingTask }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {task.due_date ? formatRelativeDate(task.due_date) : 'Sin fecha límite'}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS]}</Badge>
          {task.status === TaskStatus.OVERDUE && <Badge variant="red" size="sm">Vencida</Badge>}
          {task.status === TaskStatus.IN_REVIEW && <Badge variant="purple" size="sm">En revisión</Badge>}
        </div>
      </div>
      <Link
        to={`/tasks/${task.id}`}
        className="flex shrink-0 items-center gap-1 rounded-lg bg-cyber-radar px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-cyber-radar-light"
      >
        Revisar <HiOutlineChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

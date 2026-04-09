import { useState } from 'react';
import { HiOutlineChevronDown, HiOutlineRefresh } from 'react-icons/hi';
import { tasksApi } from '../../api/tasks';
import { TaskStatus, Role, ADMIN_ROLES, MANAGER_ROLES, WORKER_ROLES } from '../../types/enums';
import type { Task } from '../../types';
import { ApiError } from '../../api/client';

type ActionKey = 'start' | 'submit_review' | 'approve' | 'reject' | 'cancel' | 'reopen' | 'claim' | 'complete';

interface Action {
  key: ActionKey;
  label: string;
}

function getAvailableActions(
  task: Task,
  userId: number | undefined,
  userRole: string | undefined,
): Action[] {
  if (!userId || !userRole) return [];

  const uid = Number(userId);
  const isResponsible =
    Number(task.current_responsible_user_id) === uid ||
    Number(task.current_responsible?.id) === uid ||
    Number(task.assigned_to_user_id) === uid ||
    Number(task.assigned_user?.id) === uid;
  const isCreator =
    Number(task.created_by) === uid ||
    Number(task.creator?.id) === uid;
  const isSuperAdmin = ADMIN_ROLES.includes(userRole as typeof Role[keyof typeof Role]);
  const isManager = MANAGER_ROLES.includes(userRole as typeof Role[keyof typeof Role]);
  const isExternalTask = !!task.external_email;
  const canActAsResponsible = isResponsible || (isExternalTask && (isSuperAdmin || isManager || isCreator));
  // Can act on task: responsible person, any manager, or superadmin
  const canActOnTask = canActAsResponsible || isManager || isSuperAdmin;
  const terminal: string[] = [TaskStatus.COMPLETED, TaskStatus.CANCELLED];

  const actions: Action[] = [];

  // Manager/SuperAdmin can claim tasks in pending_assignment status
  if (
    (isSuperAdmin || isManager) &&
    task.status === TaskStatus.PENDING_ASSIGNMENT
  ) {
    actions.push({ key: 'claim', label: 'Reclamar tarea' });
  }

  if (
    canActOnTask &&
    ([TaskStatus.PENDING, TaskStatus.OVERDUE, TaskStatus.REJECTED] as string[]).includes(task.status)
  ) {
    actions.push({ key: 'start', label: 'Iniciar tarea' });
  }

  if (canActOnTask && task.status === TaskStatus.IN_PROGRESS) {
    actions.push({ key: 'submit_review', label: 'Enviar a revisión' });
  }

  if ((isSuperAdmin || isManager) && task.status === TaskStatus.IN_REVIEW) {
    actions.push({ key: 'approve', label: 'Aprobar' });
    actions.push({ key: 'reject', label: 'Rechazar' });
  }

  if ((isSuperAdmin || isManager || isCreator) && !terminal.includes(task.status)) {
    actions.push({ key: 'cancel', label: 'Cancelar tarea' });
  }

  const isWorker = WORKER_ROLES.includes(userRole as typeof Role[keyof typeof Role]);
  if ((isSuperAdmin || isManager) && terminal.includes(task.status)) {
    actions.push({ key: 'reopen', label: 'Reabrir tarea' });
  } else if (isWorker && (isCreator || isResponsible) && terminal.includes(task.status)) {
    actions.push({ key: 'reopen', label: 'Reabrir tarea personal' });
  }

  return actions;
}

interface TaskStatusSelectProps {
  task: Task;
  userId: number | undefined;
  userRole: string | undefined;
  onUpdated: (updated: Task) => void;
}

export function TaskStatusSelect({ task, userId, userRole, onUpdated }: TaskStatusSelectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const [actionNote, setActionNote] = useState('');

  const actions = getAvailableActions(task, userId, userRole);
  if (actions.length === 0) return null;

  const reopenAction = actions.find((a) => a.key === 'reopen');
  const otherActions = actions.filter((a) => a.key !== 'reopen');

  // Actions that require a comment prompt
  const COMMENT_ACTIONS: ActionKey[] = ['start', 'submit_review', 'approve', 'reject', 'cancel', 'reopen'];

  const execute = async (key: ActionKey, note?: string) => {
    setLoading(true);
    setError('');
    try {
      let updated: Task;
      switch (key) {
        case 'start':
          updated = await tasksApi.start(task.id, { comment: note ?? '' });
          break;
        case 'complete':
          updated = await tasksApi.approve(task.id, { note: note ?? '' });
          break;
        case 'submit_review':
          updated = await tasksApi.submitReview(task.id, { comment: note ?? '' });
          break;
        case 'approve':
          updated = await tasksApi.approve(task.id, { note: note ?? '' });
          break;
        case 'reject':
          updated = await tasksApi.reject(task.id, { note: note ?? '' });
          break;
        case 'cancel':
          updated = await tasksApi.cancel(task.id, { comment: note ?? '' });
          break;
        case 'reopen':
          updated = await tasksApi.reopen(task.id, { comment: note ?? '' });
          break;
        case 'claim':
          updated = await tasksApi.claim(task.id);
          break;
        default:
          setLoading(false);
          return;
      }
      setPendingAction(null);
      setActionNote('');
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.data.message : 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as ActionKey | '';
    e.target.value = '';
    if (!key) return;
    if (COMMENT_ACTIONS.includes(key)) {
      setPendingAction(key);
      setActionNote('');
    } else {
      execute(key);
    }
  };

  const ACTION_UI: Record<string, { title: string; placeholder: string; confirmLabel: string; loadingLabel: string; borderColor: string; bgColor: string; textColor: string; btnColor: string; btnHover: string }> = {
    start: { title: 'Comentario para iniciar tarea', placeholder: 'Escribe un comentario...', confirmLabel: 'Iniciar', loadingLabel: 'Iniciando...', borderColor: 'border-blue-200 dark:border-blue-800', bgColor: 'bg-blue-50 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400', btnColor: 'bg-blue-600', btnHover: 'hover:bg-blue-700' },
    submit_review: { title: 'Comentario para enviar a revisión', placeholder: 'Escribe un comentario...', confirmLabel: 'Enviar', loadingLabel: 'Enviando...', borderColor: 'border-purple-200 dark:border-purple-800', bgColor: 'bg-purple-50 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400', btnColor: 'bg-purple-600', btnHover: 'hover:bg-purple-700' },
    approve: { title: 'Nota de aprobación', placeholder: 'Escribe la nota de aprobación...', confirmLabel: 'Aprobar', loadingLabel: 'Aprobando...', borderColor: 'border-green-200 dark:border-green-800', bgColor: 'bg-green-50 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', btnColor: 'bg-green-600', btnHover: 'hover:bg-green-700' },
    reject: { title: 'Motivo del rechazo', placeholder: 'Escribe el motivo...', confirmLabel: 'Rechazar', loadingLabel: 'Rechazando...', borderColor: 'border-red-200 dark:border-red-800', bgColor: 'bg-red-50 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', btnColor: 'bg-red-600', btnHover: 'hover:bg-red-700' },
    cancel: { title: 'Motivo de cancelación', placeholder: 'Escribe el motivo...', confirmLabel: 'Cancelar tarea', loadingLabel: 'Cancelando...', borderColor: 'border-orange-200 dark:border-orange-800', bgColor: 'bg-orange-50 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400', btnColor: 'bg-orange-600', btnHover: 'hover:bg-orange-700' },
    reopen: { title: 'Motivo de reapertura', placeholder: 'Escribe el motivo...', confirmLabel: 'Reabrir', loadingLabel: 'Reabriendo...', borderColor: 'border-amber-200 dark:border-amber-800', bgColor: 'bg-amber-50 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400', btnColor: 'bg-amber-600', btnHover: 'hover:bg-amber-700' },
  };

  const ui = pendingAction ? ACTION_UI[pendingAction] : null;

  return (
    <div className="flex flex-col gap-1.5">
      {reopenAction && pendingAction !== 'reopen' && (
        <button
          type="button"
          onClick={() => { setPendingAction('reopen'); setActionNote(''); }}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 rounded-sm border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-60 cursor-pointer"
        >
          <HiOutlineRefresh className="h-5 w-5" />
          {reopenAction.label}
        </button>
      )}
      {pendingAction && ui ? (
        <div className={`rounded-sm border ${ui.borderColor} ${ui.bgColor} p-2.5 space-y-2 min-w-48`}>
          <p className={`text-xs font-semibold ${ui.textColor}`}>{ui.title}</p>
          <textarea
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            rows={2}
            placeholder={ui.placeholder}
            className={`w-full rounded-lg border ${ui.borderColor} bg-white dark:bg-cyber-grafito px-3 py-1.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none text-slate-900 dark:text-white`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => execute(pendingAction, actionNote)}
              disabled={loading || !actionNote.trim()}
              className={`flex-1 rounded-lg ${ui.btnColor} py-1.5 text-xs font-medium text-white transition-colors ${ui.btnHover} disabled:opacity-50`}
            >
              {loading ? ui.loadingLabel : ui.confirmLabel}
            </button>
            <button
              type="button"
              onClick={() => { setPendingAction(null); setActionNote(''); }}
              className={`rounded-lg bg-white dark:bg-cyber-grafito border ${ui.borderColor} px-3 py-1.5 text-xs font-medium ${ui.textColor} transition-colors hover:bg-opacity-50`}
            >
              Volver
            </button>
          </div>
        </div>
      ) : (
        otherActions.length > 0 && (
        <div className="relative">
          <select
            onChange={handleChange}
            disabled={loading}
            defaultValue=""
            className="w-full appearance-none rounded-sm border border-cyber-radar/20 dark:border-cyber-radar/20 bg-cyber-radar/5 dark:bg-cyber-radar/20/30 py-2 pl-3 pr-8 text-sm font-medium text-cyber-radar dark:text-cyber-radar-light transition-colors hover:border-cyber-radar/30 dark:hover:border-cyber-radar hover:bg-cyber-radar/10 dark:hover:bg-cyber-radar/20 focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 disabled:opacity-60 cursor-pointer"
          >
            <option value="" disabled>
              {loading ? 'Ejecutando...' : 'Cambiar estado'}
            </option>
            {otherActions.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyber-radar dark:text-cyber-radar-light" />
        </div>
        )
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

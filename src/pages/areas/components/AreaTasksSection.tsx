import { useEffect, useState, useCallback } from 'react';
import { tasksApi } from '../../../api/tasks';
import { areasApi } from '../../../api/areas';
import { ApiError } from '../../../api/client';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, Role } from '../../../types/enums';
import type { Task } from '../../../types';
import { HiOutlineUserAdd, HiOutlineCheckCircle, HiOutlineX } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import { FadeIn, SlideDown, Badge, STATUS_BADGE_VARIANT, PRIORITY_BADGE_VARIANT, SkeletonCard, Spinner } from '../../../components/ui';

interface AreaTasksSectionProps {
  areaId: number;
  isManager: boolean;
  refreshKey: number;
}

export function AreaTasksSection({ areaId, isManager, refreshKey }: AreaTasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<import('../../../types').User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);
  const [assignToUserId, setAssignToUserId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [tasksRes, membersRes] = await Promise.all([
        tasksApi.list(`area_id=${areaId}`).catch(() => null),
        areasApi.membersAll(areaId).catch(() => []),
      ]);
      setTasks(tasksRes?.data ?? []);
      setMembers(Array.isArray(membersRes) ? membersRes.filter((u) => u.role?.slug === Role.WORKER) : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleAssign = async (taskId: number) => {
    if (!assignToUserId) return;
    setAssignSaving(true);
    try {
      await tasksApi.delegate(taskId, { to_user_id: Number(assignToUserId) });
      setAssignMsg('Tarea asignada');
      setAssigningTaskId(null);
      setAssignToUserId('');
      load();
      setTimeout(() => setAssignMsg(''), 3000);
    } catch (err) {
      setAssignMsg(err instanceof ApiError ? err.data.message : 'Error al asignar');
    } finally {
      setAssignSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-sm border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
        Error al cargar las tareas del área.
        <button type="button" onClick={load} className="ml-2 underline hover:text-red-800 dark:hover:text-red-200">Reintentar</button>
      </div>
    );
  }

  return (
    <FadeIn delay={0.25} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Tareas del área</h3>
        <span className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{tasks.length}</span>
      </div>

      <AnimatePresence>
        {assignMsg && (
          <SlideDown>
            <div className="mx-6 mt-3 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 px-3 py-2 text-sm text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" /> {assignMsg}
            </div>
          </SlideDown>
        )}
      </AnimatePresence>

      {tasks.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No hay tareas registradas para esta área.</p>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {tasks.map((task) => (
            <div key={task.id} className="px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{task.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS_BADGE_VARIANT[task.status] ?? 'gray'} size="sm">
                      {TASK_STATUS_LABELS[task.status] ?? task.status}
                    </Badge>
                    <Badge variant={PRIORITY_BADGE_VARIANT[task.priority] ?? 'gray'} size="sm">
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                    {task.due_date && (
                      <span className={`text-xs ${task.is_overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        Vence: {new Date(task.due_date).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {task.current_responsible ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-cyber-navy/5 dark:bg-cyber-navy/20/30 px-2.5 py-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber-navy/20 text-xs font-bold text-cyber-navy dark:text-cyber-radar-light">
                        {task.current_responsible.name.charAt(0)}
                      </span>
                      <span className="text-xs font-medium text-cyber-navy dark:text-cyber-radar-light">{task.current_responsible.name}</span>
                    </div>
                  ) : (
                    <span className="rounded-lg bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-xs text-slate-400 dark:text-slate-500">Sin asignar</span>
                  )}
                  {isManager && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningTaskId(assigningTaskId === task.id ? null : task.id);
                        setAssignToUserId('');
                      }}
                      className={`rounded-lg p-1.5 transition-colors ${assigningTaskId === task.id ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' : 'border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-400'}`}
                      title={assigningTaskId === task.id ? 'Cancelar' : 'Asignar'}
                    >
                      {assigningTaskId === task.id ? <HiOutlineX className="h-4 w-4" /> : <HiOutlineUserAdd className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {assigningTaskId === task.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-sm border border-cyber-navy/10 dark:border-cyber-navy/20 bg-cyber-navy/5/60 dark:bg-cyber-navy/20/20 p-3">
                      <select
                        value={assignToUserId}
                        onChange={(e) => setAssignToUserId(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-2 text-sm focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 text-slate-900 dark:text-white"
                      >
                        <option value="">— Seleccionar miembro —</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAssign(task.id)}
                        disabled={!assignToUserId || assignSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyber-radar px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light disabled:opacity-50"
                      >
                        {assignSaving ? <Spinner size="sm" /> : null}
                        Asignar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </FadeIn>
  );
}

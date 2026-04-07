import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import {
  HiOutlineExclamationCircle,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { createTaskSchema, type CreateTaskFormData } from '../../schemas';
import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/users';
import { areasApi } from '../../api/areas';
import { meetingsApi } from '../../api/meetings';
import { useAuth } from '../../context/useAuth';
import { Role, TASK_PRIORITY_LABELS, ADMIN_ROLES, MANAGER_ROLES, WORKER_ROLES } from '../../types/enums';
import { ApiError } from '../../api/client';
import type { User, Area, Meeting } from '../../types';
import { PageTransition, SlideDown, FadeIn, ConfirmModal } from '../../components/ui';
import { Spinner } from '../../components/ui';
import { useNavigationGuard } from '../../utils/useNavigationGuard';
import { TaskCreatePreview } from './components/TaskCreatePreview';
import { TaskCreateAdvanced } from './components/TaskCreateAdvanced';

/* ── constants ── */
const PRIORITY_STYLES: Record<string, { ring: string; bg: string; text: string; dot: string }> = {
  low:    { ring: 'ring-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  medium: { ring: 'ring-sky-400',     bg: 'bg-sky-50 dark:bg-sky-900/30',      text: 'text-sky-700 dark:text-sky-400',     dot: 'bg-sky-500' },
  high:   { ring: 'ring-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500' },
  urgent: { ring: 'ring-rose-400',    bg: 'bg-rose-50 dark:bg-rose-900/30',     text: 'text-rose-700 dark:text-rose-400',    dot: 'bg-rose-500' },
};

export function TaskCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serverError, setServerError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateTaskFormData | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [areaMembers, setAreaMembers] = useState<User[]>([]);
  const [workerDest, setWorkerDest] = useState<'self' | 'external'>('self');

  const isWorker = user?.role.slug ? WORKER_ROLES.includes(user.role.slug) : false;
  const isManager = user?.role.slug ? MANAGER_ROLES.includes(user.role.slug) : false;
  const isSuperadmin = user?.role.slug ? ADMIN_ROLES.includes(user.role.slug) : false;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema) as never,
    defaultValues: {
      priority: 'medium',
      start_date: new Date().toISOString().slice(0, 10),
      requires_attachment: false,
      requires_completion_comment: false,
      requires_manager_approval: !isWorker,   // workers have personal tasks — no approval needed
      requires_completion_notification: false,
      requires_due_date: false,
      notify_on_due: !isWorker,
      notify_on_overdue: !isWorker,
      notify_on_completion: false,
      ...(isWorker ? { assigned_to_user_id: user?.id } : {}),
    },
  });

  /* watches for live preview & mutual-exclusion */
  const watchTitle = useWatch({ control, name: 'title' }) || '';

  // Block NavLink / browser back when form has been touched
  const navGuard = useNavigationGuard(isDirty && !isSubmitting);
  const watchPriority = useWatch({ control, name: 'priority' }) || 'medium';
  const watchDueDate = useWatch({ control, name: 'due_date' });
  const watchAssignedUser = useWatch({ control, name: 'assigned_to_user_id' });
  const watchAssignedArea = useWatch({ control, name: 'assigned_to_area_id' });
  const watchExternalEmail = useWatch({ control, name: 'external_email' });

  const hasUser = !!watchAssignedUser;
  const hasArea = !!watchAssignedArea;
  const hasExternalEmail = !!watchExternalEmail;

  // Personal task: manager assigning to themselves
  const isPersonalTask = useMemo(
    () => isManager && !!watchAssignedUser && Number(watchAssignedUser) === Number(user?.id),
    [isManager, watchAssignedUser, user?.id],
  );

  // Reset fields that don't apply to personal tasks
  useEffect(() => {
    if (isPersonalTask) {
      setValue('requires_manager_approval', false);
      setValue('notify_on_due', false);
      setValue('notify_on_overdue', false);
      setValue('notify_on_completion', false);
    }
  }, [isPersonalTask, setValue]);

  /* requirement / notification watches */
  const reqAttach   = useWatch({ control, name: 'requires_attachment' });
  const reqComment  = useWatch({ control, name: 'requires_completion_comment' });
  const reqApproval = useWatch({ control, name: 'requires_manager_approval' });
  const notDue        = useWatch({ control, name: 'notify_on_due' });
  const notOverdue    = useWatch({ control, name: 'notify_on_overdue' });
  const notCompletion = useWatch({ control, name: 'notify_on_completion' });

  useEffect(() => {
    Promise.all([
      usersApi.listAll().catch(() => [] as User[]),
      areasApi.listAll().catch(() => [] as Area[]),
      meetingsApi.list().catch(() => [] as Meeting[]),
    ]).then(async ([u, a, m]) => {
      setUsers(u);
      setAreas(a);
      setMeetings(m);

      // For managers: load members of their managed areas AND areas they belong to
      if (isManager && user?.id) {
        const uid = Number(user.id);
        const areaIdSet = new Set<number>();

        // Areas the user belongs to as a member
        if (user.area_id) {
          areaIdSet.add(Number(user.area_id));
        }

        // Areas the user manages
        a.filter(
          (area) =>
            Number(area.manager_user_id) === uid || Number(area.manager?.id) === uid ||
            (area.manager?.id != null && Number(area.manager.id) === uid),
        ).forEach((area) => areaIdSet.add(area.id));

        let areaIdsToFetch = [...areaIdSet];
        if (!areaIdsToFetch.length && a.length) {
          areaIdsToFetch = [a[0].id];
        }

        if (areaIdsToFetch.length) {
          const memberLists = await Promise.all(
            areaIdsToFetch.map((id) => areasApi.membersAll(id).catch(() => [] as User[])),
          );
          const memberMap = new Map<number, User>();
          memberLists.flat().forEach((member) => memberMap.set(member.id, member));
          setAreaMembers([...memberMap.values()]);
        }
      }
    });
  }, [isManager, user?.id, user?.area_id]);

  /* Filter users based on role */
  const availableUsers = (() => {
    if (isSuperadmin) return users;
    if (isManager) {
      // Real area members + the manager themselves (for personal tasks)
      const memberMap = new Map<number, User>(areaMembers.map((m) => [m.id, m]));
      if (user) memberMap.set(user.id, user as User);
      return [...memberMap.values()];
    }
    return [];
  })();

  const onSubmit = async (data: CreateTaskFormData) => {
    // Show confirmation modal before actually creating
    setPendingFormData(data);
    setShowCreateModal(true);
  };

  const doCreate = async () => {
    if (!pendingFormData) return;
    setShowCreateModal(false);
    setServerError('');
    try {
      const payload = {
        ...pendingFormData,
        assigned_to_user_id: pendingFormData.assigned_to_user_id || undefined,
        assigned_to_area_id: pendingFormData.assigned_to_area_id || undefined,
        external_email: pendingFormData.external_email || undefined,
        external_name: pendingFormData.external_name || undefined,
        meeting_id: pendingFormData.meeting_id || undefined,
        description: pendingFormData.description || undefined,
        due_date: pendingFormData.due_date || undefined,
        start_date: pendingFormData.start_date || undefined,
      };
      await tasksApi.create(payload);
      navGuard.skip();
      navigate('/tasks');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.data.message);
      } else {
        setServerError('Error al crear la tarea');
      }
    } finally {
      setPendingFormData(null);
    }
  };

  const assigneeName = (() => {
    if (isWorker && workerDest === 'self') return user?.name ?? '';
    if (isWorker && workerDest === 'external') return watchExternalEmail || 'Sin correo';
    if (hasUser) return users.find((u) => String(u.id) === String(watchAssignedUser))?.name ?? '';
    if (hasArea) return areas.find((a) => String(a.id) === String(watchAssignedArea))?.name ?? '';
    if (hasExternalEmail) return watchExternalEmail ?? '';
    return 'Sin asignar';
  })();

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl">
        {/* header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Tarea</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completa los datos esenciales y crea tu tarea rápidamente.</p>
        </div>

        <AnimatePresence>
          {serverError && (
            <SlideDown>
              <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
                <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            </SlideDown>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ─── LEFT COLUMN (2/3) ─── */}
            <div className="space-y-6 lg:col-span-2">

              {/* quick creation card */}
              <FadeIn delay={0.05} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  ⚡ Creación rápida
                </h3>
                <div className="space-y-4">
                  {/* title */}
                  <div>
                    <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Título *</label>
                    <input
                      id="title"
                      {...register('title')}
                      placeholder="Ej: Enviar informe semanal"
                      className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-all focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.title.message}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* responsible */}
                    {isWorker ? (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Destino</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setWorkerDest('self'); setValue('assigned_to_user_id', user?.id ?? null); setValue('external_email', ''); setValue('external_name', ''); }}
                            className={`flex-1 rounded-sm border px-3 py-2.5 text-sm font-medium transition-all ${
                              workerDest === 'self'
                                ? 'border-cyber-radar/30 dark:border-cyber-radar bg-cyber-radar/10 dark:bg-cyber-radar/10 text-cyber-radar dark:text-cyber-radar-light ring-1 ring-cyber-radar/20 dark:ring-cyber-radar/30'
                                : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <HiOutlineUser className="mr-1 inline h-4 w-4" />
                            Para mí
                          </button>
                          <button
                            type="button"
                            onClick={() => { setWorkerDest('external'); setValue('assigned_to_user_id', null); }}
                            className={`flex-1 rounded-sm border px-3 py-2.5 text-sm font-medium transition-all ${
                              workerDest === 'external'
                                ? 'border-cyber-radar/30 dark:border-cyber-radar bg-cyber-radar/10 dark:bg-cyber-radar/10 text-cyber-radar dark:text-cyber-radar-light ring-1 ring-cyber-radar/20 dark:ring-cyber-radar/30'
                                : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            ✉️ Correo externo
                          </button>
                        </div>
                        {workerDest === 'self' && (
                          <>
                            <div className="mt-2 flex items-center gap-2 rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                              <HiOutlineUser className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              {user?.name} (tú)
                            </div>
                            <input type="hidden" {...register('assigned_to_user_id', { value: user?.id })} />
                          </>
                        )}
                        {workerDest === 'external' && (
                          <div className="mt-2 space-y-2">
                            <input
                              type="email"
                              {...register('external_email')}
                              placeholder="correo@ejemplo.com"
                              className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none"
                            />
                            {errors.external_email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.external_email.message}</p>}
                            <input
                              type="text"
                              {...register('external_name')}
                              placeholder="Nombre del destinatario"
                              className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="assigned_to_user_id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Responsable</label>
                        <select
                          id="assigned_to_user_id"
                          {...register('assigned_to_user_id', { setValueAs: (v: string) => v ? Number(v) : null })}
                          disabled={hasArea || hasExternalEmail}
                          className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500"
                        >
                          <option value="">Seleccionar usuario</option>
                          {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}{u.id === user?.id ? ' (tú)' : ''}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* due date */}
                    <div>
                      <label htmlFor="due_date" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha límite</label>
                      <input id="due_date" type="date" {...register('due_date')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none" />
                    </div>
                  </div>

                  {/* priority pills */}
                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridad</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => {
                        const s = PRIORITY_STYLES[value] ?? PRIORITY_STYLES.medium;
                        const active = watchPriority === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setValue('priority', value as CreateTaskFormData['priority'])}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-all ${active ? `${s.bg} ${s.text} ${s.ring} shadow-sm` : 'bg-white dark:bg-cyber-grafito text-slate-500 dark:text-slate-400 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${active ? s.dot : 'bg-slate-300 dark:bg-white/10'}`} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.priority && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.priority.message}</p>}
                  </div>
                </div>

                {/* toggle advanced */}
                <div className="mt-5 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
                  {!showAdvanced && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                      className="flex w-full items-center justify-between rounded-sm border border-dashed border-cyber-radar/30 dark:border-cyber-radar bg-cyber-radar/5/50 dark:bg-cyber-radar/20/20 px-4 py-3 text-sm transition-all hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20"
                    >
                      <div className="flex items-center gap-2">
                        <HiOutlineShieldCheck className="h-5 w-5 text-cyber-radar dark:text-cyber-radar-light" />
                        <span className="font-medium text-cyber-radar dark:text-cyber-radar-light">Configurar requisitos, notificaciones y más</span>
                      </div>
                      <span className="text-xs text-cyber-radar-light">Recomendado</span>
                    </button>
                  )}
                  {showAdvanced && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(false)}
                      className="flex items-center gap-1.5 text-sm font-medium text-cyber-radar dark:text-cyber-radar-light hover:text-cyber-radar"
                    >
                      <HiOutlineChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                      Ocultar opciones avanzadas
                    </button>
                  )}

                  {!showAdvanced && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyber-radar/25 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSubmitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Creando...</> : 'Crear tarea'}
                      </button>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* ─── ADVANCED SECTION (collapsible) ─── */}
              {showAdvanced && (
                <TaskCreateAdvanced
                  register={register}
                  setValue={setValue}
                  isWorker={isWorker}
                  isPersonalTask={isPersonalTask}
                  isSubmitting={isSubmitting}
                  errors={errors as Record<string, { message?: string }>}
                  areas={areas}
                  meetings={meetings}
                  hasUser={hasUser}
                  hasArea={hasArea}
                  hasExternalEmail={hasExternalEmail}
                  reqAttach={!!reqAttach}
                  reqComment={!!reqComment}
                  reqApproval={!!reqApproval}
                  notDue={!!notDue}
                  notOverdue={!!notOverdue}
                  notCompletion={!!notCompletion}
                  onCancel={() => setShowLeaveModal(true)}
                />
              )}
            </div>

            {/* ─── RIGHT SIDEBAR (1/3) ─── */}
            <TaskCreatePreview
              title={watchTitle}
              priority={watchPriority}
              assigneeName={assigneeName}
              dueDate={watchDueDate}
              reqAttach={!!reqAttach}
              reqComment={!!reqComment}
              reqApproval={!!reqApproval}
            />
          </div>
        </form>

        {/* ─── CONFIRM MODALS ─── */}
        <ConfirmModal
          open={showLeaveModal || navGuard.isBlocked}
          title="¿Salir sin guardar?"
          message="Los datos ingresados se perderán. ¿Estás seguro de que deseas salir?"
          confirmLabel="Salir"
          cancelLabel="Seguir editando"
          variant="danger"
          onConfirm={() => { if (navGuard.isBlocked) navGuard.confirm(); else navigate('/tasks'); }}
          onCancel={() => { setShowLeaveModal(false); navGuard.cancel(); }}
        />
        <ConfirmModal
          open={showCreateModal}
          title="Confirmar creación"
          message={`¿Crear la tarea "${watchTitle || 'Sin título'}"?`}
          confirmLabel="Crear tarea"
          cancelLabel="Revisar"
          variant="primary"
          onConfirm={doCreate}
          onCancel={() => { setShowCreateModal(false); setPendingFormData(null); }}
        />
      </div>
    </PageTransition>
  );
}

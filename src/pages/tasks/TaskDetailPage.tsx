import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, m } from 'framer-motion';
import { tasksApi } from '../../api/tasks';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  WORKER_ROLES,
} from '../../types/enums';
import {
  addCommentSchema,
  rejectTaskSchema,
  approveTaskSchema,
  delegateTaskSchema,
  type AddCommentFormData,
  type RejectTaskFormData,
  type ApproveTaskFormData,
  type DelegateTaskFormData,
} from '../../schemas';
import type { Task, User } from '../../types';
import { areasApi } from '../../api/areas';
import { usersApi } from '../../api/users';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineUpload,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineChatAlt,
} from 'react-icons/hi';
import { PageTransition, FadeIn, SlideDown } from '../../components/ui';
import { SkeletonDetail, Badge, Spinner, STATUS_BADGE_VARIANT, PRIORITY_BADGE_VARIANT } from '../../components/ui';
import { TaskStatusSelect } from '../../components/tasks/TaskStatusSelect';
import { taskProgress, formatDate } from '../../utils';
import { TaskEditForm } from './components/TaskEditForm';
import {
  CommentFormPanel,
  ApproveFormPanel,
  RejectFormPanel,
  DelegateFormPanel,
} from './components/TaskActionForms';
import { TaskComments } from './components/TaskComments';
import { TaskAttachmentsV2, UploadFormPanelV2 } from './components/TaskAttachmentsV2';
import { TaskStatusHistory } from './components/TaskStatusHistory';
import { TaskUpdates } from './components/TaskUpdates';
import { useTaskEditState } from './hooks/useTaskEditState';
import { useTaskPermissions } from './hooks/useTaskPermissions';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [areaMembers, setAreaMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachmentsKey, setAttachmentsKey] = useState(0);

  const taskId = Number(id);

  const showMessage = (msg: string) => {
    setActionSuccess(msg);
    setActionError('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const loadTask = useCallback(async () => {
    try {
      const res = await tasksApi.get(taskId);
      if (!res.creator && res.created_by) {
        res.creator = await usersApi.get(res.created_by).catch(() => null) as typeof res.creator;
      }
      setTask(res);
      if (searchParams.get('edit') === '1') {
        edit.startEditing(res);
      }
    } catch {
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }, [taskId, navigate, searchParams]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const edit = useTaskEditState(task, taskId, showMessage, setActionError, loadTask);
  const perms = useTaskPermissions(task, user as Parameters<typeof useTaskPermissions>[1]);

  const handleAction = async (action: () => Promise<unknown>, successMsg: string) => {
    setActionError('');
    try {
      await action();
      showMessage(successMsg);
      loadTask();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.data.message : 'Error al ejecutar la acción');
    }
  };

  const commentForm = useForm<AddCommentFormData>({ resolver: zodResolver(addCommentSchema) });
  const onComment = async (data: AddCommentFormData) => {
    await handleAction(() => tasksApi.addComment(taskId, data), 'Comentario agregado');
    commentForm.reset();
    setShowCommentForm(false);
  };

  const rejectForm = useForm<RejectTaskFormData>({ resolver: zodResolver(rejectTaskSchema) });
  const onReject = async (data: RejectTaskFormData) => {
    await handleAction(() => tasksApi.reject(taskId, data), 'Tarea rechazada');
    rejectForm.reset();
    setShowRejectForm(false);
  };

  const approveForm = useForm<ApproveTaskFormData>({ resolver: zodResolver(approveTaskSchema) });
  const onApprove = async (data: ApproveTaskFormData) => {
    await handleAction(() => tasksApi.approve(taskId, { note: data.note }), 'Tarea aprobada');
    approveForm.reset();
    setShowApproveForm(false);
  };

  const delegateForm = useForm<DelegateTaskFormData>({ resolver: zodResolver(delegateTaskSchema) });
  const onDelegate = async (data: DelegateTaskFormData) => {
    await handleAction(() => tasksApi.delegate(taskId, data), 'Tarea delegada');
    delegateForm.reset();
    setShowDelegateForm(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.delete(taskId);
      navigate('/tasks');
    } catch (error) {
      setActionError(error instanceof ApiError ? error.data.message : 'Error al eliminar la tarea');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelegateOpen = async () => {
    setShowDelegateForm(true);
    setMembersLoading(true);
    try {
      if (perms.isSuperAdmin) {
        const allUsers = await usersApi.listAll();
        setAreaMembers(allUsers);
      } else {
        const uid = Number(user?.id);
        let areaId: number | null = null;
        if (task?.area && (Number(task.area.manager_user_id) === uid || Number(task.area.manager?.id) === uid)) {
          areaId = task.area.id;
        } else if (task?.assigned_area && (Number(task.assigned_area.manager_user_id) === uid || Number(task.assigned_area.manager?.id) === uid)) {
          areaId = task.assigned_area.id;
        } else if (user?.area_id) {
          areaId = user.area_id;
        } else {
          const areas = await areasApi.listAll();
          const managedArea = areas.find((a) => (Number(a.manager_user_id) === uid || Number(a.manager?.id) === uid) && a.active);
          areaId = managedArea?.id ?? null;
        }
        if (areaId) {
          const members = await areasApi.membersAll(areaId);
          setAreaMembers(Array.isArray(members) ? members : []);
        }
      }
    } catch {
      setAreaMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const isWorker = user?.role.slug ? WORKER_ROLES.includes(user.role.slug) : false;

  const requirementFields = isWorker ? [
    { label: 'Requiere adjunto', value: edit.fields.requiresAttachment, set: (v: boolean) => edit.updateField('requiresAttachment', v) },
    { label: 'Requiere comentario de cierre', value: edit.fields.requiresComment, set: (v: boolean) => edit.updateField('requiresComment', v) },
  ] : [
    { label: 'Requiere adjunto', value: edit.fields.requiresAttachment, set: (v: boolean) => edit.updateField('requiresAttachment', v) },
    { label: 'Requiere comentario de cierre', value: edit.fields.requiresComment, set: (v: boolean) => edit.updateField('requiresComment', v) },
    { label: 'Requiere aprobación del encargado', value: edit.fields.requiresApproval, set: (v: boolean) => edit.updateField('requiresApproval', v) },
    { label: 'Requiere fecha límite', value: edit.fields.requiresDueDate, set: (v: boolean) => edit.updateField('requiresDueDate', v) },
  ];

  const notificationFields = isWorker ? [] : [
    { label: 'Notificar al vencer', value: edit.fields.notifyDue, set: (v: boolean) => edit.updateField('notifyDue', v) },
    { label: 'Notificar si vencida', value: edit.fields.notifyOverdue, set: (v: boolean) => edit.updateField('notifyOverdue', v) },
    { label: 'Notificar al completarse', value: edit.fields.notifyCompletion, set: (v: boolean) => edit.updateField('notifyCompletion', v) },
    { label: 'Notificar al completar (usuario)', value: edit.fields.requiresNotification, set: (v: boolean) => edit.updateField('requiresNotification', v) },
  ];

  if (loading) return <SkeletonDetail />;
  if (!task) return null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/tasks')} className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">
          <HiOutlineArrowLeft className="h-5 w-5" /> Volver a tareas
        </button>

        <AnimatePresence>
          {actionError && (
            <SlideDown>
              <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
                <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
                {actionError}
              </div>
            </SlideDown>
          )}
          {actionSuccess && (
            <SlideDown>
              <div className="mb-4 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
                <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
                {actionSuccess}
              </div>
            </SlideDown>
          )}
        </AnimatePresence>

        {/* Task Header */}
        <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          <AnimatePresence mode="wait">
            {edit.editing ? (
              <TaskEditForm
                editTitle={edit.fields.title}
                setEditTitle={(v) => edit.updateField('title', v)}
                editDescription={edit.fields.description}
                setEditDescription={(v) => edit.updateField('description', v)}
                editPriority={edit.fields.priority}
                setEditPriority={(v) => edit.updateField('priority', v)}
                requirementFields={requirementFields}
                notificationFields={notificationFields}
                saving={edit.saving}
                onSave={edit.saveEdit}
                onCancel={edit.cancelEditing}
              />
            ) : (
              <m.div key="view-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
              {task.description && <p className="mt-2 text-slate-600 dark:text-slate-400">{task.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={STATUS_BADGE_VARIANT[task.status]} size="md">
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
              <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} size="md">
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Creado por</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-radar/10 dark:bg-cyber-radar/10 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light">{task.creator?.name?.charAt(0) ?? '?'}</span>
                <p className="text-sm text-slate-900 dark:text-white">{task.creator?.name ?? 'Desconocido'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Responsable</p>
              <div className="mt-1 flex items-center gap-2">
                {task.current_responsible ? (
                  <>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-xs font-medium text-cyber-navy dark:text-cyber-radar-light">{task.current_responsible.name.charAt(0)}</span>
                    <p className="text-sm text-slate-900 dark:text-white">{task.current_responsible.name}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">Sin asignar</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Área</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">{task.area?.name ?? task.assigned_area?.name ?? 'Sin área'}</p>
            </div>
            {task.due_date && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Fecha límite</p>
                <p className={`mt-1 flex items-center gap-1.5 text-sm ${task.is_overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                  <HiOutlineClock className="h-5 w-5" />
                  {formatDate(task.due_date)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Avance</p>
              <div className="mt-1.5 flex items-center gap-2">
                {(() => {
                  const pct = taskProgress(task);
                  const barColor =
                    pct >= 100 ? 'from-green-500 to-emerald-500' :
                    pct >= 75 ? 'from-purple-500 to-violet-500' :
                    pct >= 25 ? 'from-cyber-radar to-cyber-navy' :
                    'from-slate-300 to-slate-300';
                  return (
                    <>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-white/10">
                        <div className={`h-2 rounded-full bg-linear-to-r ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{pct}%</span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Antigüedad</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-white">{task.age_days} días</p>
            </div>
            {task.meeting && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Reunión de origen</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{task.meeting.title}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-2 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
            <TaskStatusSelect
              task={task}
              userId={user?.id}
              userRole={user?.role.slug}
              onUpdated={(updated) => {
                setTask(updated);
                showMessage('Estado actualizado correctamente');
              }}
            />
            {perms.canEdit && (
              <button type="button" onClick={() => edit.startEditing()} className="inline-flex items-center gap-1.5 rounded-sm bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.98]">
                <HiOutlinePencil className="h-5 w-5" /> Editar
              </button>
            )}
            {perms.canDelegate && (
              <button type="button" onClick={handleDelegateOpen} className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <HiOutlineRefresh className="h-5 w-5" /> Delegar
              </button>
            )}
            {perms.canUpload && (
              <button type="button" onClick={() => setShowUploadForm(true)} className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <HiOutlineUpload className="h-5 w-5" /> Adjuntar
              </button>
            )}
            {perms.canComment && (
              <button type="button" onClick={() => setShowCommentForm(true)} className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <HiOutlineChatAlt className="h-5 w-5" /> Comentar
              </button>
            )}
            {perms.canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2 rounded-sm border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-4 py-2">
                  <span className="text-sm text-red-700 dark:text-red-400">¿Eliminar?</span>
                  <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50">
                    {deleting ? <Spinner size="sm" /> : null}
                    Sí, eliminar
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
                    No
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30">
                  <HiOutlineTrash className="h-5 w-5" /> Eliminar
                </button>
              )
            )}
          </div>
              </m.div>
            )}
          </AnimatePresence>
        </FadeIn>

        {/* Modal forms */}
        <AnimatePresence>
          {showCommentForm && (
            <CommentFormPanel form={commentForm} onSubmit={onComment} onClose={() => setShowCommentForm(false)} />
          )}
          {showApproveForm && (
            <ApproveFormPanel form={approveForm} onSubmit={onApprove} onClose={() => setShowApproveForm(false)} />
          )}
          {showRejectForm && (
            <RejectFormPanel form={rejectForm} onSubmit={onReject} onClose={() => setShowRejectForm(false)} />
          )}
          {showDelegateForm && (
            <DelegateFormPanel form={delegateForm} onSubmit={onDelegate} onClose={() => setShowDelegateForm(false)} members={areaMembers} loading={membersLoading} />
          )}
          {showUploadForm && (
            <UploadFormPanelV2
              taskId={taskId}
              onUploaded={() => { setShowUploadForm(false); setAttachmentsKey((k) => k + 1); showMessage('Archivo subido'); }}
              onClose={() => setShowUploadForm(false)}
            />
          )}
        </AnimatePresence>

        {task.requires_attachment && (
          <TaskAttachmentsV2
            key={attachmentsKey}
            taskId={taskId}
            requiresAttachment={task.requires_attachment}
          />
        )}
        <TaskComments comments={task.comments ?? []} />
        <TaskStatusHistory history={task.status_history ?? []} />
        <TaskUpdates updates={task.updates ?? []} />
      </div>
    </PageTransition>
  );
}

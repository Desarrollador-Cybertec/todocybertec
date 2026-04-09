import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { tasksApi } from '../../../api/tasks';
import { areasApi } from '../../../api/areas';
import { usersApi } from '../../../api/users';
import { TASK_PRIORITY_LABELS } from '../../../types/enums';
import type { TaskPriorityType } from '../../../types/enums';
import { formatDate } from '../../../utils';
import type { User, Area } from '../../../types';
import { Badge, PRIORITY_BADGE_VARIANT, Spinner, FadeIn } from '../../../components/ui';
import { MeetingDraftTaskForm } from './MeetingDraftTaskForm';

/* ── types ── */
interface DraftTask {
  tempId: string;
  title: string;
  description: string;
  priority: TaskPriorityType;
  due_date: string;
  assigned_to_user_id: number | null;
  assigned_to_area_id: number | null;
  requires_attachment: boolean;
  requires_completion_comment: boolean;
  requires_manager_approval: boolean;
  requires_progress_report: boolean;
  notify_on_due: boolean;
  notify_on_overdue: boolean;
  notify_on_completion: boolean;
}

interface Props {
  meetingId: number;
  areaId: number | null;
  isClosed?: boolean;
  onTasksCreated: () => void;
}

const EMPTY_DRAFT: Omit<DraftTask, 'tempId'> = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  assigned_to_user_id: null,
  assigned_to_area_id: null,
  requires_attachment: false,
  requires_completion_comment: false,
  requires_manager_approval: true,
  requires_progress_report: false,
  notify_on_due: true,
  notify_on_overdue: true,
  notify_on_completion: false,
};

function genId() {
  return crypto.randomUUID();
}

export function MeetingTasksSection({ meetingId, areaId, isClosed, onTasksCreated }: Props) {
  const [drafts, setDrafts] = useState<DraftTask[]>([]);
  const [areaMembers, setAreaMembers] = useState<User[]>([]);
  const [otherAreas, setOtherAreas] = useState<Area[]>([]);
  const [meetingAreaName, setMeetingAreaName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* form fields (shared for add & edit) */
  const [form, setForm] = useState<Omit<DraftTask, 'tempId'>>(EMPTY_DRAFT);

  /* load users + areas */
  useEffect(() => {
    (async () => {
      const allAreas = await areasApi.listAll().catch(() => [] as Area[]);

      if (areaId) {
        const numAreaId = Number(areaId);
        setOtherAreas(allAreas.filter((a) => a.id !== numAreaId));

        // Use areasApi.get() which returns the area with embedded members[]
        const areaDetail = await areasApi.get(numAreaId).catch(() => null);
        setMeetingAreaName(areaDetail?.name ?? allAreas.find((a) => a.id === numAreaId)?.name ?? '');

        const memberMap = new Map<number, User>();
        if (areaDetail?.members) {
          areaDetail.members
            .filter((m) => m.is_active)
            .forEach((m) => {
              // API returns user fields directly on the member object (user_id, name, email…)
              // Fall back to m.user if the shape changes in the future
              const u: User = m.user ?? {
                id: m.user_id,
                name: (m as unknown as Record<string, string>).name,
                email: (m as unknown as Record<string, string>).email,
                role: (m as unknown as { role: User['role'] }).role,
                active: (m as unknown as { active: boolean }).active,
                role_id: (m as unknown as { role: { id: number } }).role?.id,
                created_at: '',
                updated_at: '',
              };
              memberMap.set(u.id, u);
            });
        }
        if (areaDetail?.manager) {
          memberMap.set(areaDetail.manager.id, areaDetail.manager);
        }

        setAreaMembers([...memberMap.values()]);
      } else {
        const allUsers = await usersApi.listAll().catch(() => [] as User[]);
        setAreaMembers(allUsers);
        setMeetingAreaName('Usuarios');
        setOtherAreas(allAreas);
      }
    })();
  }, [areaId]);

  /* helper: resolve display name */
  const getAssigneeName = useCallback(
    (draft: DraftTask) => {
      if (draft.assigned_to_user_id) {
        return areaMembers.find((u) => u.id === draft.assigned_to_user_id)?.name ?? 'Usuario';
      }
      if (draft.assigned_to_area_id) {
        const area = otherAreas.find((a) => a.id === draft.assigned_to_area_id);
        return area ? `Área: ${area.name}` : 'Área';
      }
      return 'Sin asignar';
    },
    [areaMembers, otherAreas],
  );

  /* ── form handlers ── */
  const resetForm = () => {
    setForm(EMPTY_DRAFT);
    setShowForm(false);
    setEditingId(null);
  };

  const handleAssigneeChange = (value: string) => {
    if (!value) {
      setForm((f) => ({ ...f, assigned_to_user_id: null, assigned_to_area_id: null }));
    } else if (value.startsWith('area:')) {
      setForm((f) => ({ ...f, assigned_to_user_id: null, assigned_to_area_id: Number(value.slice(5)) }));
    } else {
      setForm((f) => ({ ...f, assigned_to_user_id: Number(value), assigned_to_area_id: null }));
    }
  };

  const assigneeValue = () => {
    if (form.assigned_to_user_id) return String(form.assigned_to_user_id);
    if (form.assigned_to_area_id) return `area:${form.assigned_to_area_id}`;
    return '';
  };

  const addDraft = () => {
    if (!form.title.trim()) return;
    setDrafts((prev) => [...prev, { ...form, tempId: genId() }]);
    resetForm();
  };

  const startEdit = (draft: DraftTask) => {
    setEditingId(draft.tempId);
    setShowForm(false);
    setForm({
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      due_date: draft.due_date,
      assigned_to_user_id: draft.assigned_to_user_id,
      assigned_to_area_id: draft.assigned_to_area_id,
      requires_attachment: draft.requires_attachment,
      requires_completion_comment: draft.requires_completion_comment,
      requires_manager_approval: draft.requires_manager_approval,
      requires_progress_report: draft.requires_progress_report,
      notify_on_due: draft.notify_on_due,
      notify_on_overdue: draft.notify_on_overdue,
      notify_on_completion: draft.notify_on_completion,
    });
  };

  const saveEdit = () => {
    if (!form.title.trim() || !editingId) return;
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === editingId ? { ...form, tempId: d.tempId } : d)),
    );
    resetForm();
  };

  const removeDraft = (tempId: string) => {
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
    if (editingId === tempId) resetForm();
  };

  /* ── batch submit ── */
  const submitAll = async () => {
    if (!drafts.length) return;
    setSubmitting(true);
    setError('');
    try {
      await Promise.all(
        drafts.map((d) =>
          tasksApi.create({
            title: d.title,
            description: d.description || undefined,
            priority: d.priority,
            due_date: d.due_date || undefined,
            meeting_id: meetingId,
            assigned_to_user_id: d.assigned_to_user_id ?? undefined,
            assigned_to_area_id: d.assigned_to_area_id ?? undefined,
            requires_attachment: d.requires_attachment,
            requires_completion_comment: d.requires_completion_comment,
            requires_manager_approval: d.requires_manager_approval,
            requires_progress_report: d.requires_progress_report,
            notify_on_due: d.notify_on_due,
            notify_on_overdue: d.notify_on_overdue,
            notify_on_completion: d.notify_on_completion,
          }),
        ),
      );
      setDrafts([]);
      onTasksCreated();
    } catch {
      setError('Error al crear las tareas. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const draftFormProps = {
    form,
    setForm,
    areaMembers,
    otherAreas,
    meetingAreaName,
    assigneeValue: assigneeValue(),
    onAssigneeChange: handleAssigneeChange,
    onCancel: resetForm,
  };

  if (isClosed) {
    return (
      <FadeIn delay={0.15} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <HiOutlineUserGroup className="h-6 w-6 text-slate-400 dark:text-slate-500" />
          Compromisos de reunión
        </h3>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Esta reunión está cerrada. No se pueden agregar nuevos compromisos.
        </p>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={0.15} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <HiOutlineUserGroup className="h-6 w-6 text-cyber-radar dark:text-cyber-radar-light" />
        Crear compromisos de reunión
      </h3>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
          <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* draft list */}
      {drafts.length > 0 && (
        <div className="mb-4 space-y-2">
          {drafts.map((draft) => (
            <div key={draft.tempId}>
              {editingId === draft.tempId ? (
                <AnimatePresence><MeetingDraftTaskForm {...draftFormProps} isEditing onSave={saveEdit} /></AnimatePresence>
              ) : (
                <m.div
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{draft.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={PRIORITY_BADGE_VARIANT[draft.priority]} size="sm">
                        {TASK_PRIORITY_LABELS[draft.priority]}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{getAssigneeName(draft)}</span>
                      {draft.due_date && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          📅 {formatDate(draft.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(draft)}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 hover:text-cyber-radar dark:hover:text-cyber-radar-light"
                      title="Editar"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDraft(draft.tempId)}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                      title="Eliminar"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </m.div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* add form */}
      <AnimatePresence>{showForm && <MeetingDraftTaskForm {...draftFormProps} isEditing={false} onSave={addDraft} />}</AnimatePresence>

      {/* actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_DRAFT);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-dashed border-slate-300 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all hover:border-cyber-radar hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 hover:text-cyber-radar dark:hover:text-cyber-radar-light"
          >
            <HiOutlinePlus className="h-5 w-5" /> Agregar compromiso
          </button>
        )}

        {drafts.length > 0 && !showForm && !editingId && (
          <button
            type="button"
            onClick={submitAll}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-sm bg-linear-to-r from-cyber-radar to-cyber-navy px-5 py-2 text-sm font-medium text-white shadow-md shadow-cyber-radar/25 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="border-white border-t-transparent" /> Guardando…
              </>
            ) : (
              <>
                <HiOutlineCheck className="h-5 w-5" /> Guardar compromisos ({drafts.length})
              </>
            )}
          </button>
        )}
      </div>

      {drafts.length === 0 && !showForm && (
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
          Agrega los compromisos que surgieron de esta reunión. Se crearán todos juntos al guardar.
        </p>
      )}
    </FadeIn>
  );
}

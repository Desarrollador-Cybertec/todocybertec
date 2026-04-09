import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingsApi } from '../../api/meetings';
import { MEETING_CLASSIFICATION_LABELS, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, ADMIN_ROLES } from '../../types/enums';
import type { Meeting } from '../../types';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../api/client';
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineChevronRight, HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineLockClosed } from 'react-icons/hi';
import { PageTransition, FadeIn, StaggerList, StaggerItem, Badge, STATUS_BADGE_VARIANT, PRIORITY_BADGE_VARIANT, SkeletonDetail, Spinner } from '../../components/ui';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { MeetingTasksSection } from './components/MeetingTasksSection';
import { formatDate, formatDateTime } from '../../utils';

const CLASSIFICATION_VARIANT: Record<string, 'purple' | 'blue' | 'green' | 'amber'> = {
  operational: 'blue',
  strategic: 'purple',
  follow_up: 'green',
  other: 'amber',
};

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editClassification, setEditClassification] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closing, setClosing] = useState(false);

  const loadMeeting = useCallback(() => {
    meetingsApi.get(Number(id))
      .then((res) => setMeeting(res))
      .catch(() => navigate('/meetings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const isCreator = meeting && Number(meeting.created_by) === Number(user?.id);
  const canClose = meeting && !meeting.is_closed && (isCreator || (user && ADMIN_ROLES.includes(user.role.slug)));
  const canEdit = isCreator && !meeting?.is_closed;

  const handleCloseMeeting = async () => {
    if (!meeting) return;
    setClosing(true);
    try {
      await meetingsApi.close(meeting.id);
      loadMeeting();
    } catch (error) {
      setEditError(error instanceof ApiError ? error.data.message : 'Error al cerrar la reunión');
    } finally {
      setClosing(false);
      setShowCloseConfirm(false);
    }
  };

  const startEditing = () => {
    if (!meeting) return;
    setEditTitle(meeting.title);
    setEditDate(meeting.meeting_date?.slice(0, 10) ?? '');
    setEditClassification(meeting.classification);
    setEditNotes(meeting.notes ?? '');
    setEditError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError('');
  };

  const saveEdit = async () => {
    if (!meeting) return;
    setEditSaving(true);
    setEditError('');
    try {
      const updates: Record<string, string> = {};
      if (editTitle !== meeting.title) updates.title = editTitle;
      if (editDate !== (meeting.meeting_date?.slice(0, 10) ?? '')) updates.meeting_date = editDate;
      if (editClassification !== meeting.classification) updates.classification = editClassification;
      if ((editNotes || '') !== (meeting.notes || '')) updates.notes = editNotes;
      if (Object.keys(updates).length > 0) {
        await meetingsApi.update(meeting.id, updates);
        loadMeeting();
      }
      setEditing(false);
    } catch (error) {
      setEditError(error instanceof ApiError ? error.data.message : 'Error al actualizar la reunión');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!meeting) return null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate('/meetings')} className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">
          <HiOutlineArrowLeft className="h-5 w-5" /> Volver a reuniones
        </button>

        <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          {editing ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar reunión</h3>
              {editError && (
                <p className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2 text-sm text-red-600 dark:text-red-400">{editError}</p>
              )}
              <div>
                <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
                <input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-date" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                  <input id="edit-date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="edit-classification" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Clasificación</label>
                  <select id="edit-classification" value={editClassification} onChange={(e) => setEditClassification(e.target.value)} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none">
                    {Object.entries(MEETING_CLASSIFICATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="edit-notes" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Notas</label>
                <textarea id="edit-notes" rows={4} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
                <button type="button" onClick={cancelEditing} className="inline-flex items-center gap-1.5 rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                  <HiOutlineX className="h-5 w-5" /> Cancelar
                </button>
                <button type="button" onClick={saveEdit} disabled={editSaving || !editTitle.trim()} className="inline-flex items-center gap-1.5 rounded-sm bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
                  {editSaving ? <Spinner size="sm" /> : <HiOutlineCheck className="h-5 w-5" />}
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
          <>
          <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{meeting.title}</h2>
            {meeting.is_closed && (
              <Badge variant="red" size="md">
                <HiOutlineLockClosed className="mr-1 inline h-5 w-5" />
                Cerrada
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canClose && (
              <button type="button" onClick={() => setShowCloseConfirm(true)} className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-[0.98]">
                <HiOutlineLockClosed className="h-5 w-5" /> Cerrar reunión
              </button>
            )}
            {canEdit && (
              <button type="button" onClick={startEditing} className="inline-flex items-center gap-1.5 rounded-sm bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-600 active:scale-[0.98]">
                <HiOutlinePencil className="h-5 w-5" /> Editar
              </button>
            )}
          </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Fecha</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-900 dark:text-white">
                <HiOutlineCalendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                {formatDate(meeting.meeting_date)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Clasificación</p>
              <div className="mt-1">
                <Badge variant={CLASSIFICATION_VARIANT[meeting.classification] ?? 'gray'} size="md">
                  {MEETING_CLASSIFICATION_LABELS[meeting.classification]}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Creado por</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/30 text-xs font-medium text-purple-600 dark:text-purple-400">{meeting.creator.name.charAt(0)}</span>
                <p className="text-sm text-slate-900 dark:text-white">{meeting.creator.name}</p>
              </div>
            </div>
            {meeting.area && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Área</p>
                <p className="mt-1 text-sm text-slate-900 dark:text-white">{meeting.area.name}</p>
              </div>
            )}
            {meeting.is_closed && meeting.closed_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Cerrada el</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formatDateTime(meeting.closed_at)}
                </p>
              </div>
            )}
          </div>
          {meeting.notes && (
            <div className="mt-4 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Notas</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{meeting.notes}</p>
            </div>
          )}
          </>
          )}
        </FadeIn>

        {meeting.tasks && meeting.tasks.length > 0 && (
          <FadeIn delay={0.1} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              Compromisos de esta reunión
              <span className="rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">{meeting.tasks.length}</span>
            </h3>
            <StaggerList className="space-y-3">
              {meeting.tasks.map((task) => (
                <StaggerItem key={task.id}>
                  <Link to={`/tasks/${task.id}`} className="group flex items-center justify-between rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 p-4 transition-all hover:border-cyber-radar/10 dark:hover:border-cyber-radar/20 hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant={STATUS_BADGE_VARIANT[task.status]} size="sm">{TASK_STATUS_LABELS[task.status]}</Badge>
                        <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                        {task.current_responsible && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-[9px] font-medium text-cyber-navy dark:text-cyber-radar-light">{task.current_responsible.name.charAt(0)}</span>
                            {task.current_responsible.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <HiOutlineChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-500 transition-colors group-hover:text-cyber-radar dark:group-hover:text-cyber-radar-light" />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          </FadeIn>
        )}

        <MeetingTasksSection
          meetingId={meeting.id}
          areaId={meeting.area_id ?? meeting.area?.id ?? null}
          isClosed={meeting.is_closed}
          onTasksCreated={loadMeeting}
        />

        <ConfirmModal
          open={showCloseConfirm}
          title="Cerrar reunión"
          message="Una vez cerrada, no se podrán editar los datos ni agregar nuevos compromisos. ¿Deseas continuar?"
          confirmLabel={closing ? 'Cerrando...' : 'Cerrar reunión'}
          variant="danger"
          onConfirm={handleCloseMeeting}
          onCancel={() => setShowCloseConfirm(false)}
        />
      </div>
    </PageTransition>
  );
}

import { AnimatePresence, m } from 'framer-motion';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { HiOutlineShieldCheck, HiOutlineBell } from 'react-icons/hi';
import type { CreateTaskFormData } from '../../../schemas';
import type { Area, Meeting } from '../../../types';
import { FadeIn } from '../../../components/ui';
import { Spinner } from '../../../components/ui';

/* ── toggle sub-component ── */
function ToggleField({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
      <div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-cyber-radar' : 'bg-slate-300 dark:bg-white/10'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-cyber-grafito shadow transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

interface Props {
  register: UseFormRegister<CreateTaskFormData>;
  setValue: UseFormSetValue<CreateTaskFormData>;
  isWorker: boolean;
  isPersonalTask: boolean;
  isSubmitting: boolean;
  errors: Record<string, { message?: string }>;
  areas: Area[];
  meetings: Meeting[];
  hasUser: boolean;
  hasArea: boolean;
  hasExternalEmail: boolean;
  reqAttach: boolean;
  reqComment: boolean;
  reqApproval: boolean;
  notDue: boolean;
  notOverdue: boolean;
  notCompletion: boolean;
  onCancel: () => void;
}

export function TaskCreateAdvanced({
  register,
  setValue,
  isWorker,
  isPersonalTask,
  isSubmitting,
  errors,
  areas,
  meetings,
  hasUser,
  hasArea,
  hasExternalEmail,
  reqAttach,
  reqComment,
  reqApproval,
  notDue,
  notOverdue,
  notCompletion,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 overflow-hidden"
      >
        {/* description + dates + meeting */}
        <FadeIn delay={0.05} id="task-create-details" className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Detalles adicionales</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
              <textarea id="description" rows={3} {...register('description')} placeholder="Describe la tarea con más detalle…" className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-all focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
            </div>
            <div className={`grid gap-4 ${!isWorker ? 'sm:grid-cols-2' : ''}`}>
              <div>
                <label htmlFor="start_date" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha inicio</label>
                <input id="start_date" type="date" {...register('start_date')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none" />
              </div>
              {!isWorker && (
              <div>
                <label htmlFor="meeting_id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Reunión de origen</label>
                <select id="meeting_id" {...register('meeting_id', { setValueAs: (v: string) => v ? Number(v) : null })} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none">
                  <option value="">Sin reunión</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* area / external (non-worker) */}
        {!isWorker && (
          <FadeIn delay={0.1} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Asignación alternativa</h3>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Si ya seleccionaste un usuario arriba, estas opciones se deshabilitan automáticamente.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="assigned_to_area_id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Asignar a área</label>
                <select
                  id="assigned_to_area_id"
                  {...register('assigned_to_area_id', { setValueAs: (v: string) => v ? Number(v) : null })}
                  disabled={hasUser || hasExternalEmail}
                  className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500"
                >
                  <option value="">Sin asignar</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="external_email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo externo</label>
                  <input
                    id="external_email"
                    type="email"
                    {...register('external_email')}
                    disabled={hasUser || hasArea}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500"
                  />
                  {errors.external_email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.external_email.message}</p>}
                </div>
                <div>
                  <label htmlFor="external_name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre externo</label>
                  <input
                    id="external_name"
                    type="text"
                    {...register('external_name')}
                    disabled={hasUser || hasArea}
                    placeholder="Nombre del destinatario"
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm focus:border-cyber-radar focus:outline-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* requirements */}
        <FadeIn delay={0.15} id="task-create-requirements" className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <HiOutlineShieldCheck className="h-6 w-6 text-cyber-radar dark:text-cyber-radar-light" /> Requisitos
          </h3>
          <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">Configura qué necesita la tarea para completarse.</p>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            <ToggleField label="Requiere adjunto" description="El responsable deberá subir evidencia." checked={!!reqAttach} onChange={(v) => setValue('requires_attachment', v)} />
            <ToggleField label="Comentario de cierre" description="Obligatorio al marcar como completada." checked={!!reqComment} onChange={(v) => setValue('requires_completion_comment', v)} />
            {!isWorker && !isPersonalTask && (
              <>
                <ToggleField label="Aprobación del jefe" description="Necesita validación antes de cerrarse." checked={!!reqApproval} onChange={(v) => setValue('requires_manager_approval', v)} />
              </>
            )}
          </div>
        </FadeIn>

        {/* notifications */}
        {!isPersonalTask && (
        <FadeIn delay={0.2} id="task-create-notifications" className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <HiOutlineBell className="h-6 w-6 text-yellow-500 dark:text-yellow-400" /> Notificaciones
          </h3>
          <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">Decide qué avisos quieres recibir.</p>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            <ToggleField label="Al vencer" checked={!!notDue} onChange={(v) => setValue('notify_on_due', v)} />
            <ToggleField label="Si vencida" checked={!!notOverdue} onChange={(v) => setValue('notify_on_overdue', v)} />
            <ToggleField label="Al completar" checked={!!notCompletion} onChange={(v) => setValue('notify_on_completion', v)} />
          </div>
        </FadeIn>
        )}

        {/* bottom actions */}
        <div className="flex justify-end gap-3 pb-2">
          <button type="button" onClick={onCancel} className="rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-sm bg-linear-to-r from-cyber-radar to-cyber-navy px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-cyber-radar/25 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Creando...</> : 'Crear tarea'}
          </button>
        </div>
      </m.div>
    </AnimatePresence>
  );
}

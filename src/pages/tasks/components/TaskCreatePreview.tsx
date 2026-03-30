import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlinePaperClip,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import { TASK_PRIORITY_LABELS } from '../../../types/enums';
import { FadeIn } from '../../../components/ui';

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  low:    { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  medium: { bg: 'bg-sky-50 dark:bg-sky-900/30',     text: 'text-sky-700 dark:text-sky-400',     dot: 'bg-sky-500' },
  high:   { bg: 'bg-amber-50 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500' },
  urgent: { bg: 'bg-rose-50 dark:bg-rose-900/30',    text: 'text-rose-700 dark:text-rose-400',    dot: 'bg-rose-500' },
};

const TIPS = [
  'Un título claro ayuda a entender la tarea de un vistazo.',
  'Asigna una fecha límite para mantener el control de los plazos.',
  'Usa la prioridad para resaltar lo más urgente.',
  'Activa "Requiere adjunto" si necesitas evidencia de cumplimiento.',
];

interface Props {
  title: string;
  priority: string;
  assigneeName: string;
  dueDate?: string;
  reqAttach?: boolean;
  reqComment?: boolean;
  reqApproval?: boolean;
}

export function TaskCreatePreview({
  title,
  priority,
  assigneeName,
  dueDate,
  reqAttach,
  reqComment,
  reqApproval,
}: Props) {
  const pStyle = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;

  return (
    <div className="hidden space-y-6 lg:block">
      <div className="sticky top-6 space-y-6">
        <FadeIn delay={0.1} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <HiOutlineEye className="h-4 w-4 text-cyber-radar dark:text-cyber-radar-light" /> Vista previa
          </h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Título</span>
              <p className={`font-medium ${title ? 'text-slate-900 dark:text-white' : 'italic text-slate-300 dark:text-slate-500'}`}>
                {title || 'Sin título'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Prioridad</span>
              <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${pStyle.bg} ${pStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                {TASK_PRIORITY_LABELS[priority as keyof typeof TASK_PRIORITY_LABELS] ?? priority}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Responsable</span>
              <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <HiOutlineUser className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {assigneeName}
              </p>
            </div>
            {dueDate && (
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Fecha límite</span>
                <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <HiOutlineCalendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {dueDate}
                </p>
              </div>
            )}
            {(reqAttach || reqComment || reqApproval) && (
              <div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Requisitos activos</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {reqAttach   && <span className="rounded-full bg-cyber-radar/5 dark:bg-cyber-radar/20/30 px-2 py-0.5 text-xs text-cyber-radar dark:text-cyber-radar-light"><HiOutlinePaperClip className="mr-0.5 inline h-3 w-3" />Adjunto</span>}
                  {reqComment  && <span className="rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-xs text-purple-600 dark:text-purple-400">Comentario</span>}
                  {reqApproval && <span className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">Aprobación</span>}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="rounded-sm border border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/20 p-5 shadow-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <HiOutlineLightBulb className="h-4 w-4" /> Consejos
          </h4>
          <ul className="space-y-2">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {tip}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </div>
  );
}

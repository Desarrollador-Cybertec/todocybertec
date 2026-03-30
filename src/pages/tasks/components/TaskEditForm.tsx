import {  motion } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import { TASK_PRIORITY_LABELS } from '../../../types/enums';
import { Spinner } from '../../../components/ui';

interface EditField {
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}

interface Props {
  editTitle: string;
  setEditTitle: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editPriority: string;
  setEditPriority: (v: string) => void;
  editDueDate: string;
  setEditDueDate: (v: string) => void;
  editStartDate: string;
  setEditStartDate: (v: string) => void;
  requirementFields: EditField[];
  notificationFields: EditField[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function TaskEditForm({
  editTitle, setEditTitle,
  editDescription, setEditDescription,
  editPriority, setEditPriority,
  editDueDate, setEditDueDate,
  editStartDate, setEditStartDate,
  requirementFields, notificationFields,
  saving, onSave, onCancel,
}: Props) {
  return (
    <motion.div
      key="edit-mode"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar tarea</h3>
        <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-400">
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={3}
          className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Prioridad</label>
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
          >
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha límite</label>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de inicio</label>
          <input
            type="date"
            value={editStartDate}
            onChange={(e) => setEditStartDate(e.target.value)}
            className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
          />
        </div>
      </div>

      <CheckboxGroup title="Requisitos" fields={requirementFields} />
      <CheckboxGroup title="Notificaciones" fields={notificationFields} />

      <div className="flex justify-end gap-3 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
        <button type="button" onClick={onCancel} className="rounded-sm px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !editTitle.trim()}
          className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <><Spinner size="sm" /> Guardando...</> : 'Guardar cambios'}
        </button>
      </div>
    </motion.div>
  );
}

function CheckboxGroup({ title, fields }: { title: string; fields: EditField[] }) {
  return (
    <div className="rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {fields.map((opt) => (
          <label key={opt.label} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-white dark:hover:bg-white/5">
            <input
              type="checkbox"
              checked={opt.value}
              onChange={(e) => opt.set(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-white/10 text-cyber-radar dark:text-cyber-radar-light focus:ring-cyber-radar/20"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

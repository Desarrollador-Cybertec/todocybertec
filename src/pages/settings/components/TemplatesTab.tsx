import React from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import type { MessageTemplate } from '../../../types';
import { FadeIn, Badge } from '../../../components/ui';

const TEMPLATE_VARIABLES = [
  { variable: '{{user_name}}', desc: 'Nombre del usuario' },
  { variable: '{{task_title}}', desc: 'Título de la tarea' },
  { variable: '{{task_status}}', desc: 'Estado de la tarea' },
  { variable: '{{task_priority}}', desc: 'Prioridad de la tarea' },
  { variable: '{{due_date}}', desc: 'Fecha límite' },
  { variable: '{{area_name}}', desc: 'Nombre del área' },
  { variable: '{{app_name}}', desc: 'Nombre de la aplicación' },
  { variable: '{{app_url}}', desc: 'URL de la aplicación' },
];

export function TemplatesTab({
  templates,
  templateDrafts,
  updateTemplateDraft,
  hasPendingTemplateDrafts,
  saving,
  savingTemplateId,
  confirmingTemplateId,
  setConfirmingTemplateId,
  saveTemplate,
  discardTemplateDraft,
  saveAllTemplates,
  insertVariable,
  lastFocusedRef,
  handleDrop,
  handleDragOver,
}: {
  templates: MessageTemplate[];
  templateDrafts: Record<number, Partial<Pick<MessageTemplate, 'subject' | 'body' | 'active'>>>;
  updateTemplateDraft: (id: number, changes: Partial<Pick<MessageTemplate, 'subject' | 'body' | 'active'>>) => void;
  hasPendingTemplateDrafts: boolean;
  saving: boolean;
  savingTemplateId: number | null;
  confirmingTemplateId: number | null;
  setConfirmingTemplateId: (id: number | null) => void;
  saveTemplate: (id: number) => void;
  discardTemplateDraft: (id: number) => void;
  saveAllTemplates: () => void;
  insertVariable: (variable: string, templateId?: number, field?: 'subject' | 'body') => void;
  lastFocusedRef: React.MutableRefObject<{ templateId: number; field: 'subject' | 'body'; element: HTMLInputElement | HTMLTextAreaElement } | null>;
  handleDrop: (e: React.DragEvent, templateId: number, field: 'subject' | 'body') => void;
  handleDragOver: (e: React.DragEvent) => void;
}) {
  return (
    <div className="space-y-3">
      <FadeIn className="rounded-sm border border-cyber-navy/10 dark:border-cyber-navy/20 bg-cyber-navy/5/50 dark:bg-cyber-navy/20/20 p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyber-navy dark:text-cyber-radar-light">
          <HiOutlineInformationCircle className="h-5 w-5" /> Variables disponibles
        </div>
        <p className="mb-2 text-xs text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light/70">Haz clic en una variable para insertarla, o arrástrala al campo de asunto o cuerpo.</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.variable}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', v.variable);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => insertVariable(v.variable)}
              className="group flex items-center gap-1.5 rounded-lg bg-cyber-navy/10 dark:bg-cyber-navy/20/40 px-2.5 py-1.5 text-xs transition-all hover:bg-cyber-navy/20 hover:shadow-sm active:scale-95 cursor-grab active:cursor-grabbing"
              title={v.desc}
            >
              <code className="font-mono font-semibold text-cyber-navy dark:text-cyber-radar-light">{v.variable}</code>
              <span className="text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light/70">{v.desc}</span>
            </button>
          ))}
        </div>
      </FadeIn>
      {templates.map((t) => {
        const draft = templateDrafts[t.id];
        const currentSubject = draft?.subject ?? t.subject;
        const currentBody = draft?.body ?? t.body;
        const currentActive = draft?.active ?? t.active;
        const isModified = t.id in templateDrafts;
        return (
          <FadeIn key={t.id} className={`rounded-sm border bg-white dark:bg-cyber-grafito p-4 shadow-sm ${isModified ? 'border-cyber-radar/20 dark:border-cyber-radar/20' : 'border-slate-200 dark:border-white/5'}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                <span className="text-xs text-slate-400 dark:text-slate-500">{t.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => updateTemplateDraft(t.id, { active: !currentActive })}
                className="transition-all active:scale-[0.96]"
              >
                <Badge variant={currentActive ? 'green' : 'gray'} size="sm">{currentActive ? 'Activa' : 'Inactiva'}</Badge>
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Asunto</label>
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => updateTemplateDraft(t.id, { subject: e.target.value })}
                  onFocus={(e) => { lastFocusedRef.current = { templateId: t.id, field: 'subject', element: e.target }; }}
                  onDrop={(e) => handleDrop(e, t.id, 'subject')}
                  onDragOver={handleDragOver}
                  className={`mt-0.5 w-full rounded-lg border px-3 py-1.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 ${
                    isModified && draft?.subject != null ? 'border-cyber-radar dark:border-cyber-radar bg-cyber-radar/5/50 dark:bg-cyber-radar/20/20 text-slate-900 dark:text-white' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Cuerpo</label>
                <textarea
                  value={currentBody}
                  onChange={(e) => updateTemplateDraft(t.id, { body: e.target.value })}
                  onFocus={(e) => { lastFocusedRef.current = { templateId: t.id, field: 'body', element: e.target }; }}
                  onDrop={(e) => handleDrop(e, t.id, 'body')}
                  onDragOver={handleDragOver}
                  rows={3}
                  className={`mt-0.5 w-full rounded-lg border px-3 py-1.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 ${
                    isModified && draft?.body != null ? 'border-cyber-radar dark:border-cyber-radar bg-cyber-radar/5/50 dark:bg-cyber-radar/20/20 text-slate-900 dark:text-white' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white'
                  }`}
                />
              </div>
            </div>
            {isModified && (
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/5 pt-3">
                {confirmingTemplateId === t.id ? (
                  <>
                    <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">{'\u00bf'}Guardar cambios de esta plantilla?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmingTemplateId(null)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveTemplate(t.id)}
                      disabled={savingTemplateId === t.id}
                      className="rounded-lg bg-cyber-radar px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingTemplateId === t.id ? 'Guardando...' : 'Confirmar'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => discardTemplateDraft(t.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingTemplateId(t.id)}
                      className="rounded-lg bg-cyber-radar px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98]"
                    >
                      Guardar
                    </button>
                  </>
                )}
              </div>
            )}
          </FadeIn>
        );
      })}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveAllTemplates}
          disabled={!hasPendingTemplateDrafts || saving}
          className="rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar todas'}
        </button>
      </div>
    </div>
  );
}

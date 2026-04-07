import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { settingsApi, automationApi, importApi } from '../../api/settings';
import { rolesApi } from '../../api/roles';
import { ApiError } from '../../api/client';
import type { SystemSetting, MessageTemplate, RoleInfo } from '../../types';
import { HiOutlineCog, HiOutlineMail, HiOutlineLightningBolt, HiOutlineUpload, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineUsers } from 'react-icons/hi';
import { PageTransition, FadeIn, SlideDown, SkeletonCard, Badge, Spinner } from '../../components/ui';
import { SettingsTab } from './components/SettingsTab';
import { TemplatesTab } from './components/TemplatesTab';

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'templates' | 'roles' | 'automation' | 'import'>('settings');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [templateDrafts, setTemplateDrafts] = useState<Record<number, Partial<Pick<MessageTemplate, 'subject' | 'body' | 'active'>>>>({});
  const [saving, setSaving] = useState(false);
  const [savingTemplateId, setSavingTemplateId] = useState<number | null>(null);
  const [confirmingTemplateId, setConfirmingTemplateId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const lastFocusedRef = useRef<{ templateId: number; field: 'subject' | 'body'; element: HTMLInputElement | HTMLTextAreaElement } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, templatesRes, rolesRes] = await Promise.all([
        settingsApi.listSettings().catch(() => []),
        settingsApi.listTemplates().catch(() => [] as MessageTemplate[]),
        rolesApi.list().catch(() => [] as RoleInfo[]),
      ]);
      // API returns settings grouped as { group: [...] } — flatten to array
      let flatSettings: SystemSetting[];
      if (Array.isArray(settingsRes)) {
        flatSettings = settingsRes;
      } else if (settingsRes && typeof settingsRes === 'object') {
        flatSettings = Object.values(settingsRes as Record<string, SystemSetting[]>).flat();
      } else {
        flatSettings = [];
      }
      // API may return value as native types (true, 3) — normalize to string
      flatSettings = flatSettings.map((s) => ({
        ...s,
        value: String(s.value),
      }));
      setSettings(flatSettings);
      setTemplates(Array.isArray(templatesRes) ? templatesRes : []);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setMessage('');
  };

  const updateDraft = (key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const hasPendingChanges = Object.keys(drafts).length > 0;

  const saveAllSettings = async () => {
    if (!hasPendingChanges) return;
    setConfirmAction({
      title: 'Guardar configuración',
      description: `Se modificarán ${Object.keys(drafts).length} configuración(es). ¿Deseas continuar?`,
      onConfirm: async () => {
        setConfirmAction(null);
        setSaving(true);
        try {
          const changes = Object.entries(drafts).map(([key, value]) => ({ key, value }));
          await settingsApi.updateSettings(changes);
          setDrafts({});
          showMessage('Configuración guardada');
          loadData();
        } catch (err) {
          showError(err instanceof ApiError ? err.data.message : 'Error al guardar');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const updateTemplateDraft = (id: number, changes: Partial<Pick<MessageTemplate, 'subject' | 'body' | 'active'>>) => {
    setTemplateDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...changes },
    }));
  };

  const hasPendingTemplateDrafts = Object.keys(templateDrafts).length > 0;

  const saveTemplate = async (id: number) => {
    const changes = templateDrafts[id];
    if (!changes) return;
    setSavingTemplateId(id);
    try {
      await settingsApi.updateTemplate(id, changes);
      setTemplateDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setConfirmingTemplateId(null);
      showMessage('Plantilla guardada');
      loadData();
    } catch (err) {
      showError(err instanceof ApiError ? err.data.message : 'Error al guardar plantilla');
    } finally {
      setSavingTemplateId(null);
    }
  };

  const discardTemplateDraft = (id: number) => {
    setTemplateDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setConfirmingTemplateId(null);
  };

  const saveAllTemplates = async () => {
    if (!hasPendingTemplateDrafts) return;
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(templateDrafts).map(([id, changes]) =>
          settingsApi.updateTemplate(Number(id), changes)
        )
      );
      setTemplateDrafts({});
      showMessage('Todas las plantillas guardadas');
      loadData();
    } catch (err) {
      showError(err instanceof ApiError ? err.data.message : 'Error al guardar plantillas');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string, templateId?: number, field?: 'subject' | 'body') => {
    const target = templateId != null && field
      ? { templateId, field, element: lastFocusedRef.current?.element ?? null }
      : lastFocusedRef.current;
    if (!target) return;
    const { templateId: tId, field: f } = target;
    const tpl = templates.find((t) => t.id === tId);
    if (!tpl) return;
    const draft = templateDrafts[tId];
    const currentValue = f === 'subject' ? (draft?.subject ?? tpl.subject) : (draft?.body ?? tpl.body);
    const el = target.element;
    let newValue: string;
    if (el && document.activeElement === el) {
      const start = el.selectionStart ?? currentValue.length;
      const end = el.selectionEnd ?? start;
      newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
      updateTemplateDraft(tId, { [f]: newValue });
      requestAnimationFrame(() => {
        const pos = start + variable.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    } else {
      newValue = currentValue + variable;
      updateTemplateDraft(tId, { [f]: newValue });
    }
  };

  const handleDrop = (e: React.DragEvent, templateId: number, field: 'subject' | 'body') => {
    e.preventDefault();
    const variable = e.dataTransfer.getData('text/plain');
    if (variable.startsWith('{{')) {
      insertVariable(variable, templateId, field);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const runAutomation = async (name: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      showMessage(`${name} ejecutado exitosamente`);
    } catch (err) {
      showError(err instanceof ApiError ? err.data.message : `Error al ejecutar ${name}`);
    }
  };

  const MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5 MB
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFileError, setImportFileError] = useState('');

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (ext !== 'csv') { setImportFileError('Solo se permiten archivos .csv'); setImportFile(null); return; }
      if (file.size > MAX_IMPORT_SIZE) { setImportFileError(`El archivo excede el límite de ${MAX_IMPORT_SIZE / 1024 / 1024} MB.`); setImportFile(null); return; }
    }
    setImportFileError('');
    setImportFile(file);
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      await importApi.importTasks(importFile);
      showMessage('Importación completada exitosamente');
      setImportFile(null);
    } catch (err) {
      showError(err instanceof ApiError ? err.data.message : 'Error en la importación');
    }
  };

  const [togglingRoleId, setTogglingRoleId] = useState<number | null>(null);

  const handleToggleRole = async (role: RoleInfo) => {
    setTogglingRoleId(role.id);
    try {
      const res = await rolesApi.toggleActive(role.id);
      showMessage(res.message);
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? res.role : r)),
      );
    } catch (err) {
      showError(err instanceof ApiError ? err.data.message : 'Error al cambiar el estado del rol');
    } finally {
      setTogglingRoleId(null);
    }
  };

  const tabs = [
    { key: 'settings' as const, label: 'Configuración', icon: <HiOutlineCog className="h-4 w-4" /> },
    { key: 'templates' as const, label: 'Plantillas', icon: <HiOutlineMail className="h-4 w-4" /> },
    { key: 'roles' as const, label: 'Roles', icon: <HiOutlineUsers className="h-4 w-4" /> },
    { key: 'automation' as const, label: 'Automatización', icon: <HiOutlineLightningBolt className="h-4 w-4" /> },
    { key: 'import' as const, label: 'Importar', icon: <HiOutlineUpload className="h-4 w-4" /> },
  ];

  return (
    <PageTransition>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Configuración del Sistema</h2>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-sm bg-white dark:bg-cyber-grafito p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{confirmAction.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{confirmAction.description}</p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-sm px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAction.onConfirm}
                  className="rounded-sm bg-cyber-radar px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98]"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <SlideDown>
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" /> {message}
            </div>
          </SlideDown>
        )}
        {error && (
          <SlideDown>
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          </SlideDown>
        )}
      </AnimatePresence>

      <div className="mb-6 flex gap-1 rounded-sm bg-slate-100 dark:bg-white/10 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative inline-flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 py-2.5 sm:px-4 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="settings-tab"
                className="absolute inset-0 rounded-lg bg-white dark:bg-cyber-grafito shadow-sm text-slate-900 dark:text-white"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">{tab.icon} <span className="hidden sm:inline">{tab.label}</span></span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                drafts={drafts}
                updateDraft={updateDraft}
                hasPendingChanges={hasPendingChanges}
                saving={saving}
                onSave={saveAllSettings}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesTab
                templates={templates}
                templateDrafts={templateDrafts}
                updateTemplateDraft={updateTemplateDraft}
                hasPendingTemplateDrafts={hasPendingTemplateDrafts}
                saving={saving}
                savingTemplateId={savingTemplateId}
                confirmingTemplateId={confirmingTemplateId}
                setConfirmingTemplateId={setConfirmingTemplateId}
                saveTemplate={saveTemplate}
                discardTemplateDraft={discardTemplateDraft}
                saveAllTemplates={saveAllTemplates}
                insertVariable={insertVariable}
                lastFocusedRef={lastFocusedRef}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
              />
            )}

            {activeTab === 'roles' && (
              <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
                <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Gestión de Roles</h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Activa o desactiva los roles configurables del sistema. Los roles no configurables no pueden modificarse.
                </p>

                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between rounded-sm border px-4 py-3 transition-colors ${
                        role.is_active
                          ? 'border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito'
                          : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 dark:bg-white/10">
                          <HiOutlineUsers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${role.is_active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                              {role.name}
                            </p>
                            <Badge variant={role.is_active ? 'green' : 'red'} size="sm">
                              {role.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {!role.is_configurable && (
                              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                No configurable
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {role.slug} · {role.users_count} usuario{role.users_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {role.is_configurable && (
                        <button
                          type="button"
                          onClick={() => handleToggleRole(role)}
                          disabled={togglingRoleId === role.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                            role.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'
                          }`}
                        >
                          {togglingRoleId === role.id ? (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Spinner size="sm" />
                            </span>
                          ) : (
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-cyber-grafito shadow transition-transform ${
                                role.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </FadeIn>
            )}

            {activeTab === 'automation' && (
              <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Ejecutar procesos manualmente</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Detección de vencidas', fn: automationApi.detectOverdue, desc: 'Marca como vencidas las tareas pasadas de fecha', icon: '⏰' },
                    { name: 'Resumen diario', fn: automationApi.sendDailySummary, desc: 'Genera resúmenes consolidados por responsable', icon: '📊' },
                    { name: 'Recordatorios', fn: automationApi.sendDueReminders, desc: 'Envía recordatorios de tareas próximas a vencer', icon: '🔔' },
                    { name: 'Detección de inactividad', fn: automationApi.detectInactive, desc: 'Detecta tareas sin avance y envía alertas', icon: '⚠️' },
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => runAutomation(item.name, item.fn)}
                      className="rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 px-4 py-4 text-left text-sm transition-all hover:border-cyber-radar/10 dark:hover:border-cyber-radar/20 hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 active:scale-[0.98]"
                    >
                      <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-white"><span>{item.icon}</span> {item.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </FadeIn>
            )}

            {activeTab === 'import' && (
              <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Importar tareas desde CSV</h3>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Sube un archivo CSV con columnas: titulo, descripcion, responsable_email, area, prioridad, estado, fecha_inicio, fecha_limite.
                </p>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportFileChange}
                    className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyber-radar/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyber-radar hover:file:bg-cyber-radar/10"
                  />
                  {importFileError && <p className="text-sm text-red-500 dark:text-red-400">{importFileError}</p>}
                  <p className="text-xs text-slate-400 dark:text-slate-500">Máx. 5 MB. Solo archivos .csv</p>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!importFile}
                    className="rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    Importar
                  </button>
                </div>
              </FadeIn>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </PageTransition>
  );
}

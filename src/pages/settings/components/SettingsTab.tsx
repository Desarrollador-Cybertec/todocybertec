import type { SystemSetting } from '../../../types';
import { FadeIn } from '../../../components/ui';

const SETTING_LABELS: Record<string, string> = {
  daily_summary_time: 'Hora del resumen diario',
  detect_overdue_time: 'Hora de detección de vencidas',
  inactivity_alert_time: 'Hora de alerta de inactividad',
  send_reminders_time: 'Hora de envío de recordatorios',
  alert_days_before_due: 'Días de anticipación para alertas',
  daily_summary_enabled: 'Resumen diario activado',
  detect_overdue_enabled: 'Detección de vencidas activada',
  emails_enabled: 'Enviar notificaciones por correo',
  inactivity_alert_days: 'Días para alerta de inactividad',
  inactivity_alert_enabled: 'Alerta de inactividad activada',
  copy_to_manager: 'Copiar alertas al encargado de área',
};

const GROUP_LABELS: Record<string, string> = {
  automation: 'Automatización',
  notifications: 'Notificaciones',
  general: 'General',
};

export function SettingsTab({
  settings,
  drafts,
  updateDraft,
  hasPendingChanges,
  saving,
  onSave,
}: {
  settings: SystemSetting[];
  drafts: Record<string, string>;
  updateDraft: (key: string, value: string) => void;
  hasPendingChanges: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  const settingsByGroup = settings.reduce<Record<string, SystemSetting[]>>((acc, s) => {
    const group = s.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(settingsByGroup).map(([group, groupSettings]) => (
        <FadeIn key={group} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{GROUP_LABELS[group.toLowerCase()] ?? group}</h3>
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {groupSettings.map((setting) => {
              const currentValue = drafts[setting.key] ?? setting.value;
              const isModified = setting.key in drafts;
              return (
                <div key={setting.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${isModified ? 'font-semibold text-cyber-radar dark:text-cyber-radar-light' : 'font-medium text-slate-900 dark:text-white'}`}>{SETTING_LABELS[setting.key] ?? setting.key}</p>
                    {setting.description && <p className="text-xs text-slate-400 dark:text-slate-500">{setting.description}</p>}
                  </div>
                  {setting.type === 'boolean' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const newVal = currentValue === 'true' ? 'false' : 'true';
                        updateDraft(setting.key, newVal);
                      }}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-all active:scale-[0.96] ${
                        currentValue === 'true'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {currentValue === 'true' ? 'Activo' : 'Inactivo'}
                    </button>
                  ) : (
                    <input
                      type={setting.type === 'integer' ? 'number' : 'text'}
                      value={currentValue}
                      onChange={(e) => updateDraft(setting.key, e.target.value)}
                      className={`w-40 rounded-lg border px-3 py-1 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 ${
                        isModified ? 'border-cyber-radar dark:border-cyber-radar bg-cyber-radar/5/50 dark:bg-cyber-radar/20/20 text-slate-900 dark:text-white' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      ))}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={!hasPendingChanges || saving}
          className="rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

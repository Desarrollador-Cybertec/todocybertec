import { automationApi } from '../../../api/settings';
import { FadeIn } from '../../../components/ui';

interface AutomationTabProps {
  onRunAutomation: (name: string, fn: () => Promise<unknown>) => void;
}

const AUTOMATION_ITEMS = [
  { name: 'Detección de vencidas', fn: automationApi.detectOverdue, desc: 'Marca como vencidas las tareas pasadas de fecha', icon: '⏰' },
  { name: 'Resumen diario', fn: automationApi.sendDailySummary, desc: 'Genera resúmenes consolidados por responsable', icon: '📊' },
  { name: 'Recordatorios', fn: automationApi.sendDueReminders, desc: 'Envía recordatorios de tareas próximas a vencer', icon: '🔔' },
  { name: 'Detección de inactividad', fn: automationApi.detectInactive, desc: 'Detecta tareas sin avance y envía alertas', icon: '⚠️' },
];

export function AutomationTab({ onRunAutomation }: AutomationTabProps) {
  return (
    <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Ejecutar procesos manualmente</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {AUTOMATION_ITEMS.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onRunAutomation(item.name, item.fn)}
            className="rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 px-4 py-4 text-left text-sm transition-all hover:border-cyber-radar/10 dark:hover:border-cyber-radar/20 hover:bg-cyber-radar/5 dark:hover:bg-cyber-radar/20 active:scale-[0.98]"
          >
            <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-white"><span>{item.icon}</span> {item.name}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
          </button>
        ))}
      </div>
    </FadeIn>
  );
}

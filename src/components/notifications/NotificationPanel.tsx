import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/useNotifications';
import type { Notification, NotificationType } from '../../types/notification';
import { NOTIFICATION_CONFIG } from '../../types/notification';
import { HiOutlineCheck } from 'react-icons/hi';
import { formatDateTime } from '../../utils';

interface NotificationPanelProps {
  onClose: () => void;
}

type TabKey = 'all' | 'organizational' | 'personal';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'organizational', label: 'Organización' },
  { key: 'personal', label: 'Personal' },
];

function filterByTab(notifications: Notification[], tab: TabKey): Notification[] {
  if (tab === 'all') return notifications;
  if (tab === 'organizational')
    return notifications.filter(
      (n) => n.data.category === 'organizational' || n.data.category === 'summary'
    );
  return notifications.filter((n) => n.data.category === 'personal');
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  // Cargar notificaciones frescas cada vez que el panel se abre
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = filterByTab(notifications, activeTab);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read_at) {
        await markAsRead(notification.id);
      }

      const slug = notification.data.type;
      if (slug === 'inactivity_alert' || slug === 'daily_summary') {
        navigate('/tasks');
      } else if (notification.data.task_id) {
        navigate(`/tasks/${notification.data.task_id}`);
      }

      onClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getIconConfig = (type: NotificationType) =>
    NOTIFICATION_CONFIG[type] ?? {
      emoji: '🔔',
      label: 'Notificación',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 dark:bg-cyber-grafito/20',
    };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100%', maxHeight: 'inherit' }}>
      {/* Encabezado */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Notificaciones
        </h3>
        {notifications.some((n) => !n.read_at) && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light hover:text-cyber-radar dark:hover:text-cyber-radar-light transition-colors"
            title="Marcar todas como leídas"
          >
            <HiOutlineCheck className="h-5 w-5" />
            Marcar todas
          </button>
        )}
      </div>

      {/* Pestañas de categoría */}
      <div className="flex border-b border-slate-200 dark:border-white/10 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
              activeTab === tab.key
                ? 'text-cyber-radar dark:text-cyber-radar-light border-b-2 border-cyber-radar dark:border-cyber-radar-light'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de notificaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
            <p className="text-sm">Cargando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
            <p className="text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((notification) => {
              const iconConfig = getIconConfig(notification.data.type);
              const isUnread = !notification.read_at;

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  className={`p-4 cursor-pointer transition-colors ${
                    isUnread
                      ? iconConfig.bgColor
                      : 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl shrink-0 pt-1">
                      {iconConfig.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm text-slate-900 dark:text-white ${
                            isUnread ? 'font-bold' : 'font-medium text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {iconConfig.label}
                        </h4>
                        {isUnread && (
                          <div className="shrink-0 w-2 h-2 bg-cyber-radar rounded-full mt-1" />
                        )}
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${isUnread ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {notification.data.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie de página */}
      <div className="border-t border-slate-200 dark:border-white/10 p-3">
        <button
          onClick={() => {
            navigate('/notifications');
            onClose();
          }}
          className="w-full py-2 px-3 text-sm font-medium text-center text-cyber-radar dark:text-cyber-radar-light hover:bg-cyber-radar/5 dark:hover:bg-white/5 rounded-md transition-colors"
        >
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
}

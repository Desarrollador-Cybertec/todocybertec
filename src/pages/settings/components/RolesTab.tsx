import { HiOutlineUsers } from 'react-icons/hi';
import { FadeIn, Badge, Spinner } from '../../../components/ui';
import type { RoleInfo } from '../../../types';

interface RolesTabProps {
  roles: RoleInfo[];
  togglingRoleId: number | null;
  onToggleRole: (role: RoleInfo) => void;
}

export function RolesTab({ roles, togglingRoleId, onToggleRole }: RolesTabProps) {
  return (
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
                <HiOutlineUsers className="h-5 w-5 text-slate-500 dark:text-slate-400" />
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
                onClick={() => onToggleRole(role)}
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
  );
}

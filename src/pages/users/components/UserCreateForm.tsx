import type { UseFormReturn } from 'react-hook-form';
import type { CreateUserFormData } from '../../../schemas';
import type { RoleInfo } from '../../../types';
import { Role } from '../../../types/enums';
import { SlideDown, Spinner } from '../../../components/ui';

interface Props {
  form: UseFormReturn<CreateUserFormData>;
  roles: RoleInfo[];
  onSubmit: (data: CreateUserFormData) => void;
  onCancel: () => void;
}

export function UserCreateForm({ form, roles, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  return (
    <SlideDown className="mb-6">
      <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Crear usuario</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre *</label>
              <input id="name" {...register('name')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
              {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo *</label>
              <input id="email" type="email" {...register('email')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
              {errors.email && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña *</label>
              <input id="password" type="password" autoComplete="new-password" {...register('password')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
              {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar contraseña *</label>
              <input id="password_confirmation" type="password" autoComplete="new-password" {...register('password_confirmation')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password_confirmation.message}</p>}
            </div>
            <div>
              <label htmlFor="role_id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Rol *</label>
              <select id="role_id" {...register('role_id', { valueAsNumber: true })} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20">
                <option value="">Seleccionar rol</option>
                {roles
                  .filter((r) => r.is_active && r.slug !== Role.SUPERADMIN)
                  .map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
              </select>
              {errors.role_id && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.role_id.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2 text-sm font-medium text-white hover:bg-cyber-radar-light disabled:opacity-50">
              {isSubmitting ? <><Spinner size="sm" /> Creando...</> : 'Crear'}
            </button>
            <button type="button" onClick={onCancel} className="rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </SlideDown>
  );
}

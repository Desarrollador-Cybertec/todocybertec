import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/useAuth';
import { usersApi } from '../../api/users';
import { ApiError } from '../../api/client';
import { updateUserSchema, type UpdateUserFormData } from '../../schemas';
import { ROLE_LABELS } from '../../types/enums';
import { PageTransition, FadeIn } from '../../components/ui';
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name ?? '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;
    setServerError('');
    setSuccess('');
    try {
      const payload: Record<string, string> = {
        name: data.name,
      };
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
        payload.password_confirmation = data.password_confirmation ?? '';
      }
      const updated = await usersApi.update(user.id, payload);
      setUser(updated);
      setSuccess('Perfil actualizado correctamente');
      reset({ name: updated.name, password: '', password_confirmation: '' });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.data.message : 'Error al actualizar el perfil');
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg">
        <FadeIn className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mi perfil</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actualiza tu nombre o contraseña.</p>
        </FadeIn>

        {/* Avatar + role card */}
        <FadeIn delay={0.05} className="mb-6 flex items-center gap-4 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyber-radar text-xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            {user?.role && (
              <span className="mt-1 inline-block rounded-full bg-cyber-radar/10 dark:bg-cyber-radar/10 px-2.5 py-0.5 text-xs font-medium text-cyber-radar dark:text-cyber-radar-light ring-1 ring-cyber-radar/20 dark:ring-cyber-radar/30/60">
                {ROLE_LABELS[user.role.slug]}
              </span>
            )}
          </div>
        </FadeIn>

        {/* Form */}
        <FadeIn delay={0.1} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm">
          {serverError && (
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
              <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
              {serverError}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
              <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                <HiOutlineUser className="mb-0.5 mr-1 inline h-5 w-5 text-slate-400 dark:text-slate-500" />
                Nombre
              </label>
              <input
                {...register('name')}
                className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>

            <div className="bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">Deja en blanco si no quieres cambiar la contraseña.</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <HiOutlineLockClosed className="mb-0.5 mr-1 inline h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <HiOutlineLockClosed className="mb-0.5 mr-1 inline h-5 w-5 text-slate-400 dark:text-slate-500" />
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    {...register('password_confirmation')}
                    placeholder="••••••••"
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.password_confirmation.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyber-radar/25 transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </FadeIn>
      </div>
    </PageTransition>
  );
}

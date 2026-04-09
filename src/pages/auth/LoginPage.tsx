import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineExclamationCircle } from 'react-icons/hi';
import { useAuth } from '../../context/useAuth';
import { loginSchema, type LoginFormData } from '../../schemas';
import { ApiError } from '../../api/client';
import { Spinner } from '../../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [licenseError, setLicenseError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    setLicenseError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        const licType = error.licenseType;

        // Validation errors (422) — show in field
        if (error.status === 422 && error.data.errors?.email) {
          setError('email', { message: error.data.errors.email[0] });
          return;
        }

        // License expired or suspended — form-level message (no field)
        if (licType === 'license_expired' || licType === 'license_suspended') {
          setLicenseError(error.data.message);
          return;
        }

        // License unavailable — toast, allow retry
        if (licType === 'license_unavailable') {
          sileo.error({
            title: 'Servicio no disponible',
            description: error.data.message,
          });
          return;
        }

        setServerError(error.data.message || 'Credenciales incorrectas');
      } else {
        setServerError('Error de conexión. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="login-dot-grid flex min-h-screen items-center justify-center bg-slate-50 dark:bg-cyber-deep px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sm bg-cyber-navy shadow-lg shadow-cyber-navy/30"
          >
            <img src="/isotipo.png" alt="S!NTyC" className="h-10 w-10" />
          </motion.div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-cyber-navy dark:text-white">S!NTyC</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Sistema Integral de Tareas y Compromisos</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-300 dark:text-slate-600">Plataforma Cybertec</p>
        </div>

        <div className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/40">
          <h2 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-cyber-radar">Iniciar sesión</h2>

          <AnimatePresence mode="wait">
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
                  <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
                  {serverError}
                </div>
              </motion.div>
            )}
            {licenseError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-sm bg-orange-50 dark:bg-orange-900/30 p-3 text-sm text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-200 dark:ring-orange-800">
                  <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
                  {licenseError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Correo electrónico
              </label>
              <div className="relative">
                <HiOutlineMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Contraseña
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-cyber-radar/25 transition-all hover:bg-cyber-radar-light hover:shadow-xl hover:shadow-cyber-radar/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-0 border-t border-slate-100 dark:border-white/5 pt-4">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-white/25">Powered by</p>
            <img src="/logotipo.png" alt="S!NTyC" className="-mt-2 h-30 w-auto opacity-50 dark:opacity-40 brightness-0 dark:brightness-100" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

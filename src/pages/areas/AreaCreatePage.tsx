import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { createAreaSchema, type CreateAreaFormData } from '../../schemas';
import { areasApi } from '../../api/areas';
import { usersApi } from '../../api/users';
import { ApiError } from '../../api/client';
import { useLicense } from '../../context/useLicense';
import { sileo } from 'sileo';
import type { User } from '../../types';
import { ADMIN_ROLES, MANAGER_ROLES } from '../../types/enums';
import { HiOutlineArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi';
import { DEFAULT_ICON_KEY } from '../../utils/areaIconDefs';
import { AreaIconPicker } from './components/AreaIconPicker';
import { PageTransition, FadeIn, SlideDown, Spinner, ConfirmModal } from '../../components/ui';
import { useNavigationGuard } from '../../utils/useNavigationGuard';

export function AreaCreatePage() {
  const navigate = useNavigate();
  const license = useLicense();
  const [serverError, setServerError] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateAreaFormData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON_KEY);

  useEffect(() => {
    usersApi.listAll().then((res) => setUsers(res)).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<CreateAreaFormData>({
    resolver: zodResolver(createAreaSchema),
  });

  const navGuard = useNavigationGuard(isDirty && !isSubmitting);

  const onSubmit = async (data: CreateAreaFormData) => {
    setPendingFormData(data);
    setShowCreateModal(true);
  };

  const doCreate = async () => {
    if (!pendingFormData) return;
    setShowCreateModal(false);
    setServerError('');
    try {
      await areasApi.create({
        ...pendingFormData,
        description: pendingFormData.description || undefined,
        process_identifier: pendingFormData.process_identifier || undefined,
        manager_user_id: pendingFormData.manager_user_id || undefined,
        icon_key: selectedIcon,
      });
      navGuard.skip();
      navigate('/areas');
    } catch (error) {
      if (error instanceof ApiError && error.isLicenseError) {
        const lt = error.licenseType!;
        if (lt === 'license_expired') {
          license.setExpired(error.data.message);
        } else if (lt === 'license_suspended') {
          license.setSuspended(error.data.message);
        } else {
          sileo.error({ title: 'Servicio no disponible', description: error.data.message });
        }
        return;
      }
      setServerError(error instanceof ApiError ? error.data.message : 'Error al crear el área');
    } finally {
      setPendingFormData(null);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <button type="button" onClick={() => navigate('/areas')} className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">
          <HiOutlineArrowLeft className="h-5 w-5" /> Volver a áreas
        </button>

        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Nueva Área</h2>

        <AnimatePresence>
          {serverError && (
            <SlideDown>
              <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
                <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
                {serverError}
              </div>
            </SlideDown>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre *</label>
              <input id="name" {...register('name')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
              {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
              <textarea id="description" rows={3} {...register('description')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
            </div>
            <div>
              <label htmlFor="process_identifier" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Identificador de proceso</label>
              <input id="process_identifier" {...register('process_identifier')} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20" />
            </div>
            <div>
              <AreaIconPicker value={selectedIcon} onChange={setSelectedIcon} />
            </div>
            <div>
              <label htmlFor="manager_user_id" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Encargado</label>
              <select id="manager_user_id" {...register('manager_user_id', { setValueAs: (v: string) => v ? Number(v) : null })} className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20">
                <option value="">Sin encargado</option>
                {users.filter((u) => [...ADMIN_ROLES, ...MANAGER_ROLES].includes(u.role.slug)).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </FadeIn>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowLeaveModal(true)} className="rounded-sm bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50">
              {isSubmitting ? <><Spinner size="sm" /> Creando...</> : 'Crear área'}
            </button>
          </div>
        </form>

        <ConfirmModal
          open={showLeaveModal || navGuard.isBlocked}
          title="¿Salir sin guardar?"
          message="Los datos ingresados se perderán. ¿Estás seguro de que deseas salir?"
          confirmLabel="Salir"
          cancelLabel="Seguir editando"
          variant="danger"
          onConfirm={() => { if (navGuard.isBlocked) navGuard.confirm(); else navigate('/areas'); }}
          onCancel={() => { setShowLeaveModal(false); navGuard.cancel(); }}
        />
        <ConfirmModal
          open={showCreateModal}
          title="Confirmar creación"
          message="¿Crear esta área?"
          confirmLabel="Crear área"
          cancelLabel="Revisar"
          variant="primary"
          onConfirm={doCreate}
          onCancel={() => { setShowCreateModal(false); setPendingFormData(null); }}
        />
      </div>
    </PageTransition>
  );
}

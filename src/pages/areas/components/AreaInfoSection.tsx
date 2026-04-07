import { useEffect, useState, useCallback } from 'react';
import { areasApi } from '../../../api/areas';
import { usersApi } from '../../../api/users';
import { ApiError } from '../../../api/client';
import { Role, ADMIN_ROLES, MANAGER_ROLES } from '../../../types/enums';
import type { Area, User } from '../../../types';
import { HiOutlineCheckCircle, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import { FadeIn, SlideDown, Badge, SkeletonDetail, Spinner } from '../../../components/ui';

interface AreaInfoSectionProps {
  areaId: number;
  userRole: string;
  refreshKey: number;
  onDelete?: () => void;
}

export function AreaInfoSection({ areaId, userRole, refreshKey, onDelete }: AreaInfoSectionProps) {
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [managerCandidates, setManagerCandidates] = useState<User[]>([]);
  const [showManagerSelect, setShowManagerSelect] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [managerSaving, setManagerSaving] = useState(false);
  const [managerMsg, setManagerMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isSuperadmin = ADMIN_ROLES.includes(userRole as typeof Role[keyof typeof Role]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [areaRes, usersRes] = await Promise.all([
        areasApi.get(areaId),
        isSuperadmin ? usersApi.listAll().catch(() => [] as User[]) : Promise.resolve([] as User[]),
      ]);
      setArea(areaRes);
      setManagerCandidates(
        usersRes.filter((u) => u.role.slug && MANAGER_ROLES.includes(u.role.slug) && u.active),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [areaId, isSuperadmin]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleAssignManager = async () => {
    if (!selectedManagerId) return;
    setManagerSaving(true);
    try {
      await areasApi.assignManager(areaId, Number(selectedManagerId));
      setManagerMsg('Encargado asignado');
      setShowManagerSelect(false);
      setSelectedManagerId('');
      load();
      setTimeout(() => setManagerMsg(''), 3000);
    } catch (err) {
      setManagerMsg(err instanceof ApiError ? err.data.message : 'Error al asignar encargado');
    } finally {
      setManagerSaving(false);
    }
  };

  const handleDeleteArea = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await areasApi.delete(areaId);
      onDelete?.();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.data.message : 'Error al eliminar el área');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonDetail />;
  if (error || !area) {
    return (
      <div className="rounded-sm border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
        Error al cargar la información del área.
        <button type="button" onClick={load} className="ml-2 underline hover:text-red-800 dark:hover:text-red-200">Reintentar</button>
      </div>
    );
  }

  return (
    <FadeIn className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{area.name}</h2>
          {area.description && <p className="mt-2 text-slate-600 dark:text-slate-400">{area.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={area.active ? 'green' : 'red'} size="md">{area.active ? 'Activa' : 'Inactiva'}</Badge>
          {isSuperadmin && (
            confirmDelete ? (
              <div className="flex items-center gap-2 rounded-sm border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5">
                <span className="text-xs text-red-700 dark:text-red-400">¿Eliminar área?</span>
                <button
                  type="button"
                  onClick={handleDeleteArea}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? <Spinner size="sm" /> : null} Sí, eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-sm px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setConfirmDelete(true); setDeleteError(''); }}
                className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <HiOutlineTrash className="h-3.5 w-3.5" /> Eliminar
              </button>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {deleteError && (
          <SlideDown>
            <div className="mt-3 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-2 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" /> {deleteError}
            </div>
          </SlideDown>
        )}
      </AnimatePresence>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Encargado</p>
          <div className="mt-1 flex items-center gap-2">
            {area.manager ? (
              <>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-xs font-medium text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light">{area.manager.name.charAt(0)}</span>
                <p className="text-sm text-slate-900 dark:text-white">{area.manager.name}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin asignar</p>
            )}
            {isSuperadmin && (
              <button
                type="button"
                onClick={() => {
                  setShowManagerSelect(!showManagerSelect);
                  setSelectedManagerId(area.manager_user_id ? String(area.manager_user_id) : area.manager?.id ? String(area.manager.id) : '');
                }}
                className="rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showManagerSelect ? 'Cancelar' : area.manager ? 'Cambiar' : 'Asignar'}
              </button>
            )}
          </div>
          <AnimatePresence>
            {showManagerSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="flex-1 rounded-lg bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-3 py-1.5 text-sm focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  >
                    <option value="">— Seleccionar —</option>
                    {managerCandidates.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignManager}
                    disabled={!selectedManagerId || managerSaving}
                    className="inline-flex items-center gap-1 rounded-lg bg-cyber-navy px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-cyber-navy-light disabled:opacity-50"
                  >
                    {managerSaving ? <Spinner size="sm" /> : null}
                    Asignar
                  </button>
                </div>
                {managerMsg && (
                  <p className="mt-1.5 text-xs font-medium text-green-600 dark:text-green-400">{managerMsg}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {area.process_identifier && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Proceso</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-white">{area.process_identifier}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {managerMsg && !showManagerSelect && (
          <SlideDown>
            <div className="mt-3 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 p-2 text-sm text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" /> {managerMsg}
            </div>
          </SlideDown>
        )}
      </AnimatePresence>
    </FadeIn>
  );
}

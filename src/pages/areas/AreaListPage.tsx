import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, m } from 'framer-motion';
import { areasApi } from '../../api/areas';
import { useAuth } from '../../context/useAuth';
import { useLicense } from '../../context/useLicense';
import { ADMIN_ROLES } from '../../types/enums';
import { ApiError } from '../../api/client';
import { updateAreaSchema, type UpdateAreaFormData } from '../../schemas';
import type { Area } from '../../types';
import { HiOutlinePlus, HiOutlineUserGroup, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { PageTransition, StaggerList, StaggerItem, EmptyState, SkeletonCard, Badge, ConfirmModal, Spinner } from '../../components/ui';
import { AreaIconDisplay } from '../../utils/areaIcons';
import { DEFAULT_ICON_KEY } from '../../utils/areaIconDefs';
import { AreaIconPicker } from './components/AreaIconPicker';

export function AreaListPage() {
  const { user } = useAuth();
  const license = useLicense();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editIconKey, setEditIconKey] = useState(DEFAULT_ICON_KEY);
  const [deletingArea, setDeletingArea] = useState<Area | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isSuperAdmin = user?.role.slug ? ADMIN_ROLES.includes(user.role.slug) : false;

  const editForm = useForm<UpdateAreaFormData>({
    resolver: zodResolver(updateAreaSchema),
  });

  const loadAreas = () => {
    areasApi.listAll()
      .then((res) => setAreas(res))
      .catch(() => setAreas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const openEdit = (area: Area) => {
    setEditingArea(area);
    setEditError('');
    setEditIconKey(area.icon_key ?? DEFAULT_ICON_KEY);
    editForm.reset({
      name: area.name,
      description: area.description ?? '',
      process_identifier: area.process_identifier ?? '',
      active: area.active,
    });
  };

  const saveEdit = async (data: UpdateAreaFormData) => {
    if (!editingArea) return;
    setEditSaving(true);
    setEditError('');
    try {
      await areasApi.update(editingArea.id, { ...data, icon_key: editIconKey });
      setEditingArea(null);
      loadAreas();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.data.message : 'Error al actualizar el área');
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingArea) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await areasApi.delete(deletingArea.id);
      setDeletingArea(null);
      loadAreas();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.data.message : 'Error al eliminar el área');
      setDeletingArea(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Áreas</h2>
        {isSuperAdmin && (
          license.isBlocked ? (
            <button
              type="button"
              disabled
              title={license.status === 'expired' ? 'Suscripción vencida' : 'Suscripción suspendida'}
              className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white shadow-sm opacity-50 cursor-not-allowed"
            >
              <HiOutlinePlus className="h-5 w-5" /> Nueva área
            </button>
          ) : (
            <Link to="/areas/create" className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
              <HiOutlinePlus className="h-5 w-5" /> Nueva área
            </Link>
          )
        )}
      </div>

      {deleteError && (
        <div className="mb-4 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
          {deleteError}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : areas.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup className="h-12 w-12" />}
          title="No hay áreas registradas"
          description="Crea una nueva área para organizar tus tareas y equipos."
          action={isSuperAdmin && !license.isBlocked ? <Link to="/areas/create" className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white hover:bg-cyber-radar-light"><HiOutlinePlus className="h-5 w-5" /> Nueva área</Link> : undefined}
        />
      ) : (
        <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <StaggerItem key={area.id}>
              <div className="relative block rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm transition-all hover:shadow-md hover:border-cyber-radar/10 dark:hover:border-cyber-radar/20">
                {isSuperAdmin && (
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); openEdit(area); }}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Editar área"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setDeleteError(''); setDeletingArea(area); }}
                      className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                      title="Eliminar área"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <Link to={`/areas/${area.id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-linear-to-br from-cyber-radar/5 dark:from-cyber-radar/20 to-cyber-navy/5 dark:to-cyber-navy/20">
                      <AreaIconDisplay iconKey={area.icon_key} className="h-6 w-6 text-cyber-radar dark:text-cyber-radar-light" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{area.name}</h3>
                      <Badge variant={area.active ? 'green' : 'red'} size="sm">{area.active ? 'Activa' : 'Inactiva'}</Badge>
                    </div>
                  </div>
                  {area.description && <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{area.description}</p>}
                  <div className="mt-4 flex items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      {area.manager ? (
                        <>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-[10px] font-medium text-cyber-navy dark:text-cyber-radar-light">{area.manager.name.charAt(0)}</span>
                          <span>{area.manager.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Sin encargado</span>
                      )}
                    </div>
                    {area.members_count != null && (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <HiOutlineUserGroup className="h-5 w-5" />
                        {area.members_count} Empleado{area.members_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {area.process_identifier && (
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Proceso: {area.process_identifier}</p>
                  )}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editingArea && (
          <m.div
            key="edit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setEditingArea(null)}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-sm bg-white dark:bg-cyber-grafito p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar área</h3>
                <button type="button" onClick={() => setEditingArea(null)} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                  <HiOutlineX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={editForm.handleSubmit(saveEdit)} className="space-y-4">
                <div>
                  <AreaIconPicker value={editIconKey} onChange={setEditIconKey} />
                </div>
                <div>
                  <label htmlFor="areaEditName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                  <input
                    id="areaEditName"
                    type="text"
                    {...editForm.register('name')}
                    className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-4 py-2.5 text-sm text-slate-900 dark:text-white transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                  {editForm.formState.errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{editForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="areaEditDesc" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                  <textarea
                    id="areaEditDesc"
                    {...editForm.register('description')}
                    rows={3}
                    className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-4 py-2.5 text-sm text-slate-900 dark:text-white transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="areaEditProcess" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Identificador de proceso</label>
                  <input
                    id="areaEditProcess"
                    type="text"
                    {...editForm.register('process_identifier')}
                    className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-4 py-2.5 text-sm text-slate-900 dark:text-white transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                </div>
                <div className="flex items-center justify-between rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado del área</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{editForm.watch('active') ? 'El área está activa' : 'El área está inactiva'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => editForm.setValue('active', !editForm.watch('active'))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editForm.watch('active') ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editForm.watch('active') ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {editError && <p className="text-sm text-red-500 dark:text-red-400">{editError}</p>}
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setEditingArea(null)} className="rounded-sm px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                    Cancelar
                  </button>
                  <button type="submit" disabled={editSaving} className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50">
                    {editSaving ? <><Spinner size="sm" /> Guardando...</> : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <ConfirmModal
        open={!!deletingArea}
        title="Eliminar área"
        message={`¿Estás seguro de que deseas eliminar el área "${deletingArea?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel={deleteLoading ? 'Eliminando...' : 'Sí, eliminar'}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingArea(null)}
      />
    </PageTransition>
  );
}

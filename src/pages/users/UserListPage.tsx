import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence } from 'framer-motion';
import { usersApi } from '../../api/users';
import { areasApi } from '../../api/areas';
import { createUserSchema, type CreateUserFormData } from '../../schemas';
import { ROLE_LABELS, Role, WORKER_ROLES } from '../../types/enums';
import { rolesApi } from '../../api/roles';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';
import { useLicense } from '../../context/useLicense';
import { handleLicenseError } from '../../utils/handleLicenseError';
import type { User, Area, RoleInfo } from '../../types';
import { HiOutlinePlus, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlinePencil, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { PageTransition, FadeIn, SlideDown, SkeletonTable, Badge } from '../../components/ui';
import { UserEditModal } from './components/UserEditModal';
import { UserCreateForm } from './components/UserCreateForm';

const ROLE_BADGE: Record<string, 'purple' | 'blue' | 'gray'> = {
  superadmin: 'purple',
  gerente: 'purple',
  area_manager: 'blue',
  director: 'blue',
  leader: 'blue',
  coordinator: 'blue',
  worker: 'gray',
  analyst: 'gray',
};

const PAGE_SIZE = 10;

export function UserListPage() {
  const { user: currentUser } = useAuth();
  const license = useLicense();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = useMemo(
    () => roleFilter ? allUsers.filter((u) => u.role.slug === roleFilter) : allUsers,
    [allUsers, roleFilter],
  );
  const total = filteredUsers.length;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const users = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editOriginalRoleSlug, setEditOriginalRoleSlug] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoleId, setEditRoleId] = useState<number>(0);
  const [editAreaId, setEditAreaId] = useState<string>('');
  const [editAreaLoading, setEditAreaLoading] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, areasRes, rolesRes] = await Promise.all([
        usersApi.listAll(),
        areasApi.listAll().catch(() => []),
        rolesApi.list().catch(() => [] as RoleInfo[]),
      ]);
      setAllUsers(usersRes);
      setAreas(Array.isArray(areasRes) ? areasRes : []);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
    } catch {
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when filter changes — handled inline in setRoleFilter calls
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const showMessage = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onCreateUser = async (data: CreateUserFormData) => {
    setServerError('');
    try {
      await usersApi.create(data);
      showMessage('Usuario creado exitosamente');
      createForm.reset();
      setShowCreateForm(false);
      loadUsers();
    } catch (error) {
      if (handleLicenseError(error, license)) return;
      setServerError(error instanceof ApiError ? error.data.message : 'Error al crear usuario');
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await usersApi.toggleActive(userId);
      showMessage('Estado del usuario actualizado');
      loadUsers();
    } catch (error) {
      if (handleLicenseError(error, license)) return;
      setServerError(error instanceof ApiError ? error.data.message : 'Error al cambiar estado');
    }
  };

  const startEditing = async (u: User) => {
    // Set immediately from list data so modal opens right away
    setEditingUserId(u.id);
    setEditOriginalRoleSlug(u.role.slug);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRoleId(u.role.id);   // use nested role.id — always present
    setEditAreaId('');
    setEditActive(u.active);
    setServerError('');

    // Fetch full detail to get area_id and confirm role_id
    if (WORKER_ROLES.includes(u.role.slug)) {
      setEditAreaLoading(true);
      try {
        const full = await usersApi.get(u.id);
        setEditRoleId(full.role.id);
        setEditAreaId(full.area_id ? String(full.area_id) : '');
      } catch {
        // keep values from list
      } finally {
        setEditAreaLoading(false);
      }
    }
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const saveUserEdit = async (userId: number) => {
    setEditSaving(true);
    setServerError('');
    try {
      const currentUser = users.find((u) => u.id === userId);
      if (!currentUser) return;

      // Update user info if changed
      const updates: Record<string, string | number> = {};
      if (editName !== currentUser.name) updates.name = editName;
      if (editEmail !== currentUser.email) updates.email = editEmail;
      if (Object.keys(updates).length > 0) {
        await usersApi.update(userId, updates);
      }

      // Change role if different
      if (editRoleId !== currentUser.role_id) {
        await usersApi.changeRole(userId, editRoleId);
      }

      // Toggle active if changed
      if (editActive !== currentUser.active) {
        await usersApi.toggleActive(userId);
      }

      // Assign to area if selected
      if (editAreaId) {
        await areasApi.claimWorker({ area_id: Number(editAreaId), user_id: userId });
      }

      showMessage('Usuario actualizado');
      setEditingUserId(null);
      loadUsers();
    } catch (error) {
      if (handleLicenseError(error, license)) return;
      setServerError(error instanceof ApiError ? error.data.message : 'Error al actualizar usuario');
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async (userId: number, password: string, passwordConfirmation: string) => {
    setServerError('');
    try {
      await usersApi.changePassword(userId, { password, password_confirmation: passwordConfirmation });
      showMessage('Contraseña actualizada correctamente');
    } catch (error) {
      setServerError(error instanceof ApiError ? error.data.message : 'Error al cambiar la contraseña');
    }
  };

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Usuarios</h2>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-2 text-sm text-slate-700 dark:text-slate-300 shadow-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
          >
            <option value="">Todos los roles</option>
            {roles.filter((r) => r.is_active).map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
          <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={license.isBlocked}
          title={license.isBlocked ? (license.status === 'expired' ? 'Suscripción vencida' : 'Suscripción suspendida') : undefined}
          className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlinePlus className="h-5 w-5" /> Nuevo usuario
        </button>
        </div>
      </div>

      <AnimatePresence>
        {serverError && (
          <SlideDown>
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
              <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" /> {serverError}
            </div>
          </SlideDown>
        )}
        {successMsg && (
          <SlideDown>
            <div className="mb-4 flex items-center gap-2 rounded-sm bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-200 dark:ring-green-800">
              <HiOutlineCheckCircle className="h-5 w-5 shrink-0" /> {successMsg}
            </div>
          </SlideDown>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateForm && (
          <UserCreateForm
            form={createForm}
            roles={roles}
            areas={areas}
            onSubmit={onCreateUser}
            onCancel={() => { setShowCreateForm(false); createForm.reset(); }}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="space-y-3 sm:hidden">
            {users.map((u) => (
              <FadeIn key={u.id} className="rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyber-radar/10 dark:from-cyber-radar/20 to-cyber-navy/10 dark:to-cyber-navy/20 text-sm font-bold text-cyber-radar dark:text-cyber-radar-light">{u.name.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{u.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </div>
                  <Badge variant={u.active ? 'green' : 'red'} size="sm">{u.active ? 'Activo' : 'Inactivo'}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={ROLE_BADGE[u.role.slug] ?? 'gray'} size="sm">{ROLE_LABELS[u.role.slug]}</Badge>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(u)}
                      className="rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 p-1.5 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
                      title="Editar"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      disabled={!u.active && license.isBlocked}
                      title={!u.active && license.isBlocked ? (license.status === 'expired' ? 'Suscripción vencida' : 'Suscripción suspendida') : undefined}
                      className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${u.active ? 'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30' : 'border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Desktop table layout */}
          <FadeIn className="hidden overflow-hidden rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito shadow-sm sm:block">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Usuario</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rol</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {users.map((u) => (
                  <tr key={u.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/6">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyber-radar/15 dark:bg-cyber-radar/25 text-sm font-bold text-cyber-radar dark:text-cyber-radar-light">{u.name.charAt(0)}</span>
                        <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={ROLE_BADGE[u.role.slug] ?? 'gray'} size="sm">{ROLE_LABELS[u.role.slug]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.active ? 'green' : 'red'} size="sm">{u.active ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(u)}
                          className="rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 p-1.5 text-slate-500 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-700 dark:hover:text-white"
                          title="Editar"
                        >
                          <HiOutlinePencil className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id)}
                          disabled={!u.active && license.isBlocked}
                          title={!u.active && license.isBlocked ? (license.status === 'expired' ? 'Suscripción vencida' : 'Suscripción suspendida') : undefined}
                          className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${u.active ? 'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30' : 'border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
                        >
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </FadeIn>
        </>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} usuario{total !== 1 ? 's' : ''} en total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlineChevronLeft className="h-5 w-5" /> Anterior
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Página {page} de {lastPage}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-cyber-grafito border border-slate-200 dark:border-white/10 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit user panel */}
      <UserEditModal
        editingUserId={editingUserId}
        currentUserId={Number(currentUser?.id)}
        isSuperAdmin={currentUser?.role.slug === Role.SUPERADMIN}
        editOriginalRoleSlug={editOriginalRoleSlug}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editRoleId={editRoleId}
        setEditRoleId={setEditRoleId}
        editAreaId={editAreaId}
        setEditAreaId={setEditAreaId}
        editAreaLoading={editAreaLoading}
        editActive={editActive}
        setEditActive={(v) => setEditActive(v)}
        editSaving={editSaving}
        areas={areas}
        roles={roles}
        onCancel={cancelEditing}
        onSave={saveUserEdit}
        onChangePassword={handleChangePassword}
      />
    </PageTransition>
  );
}

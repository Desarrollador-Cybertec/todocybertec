import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineX, HiOutlineLockClosed } from 'react-icons/hi';
import { ROLE_LABELS, Role, ADMIN_ROLES } from '../../../types/enums';
import type { Area, RoleInfo } from '../../../types';
import { Spinner } from '../../../components/ui';

interface Props {
  editingUserId: number | null;
  currentUserId?: number;
  isSuperAdmin?: boolean;
  editOriginalRoleSlug: string;
  editName: string;
  setEditName: (v: string) => void;
  editEmail: string;
  setEditEmail: (v: string) => void;
  editRoleId: number;
  setEditRoleId: (v: number) => void;
  editAreaId: string;
  setEditAreaId: (v: string) => void;
  editAreaLoading: boolean;
  editActive: boolean;
  setEditActive: (v: boolean) => void;
  editSaving: boolean;
  areas: Area[];
  roles: RoleInfo[];
  onCancel: () => void;
  onSave: (userId: number) => void;
  onChangePassword?: (userId: number, password: string, passwordConfirmation: string) => void;
}

export function UserEditModal({
  editingUserId,
  currentUserId,
  isSuperAdmin,
  editOriginalRoleSlug,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editRoleId,
  setEditRoleId,
  editAreaId,
  setEditAreaId,
  editAreaLoading,
  editActive,
  setEditActive,
  editSaving,
  areas,
  roles,
  onCancel,
  onSave,
  onChangePassword,
}: Props) {
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const canChangePassword = isSuperAdmin && editingUserId != null && editingUserId !== currentUserId;
  return (
    <AnimatePresence>
      {editingUserId != null && (
        <motion.div
          key="edit-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-sm bg-white dark:bg-cyber-grafito p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar usuario</h3>
              <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-400">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  />
                </div>
              </div>

              {editOriginalRoleSlug !== Role.SUPERADMIN && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(Number(e.target.value))}
                    className="w-full rounded-sm bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20"
                  >
                    {roles
                      .filter((r) => r.is_active && r.slug !== Role.SUPERADMIN)
                      .map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado del usuario</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{editActive ? 'El usuario puede iniciar sesión' : 'El usuario está bloqueado'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    editActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-cyber-grafito shadow transition-transform ${
                      editActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {!ADMIN_ROLES.includes(editOriginalRoleSlug as typeof Role[keyof typeof Role]) && (
                <div className="rounded-sm border border-cyber-navy/10 dark:border-cyber-navy/20 bg-cyber-navy/5/50 dark:bg-cyber-navy/20/20 p-4">
                  <label className="mb-1.5 block text-sm font-semibold text-cyber-navy dark:text-cyber-radar-light">Asignar a un área</label>
                  <p className="mb-2 text-xs text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light/70">Selecciona un área para agregar a este usuario como miembro.</p>
                  {editAreaLoading ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-cyber-navy dark:text-cyber-radar-light">
                      <Spinner size="sm" /> Cargando área actual...
                    </div>
                  ) : (
                    <select
                      value={editAreaId}
                      onChange={(e) => setEditAreaId(e.target.value)}
                      className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-4 py-2.5 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 text-slate-900 dark:text-white"
                    >
                      <option value="">— Sin área —</option>
                      {areas.filter((a) => a.active).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}{a.manager ? ` (Encargado: ${a.manager.name})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {canChangePassword && (
                <div className="rounded-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiOutlineLockClosed className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cambiar contraseña</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowPasswordSection(!showPasswordSection); setNewPassword(''); setNewPasswordConfirm(''); setPasswordError(''); }}
                      className="rounded-sm px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      {showPasswordSection ? 'Cancelar' : 'Cambiar'}
                    </button>
                  </div>
                  {showPasswordSection && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Nueva contraseña</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-2 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Confirmar contraseña</label>
                        <input
                          type="password"
                          value={newPasswordConfirm}
                          onChange={(e) => { setNewPasswordConfirm(e.target.value); setPasswordError(''); }}
                          placeholder="Repite la contraseña"
                          className="w-full rounded-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-cyber-grafito px-3 py-2 text-sm transition-colors focus:border-cyber-radar focus:outline-none focus:ring-2 focus:ring-cyber-radar/20 text-slate-900 dark:text-white"
                        />
                      </div>
                      {passwordError && <p className="text-xs text-red-500 dark:text-red-400">{passwordError}</p>}
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPassword || newPassword.length < 8) { setPasswordError('Mínimo 8 caracteres'); return; }
                          if (!/[A-Z]/.test(newPassword)) { setPasswordError('Debe contener al menos una mayúscula'); return; }
                          if (!/[a-z]/.test(newPassword)) { setPasswordError('Debe contener al menos una minúscula'); return; }
                          if (!/[0-9]/.test(newPassword)) { setPasswordError('Debe contener al menos un número'); return; }
                          if (newPassword !== newPasswordConfirm) { setPasswordError('Las contraseñas no coinciden'); return; }
                          onChangePassword?.(editingUserId!, newPassword, newPasswordConfirm);
                          setShowPasswordSection(false);
                          setNewPassword('');
                          setNewPasswordConfirm('');
                        }}
                        disabled={!newPassword || !newPasswordConfirm}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-cyber-navy px-4 py-2 text-sm font-medium text-white transition-all hover:bg-cyber-navy-light disabled:opacity-50"
                      >
                        <HiOutlineLockClosed className="h-4 w-4" /> Actualizar contraseña
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 bg-white dark:bg-cyber-grafito text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-sm px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onSave(editingUserId)}
                  disabled={editSaving}
                  className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyber-radar-light active:scale-[0.98] disabled:opacity-50"
                >
                  {editSaving ? <><Spinner size="sm" /> Guardando...</> : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

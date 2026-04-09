import { useEffect, useState, useCallback } from 'react';
import { areasApi } from '../../../api/areas';
import { ApiError } from '../../../api/client';
import type { User } from '../../../types';
import { SkeletonCard } from '../../../components/ui';
import { FadeIn } from '../../../components/ui';
import { HiOutlineUsers, HiOutlineUserRemove } from 'react-icons/hi';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

interface TeamMembersSectionProps {
  areaId: number;
  refreshKey: number;
  canRemove?: boolean;
  onMemberRemoved?: () => void;
}

export function TeamMembersSection({ areaId, refreshKey, canRemove, onMemberRemoved }: TeamMembersSectionProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const users = await areasApi.membersAll(areaId);
      setMembers(users);
    } catch {
      setError(true);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleRemove = async (userId: number) => {
    setRemoveError('');
    try {
      await areasApi.removeMember(areaId, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      setRemovingId(null);
      onMemberRemoved?.();
    } catch (err) {
      setRemoveError(err instanceof ApiError ? err.data.message : 'Error al desasignar miembro');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400">
        Error al cargar los miembros del equipo.
        <button type="button" onClick={load} className="ml-2 underline hover:text-red-800 dark:hover:text-red-200">Reintentar</button>
      </div>
    );
  }

  return (
    <FadeIn delay={0.1} className="mt-6 rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <HiOutlineUsers className="h-6 w-6 text-cyber-navy dark:text-cyber-radar-light" />
          Miembros del área
        </h3>
        <span className="rounded-lg bg-cyber-navy/5 dark:bg-cyber-navy/20/30 px-2.5 py-0.5 text-xs font-semibold text-cyber-navy dark:text-cyber-radar-light">
          {members.length}
        </span>
      </div>
      {removeError && (
        <div className="mx-6 mt-4 rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800">
          {removeError}
        </div>
      )}
      {members.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No hay miembros en esta área aún.</p>
      ) : (
        <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-sm border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyber-navy to-cyber-radar text-sm font-medium text-white">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{member.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
              </div>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => setRemovingId(member.id)}
                  title="Remover miembro"
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                >
                  <HiOutlineUserRemove className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
          open={removingId !== null}
          title="Remover miembro"
          message={`¿Seguro que deseas remover a ${members.find((m) => m.id === removingId)?.name ?? 'este usuario'} del área?`}
          confirmLabel="Remover"
          variant="danger"
          onConfirm={() => removingId !== null && handleRemove(removingId)}
          onCancel={() => { setRemovingId(null); setRemoveError(''); }}
        />
    </FadeIn>
  );
}

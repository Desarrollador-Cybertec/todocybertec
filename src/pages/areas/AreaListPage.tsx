import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { areasApi } from '../../api/areas';
import { useAuth } from '../../context/useAuth';
import { Role } from '../../types/enums';
import type { Area } from '../../types';
import { HiOutlinePlus, HiOutlineUserGroup } from 'react-icons/hi';
import { PageTransition, StaggerList, StaggerItem, EmptyState, SkeletonCard, Badge } from '../../components/ui';

export function AreaListPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role.slug === Role.SUPERADMIN;

  useEffect(() => {
    areasApi.listAll()
      .then((res) => setAreas(res))
      .catch(() => setAreas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Áreas</h2>
        {isSuperAdmin && (
          <Link to="/areas/create" className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <HiOutlinePlus className="h-4 w-4" /> Nueva área
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : areas.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup className="h-12 w-12" />}
          title="No hay áreas registradas"
          description="Crea una nueva área para organizar tus tareas y equipos."
          action={isSuperAdmin ? <Link to="/areas/create" className="inline-flex items-center gap-2 rounded-sm bg-cyber-radar px-4 py-2.5 text-sm font-medium text-white hover:bg-cyber-radar-light"><HiOutlinePlus className="h-4 w-4" /> Nueva área</Link> : undefined}
        />
      ) : (
        <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <StaggerItem key={area.id}>
              <Link to={`/areas/${area.id}`} className="block rounded-sm border border-slate-200 dark:border-white/5 bg-white dark:bg-cyber-grafito p-6 shadow-sm transition-all hover:shadow-md hover:border-cyber-radar/10 dark:hover:border-cyber-radar/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-linear-to-br from-cyber-radar/5 dark:from-cyber-radar/20 to-cyber-navy/5 dark:to-cyber-navy/20">
                    <HiOutlineUserGroup className="h-5 w-5 text-cyber-radar dark:text-cyber-radar-light" />
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
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber-navy/5 dark:bg-cyber-navy/20/30 text-[10px] font-medium text-cyber-navy dark:text-cyber-radar-light dark:text-cyber-radar-light">{area.manager.name.charAt(0)}</span>
                        <span>{area.manager.name}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Sin encargado</span>
                    )}
                  </div>
                  {area.members_count != null && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <HiOutlineUserGroup className="h-3.5 w-3.5" />
                      {area.members_count} Empleado{area.members_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {area.process_identifier && (
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Proceso: {area.process_identifier}</p>
                )}
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageTransition>
  );
}
